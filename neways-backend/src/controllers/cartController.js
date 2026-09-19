const pool = require('../config/db');

async function getCart(req, res) {
  try {
    const result = await pool.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, v.id AS variant_id, v.size, v.color, v.stock,
              p.id AS product_id, p.name, p.price, p.image_url
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error en getCart:", err);
    res.status(500).json({ message: "Error al obtener el carrito." });
  }
}

async function addToCart(req, res) {
  try {
    const { variantId, quantity } = req.body;
    const qty = quantity || 1;

    // Verificar existencias
    const variantCheck = await pool.query("SELECT stock FROM product_variants WHERE id = $1", [variantId]);
    if (variantCheck.rows.length === 0) {
      return res.status(404).json({ message: "Variante de producto no encontrada." });
    }

    if (variantCheck.rows[0].stock < qty) {
      return res.status(400).json({ message: "No hay suficiente stock disponible." });
    }

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, variant_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, variant_id) 
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, variantId, qty]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error en addToCart:", err);
    res.status(500).json({ message: "Error al agregar al carrito." });
  }
}

async function updateCartItem(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return removeCartItem(req, res);
    }

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Elemento no encontrado en el carrito." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en updateCartItem:", err);
    res.status(500).json({ message: "Error al actualizar el carrito." });
  }
}

async function removeCartItem(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Elemento no encontrado en el carrito." });
    }

    res.json({ message: "Producto eliminado del carrito." });
  } catch (err) {
    console.error("Error en removeCartItem:", err);
    res.status(500).json({ message: "Error al eliminar el elemento." });
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };