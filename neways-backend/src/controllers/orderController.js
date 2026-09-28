const pool = require('../config/db');
const { processPayment } = require('../services/paymentService');

async function createOrder(req, res) {
  const client = await pool.connect();
  try {
    const { fullName, phone, department, municipality, address, addressReference, card } = req.body;

    if (!fullName || !phone || !department || !municipality || !address) {
      return res.status(400).json({ message: "Todos los campos de envío son obligatorios." });
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
      `SELECT ci.id AS cart_item_id, ci.quantity, v.id AS variant_id, v.stock, p.price
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id
       WHERE ci.user_id = $1
       FOR UPDATE`,
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

    const subtotal = cartResult.rows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const total = subtotal + shippingCost;

    // Procesar pago
    const paymentResult = await processPayment(card || {});
    if (!paymentResult.success) {
      await client.query("ROLLBACK");
      return res.status(402).json({ message: paymentResult.message });
    }

    // Crear orden
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, full_name, phone, department, municipality, address, address_reference, subtotal, shipping, total, payment_status, order_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pagado', 'recibido')
       RETURNING id, created_at`,
      [
        req.user.id,
        fullName,
        phone,
        department,
        municipality,
        address,
        addressReference || null,
        subtotal.toFixed(2),
        shippingCost.toFixed(2),
        total.toFixed(2)
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Insertar detalles y actualizar stock
    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
        [orderId, item.variant_id, item.quantity, item.price]
      );

      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.variant_id]
      );
    }

    // Limpiar carrito
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);

    await client.query("COMMIT");

    return res.status(201).json({
      orderId,
      subtotal: Number(subtotal.toFixed(2)),
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