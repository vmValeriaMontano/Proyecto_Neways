const pool = require('../config/db');
const { getActiveDiscounts, quoteCart } = require('../services/discountService');

const scopes = new Set(['global', 'category', 'color', 'size', 'product']);
const amountTypes = new Set(['percent', 'fixed']);

function normalizeDiscount(body) {
  const scope = body.scope;
  const amountType = body.amount_type;
  const amount = Number(body.amount);
  const name = String(body.name || '').trim();
  const code = String(body.code || '').trim().toUpperCase() || null;
  const startsAt = body.starts_at || null;
  const endsAt = body.ends_at || null;
  const maxRedemptions = body.max_redemptions === '' || body.max_redemptions == null
    ? null
    : Number(body.max_redemptions);
  const categoryId = scope === 'category' ? Number(body.category_id) : null;
  const productId = scope === 'product' ? Number(body.product_id) : null;
  const color = scope === 'color' ? String(body.color || '').trim() : null;
  const size = scope === 'size' ? String(body.size || '').trim() : null;

  if (!name || !scopes.has(scope) || !amountTypes.has(amountType)
    || !Number.isFinite(amount) || amount <= 0
    || (amountType === 'percent' && amount > 100)) {
    return { error: 'Completa el nombre y configura un descuento válido.' };
  }
  if ((scope === 'category' && !Number.isInteger(categoryId))
    || (scope === 'product' && !Number.isInteger(productId))
    || (scope === 'color' && !color)
    || (scope === 'size' && !size)) {
    return { error: 'Selecciona el objetivo del descuento.' };
  }
  if (code && !/^[A-Z0-9_-]{4,32}$/.test(code)) {
    return { error: 'El código debe tener de 4 a 32 caracteres: letras, números, guion o guion bajo.' };
  }
  if (maxRedemptions !== null && (!code || !Number.isInteger(maxRedemptions) || maxRedemptions < 1)) {
    return { error: 'El máximo de canjes debe ser un entero mayor que cero y requiere un código.' };
  }
  if ((startsAt && Number.isNaN(Date.parse(startsAt)))
    || (endsAt && Number.isNaN(Date.parse(endsAt)))
    || (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt))) {
    return { error: 'El periodo de vigencia no es válido.' };
  }

  return {
    value: {
      name, code, scope, categoryId, productId, color, size,
      amountType, amount, startsAt, endsAt, maxRedemptions,
      isActive: body.is_active !== false,
    },
  };
}

async function getAdminDiscounts(req, res) {
  try {
    const result = await pool.query(
      `SELECT d.*, c.name AS category_name, p.name AS product_name
       FROM discounts d
       LEFT JOIN categories c ON c.id = d.category_id
       LEFT JOIN products p ON p.id = d.product_id
       ORDER BY d.created_at DESC, d.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener descuentos:', err);
    res.status(500).json({ message: 'Error al obtener los descuentos.' });
  }
}

async function saveDiscount(req, res) {
  const parsed = normalizeDiscount(req.body);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const discount = parsed.value;
  const values = [
    discount.name, discount.code, discount.scope, discount.categoryId, discount.productId,
    discount.color, discount.size, discount.amountType, discount.amount, discount.startsAt,
    discount.endsAt, discount.maxRedemptions, discount.isActive,
  ];

  try {
    const result = req.params.id
      ? await pool.query(
        `UPDATE discounts
         SET name = $1, code = $2, scope = $3, category_id = $4, product_id = $5,
             color = $6, size = $7, amount_type = $8, amount = $9, starts_at = $10,
             ends_at = $11, max_redemptions = $12, is_active = $13
         WHERE id = $14
         RETURNING *`,
        [...values, req.params.id]
      )
      : await pool.query(
        `INSERT INTO discounts
           (name, code, scope, category_id, product_id, color, size, amount_type,
            amount, starts_at, ends_at, max_redemptions, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        values
      );

    if (req.params.id && result.rows.length === 0) {
      return res.status(404).json({ message: 'Descuento no encontrado.' });
    }
    res.status(req.params.id ? 200 : 201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar descuento:', err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un descuento con ese código.' });
    }
    if (err.code === '23503') {
      return res.status(400).json({ message: 'La categoría o prenda seleccionada ya no existe.' });
    }
    res.status(500).json({ message: 'Error al guardar el descuento.' });
  }
}

async function deleteDiscount(req, res) {
  try {
    const result = await pool.query(
      'UPDATE discounts SET is_active = FALSE WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Descuento no encontrado.' });
    }
    res.json({ message: 'Descuento desactivado.' });
  } catch (err) {
    console.error('Error al desactivar descuento:', err);
    res.status(500).json({ message: 'Error al desactivar el descuento.' });
  }
}

async function validateCoupon(req, res) {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ message: 'Escribe un código de descuento.' });

  try {
    const couponResult = await pool.query(
      `SELECT id, name, code, scope, category_id, product_id, color, size,
              amount_type, amount, starts_at, ends_at, max_redemptions, redemption_count
       FROM discounts
       WHERE UPPER(code) = $1 AND is_active = TRUE
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (ends_at IS NULL OR ends_at > NOW())
         AND (max_redemptions IS NULL OR redemption_count < max_redemptions)`,
      [code]
    );
    if (couponResult.rows.length === 0) {
      return res.status(400).json({ message: 'El código no existe, venció o agotó sus canjes.' });
    }

    const cartResult = await pool.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, v.id AS variant_id, v.size, v.color,
              p.id AS product_id, p.name, p.price, p.discount AS legacy_discount,
              p.category_id, c.name AS category_name, p.image_url
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: 'Agrega productos al carrito antes de aplicar el código.' });
    }

    const automaticDiscounts = await getActiveDiscounts(pool);
    const coupon = couponResult.rows[0];
    const automaticQuote = quoteCart(cartResult.rows, automaticDiscounts);
    const quote = quoteCart(cartResult.rows, [...automaticDiscounts, coupon]);
    const couponSavings = Number((automaticQuote.finalSubtotal - quote.finalSubtotal).toFixed(2));
    if (couponSavings <= 0) {
      return res.status(400).json({ message: 'Este código no aplica a los productos del carrito o no mejora el descuento actual.' });
    }

    res.json({
      code: coupon.code,
      name: coupon.name,
      ...quote,
      couponDiscount: couponSavings,
    });
  } catch (err) {
    console.error('Error al validar cupón:', err);
    res.status(500).json({ message: 'Error al validar el código de descuento.' });
  }
}

module.exports = { deleteDiscount, getAdminDiscounts, saveDiscount, validateCoupon };
