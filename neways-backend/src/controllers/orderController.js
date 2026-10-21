const pool = require('../config/db');
const { processPayment } = require('../services/paymentService');
const { getActiveDiscounts, quoteCart } = require('../services/discountService');

async function createOrder(req, res) {
  const client = await pool.connect();
  try {
    const {
      fullName,
      phone,
      department,
      municipality,
      address,
      houseNumber,
      addressReference,
      latitude,
      longitude,
      card,
      couponCode,
    } = req.body;

    if (!fullName || !phone || !department || !municipality || !address) {
      return res.status(400).json({ message: "Todos los campos de envío son obligatorios." });
    }

    const hasCoordinates = latitude != null || longitude != null;
    if (hasCoordinates && (
      !Number.isFinite(latitude)
      || !Number.isFinite(longitude)
      || latitude < -90
      || latitude > 90
      || longitude < -180
      || longitude > 180
    )) {
      return res.status(400).json({ message: "Las coordenadas de envío no son válidas." });
    }

    await client.query("BEGIN");

    // Consultar el costo de envío dinámico según el departamento seleccionado
    const deptResult = await client.query(
      "SELECT shipping_cost FROM departments WHERE name = $1 AND is_active = TRUE",
      [department]
    );

    // Si el departamento no existe o no está activo, se aplica un costo predeterminado de 3.50
    const shippingCost = deptResult.rows.length > 0 ? Number(deptResult.rows[0].shipping_cost) : 3.50;

    // Consultar items del carrito con bloqueo pesimista
    const cartResult = await client.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, v.id AS variant_id, v.stock,
              v.size, v.color, p.id AS product_id, p.price,
              p.discount AS legacy_discount, p.category_id, c.name AS category_name
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ci.user_id = $1
       FOR UPDATE OF ci, v, p`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "El carrito se encuentra vacío." });
    }

    // Validar Stock
    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "Stock insuficiente para uno o más productos elegidos." });
      }
    }

    const normalizedCouponCode = String(couponCode || '').trim().toUpperCase() || null;
    let coupon = null;
    if (normalizedCouponCode) {
      const couponResult = await client.query(
        `SELECT id, name, code, scope, category_id, product_id, color, size,
                amount_type, amount, starts_at, ends_at, max_redemptions, redemption_count
         FROM discounts
         WHERE UPPER(code) = $1 AND is_active = TRUE
           AND (starts_at IS NULL OR starts_at <= NOW())
           AND (ends_at IS NULL OR ends_at > NOW())
           AND (max_redemptions IS NULL OR redemption_count < max_redemptions)
         FOR UPDATE`,
        [normalizedCouponCode]
      );
      if (couponResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "El código no existe, venció o agotó sus canjes." });
      }
      coupon = couponResult.rows[0];
    }

    const automaticDiscounts = await getActiveDiscounts(client);
    const discounts = coupon ? [...automaticDiscounts, coupon] : automaticDiscounts;
    const quote = quoteCart(cartResult.rows, discounts);
    if (coupon) {
      const automaticQuote = quoteCart(cartResult.rows, automaticDiscounts);
      if (automaticQuote.finalSubtotal <= quote.finalSubtotal) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "El código ya no aplica a los productos del carrito." });
      }
    }
    const subtotal = quote.subtotal;
    const discountTotal = quote.discountTotal;
    const total = quote.finalSubtotal + shippingCost;

    // Procesar pago
    const paymentResult = await processPayment(card || {});
    if (!paymentResult.success) {
      await client.query("ROLLBACK");
      return res.status(402).json({ message: paymentResult.message });
    }

    // Crear orden
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, full_name, phone, department, municipality, address, address_reference, house_number,
        latitude, longitude, subtotal, discount_total, coupon_code, shipping, total, payment_status, order_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pagado', 'recibido')
       RETURNING id, created_at`,
      [
        req.user.id,
        fullName,
        phone,
        department,
        municipality,
        address,
        addressReference || null,
        houseNumber || null,
        hasCoordinates ? latitude : null,
        hasCoordinates ? longitude : null,
        subtotal.toFixed(2),
        discountTotal.toFixed(2),
        coupon ? coupon.code : null,
        shippingCost.toFixed(2),
        total.toFixed(2)
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Insertar detalles y actualizar stock
    for (const item of quote.items) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
        [orderId, item.variant_id, item.quantity, item.final_price]
      );

      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.variant_id]
      );
    }

    if (coupon) {
      await client.query(
        'UPDATE discounts SET redemption_count = redemption_count + 1 WHERE id = $1',
        [coupon.id]
      );
    }

    // Limpiar carrito
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);

    await client.query("COMMIT");

    return res.status(201).json({
      orderId,
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      couponCode: coupon ? coupon.code : null,
      shipping: shippingCost,
      total: Number(total.toFixed(2)),
      transactionId: paymentResult.transactionId,
      createdAt: orderResult.rows[0].created_at
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error en createOrder:", err);
    return res.status(500).json({ message: "Error interno al procesar la orden." });
  } finally {
    client.release();
  }
}

async function getUserOrders(req, res) {
  try {
    const ordersResult = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(ordersResult.rows);
  } catch (err) {
    console.error("Error en getUserOrders:", err);
    res.status(500).json({ message: "Error al obtener las órdenes." });
  }
}

module.exports = { createOrder, getUserOrders };