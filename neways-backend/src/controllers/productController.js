const pool = require('../config/db');

async function getAllProducts(req, res) {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT p.id, p.name, p.description, p.price, p.image_url, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category && category !== 'Todos') {
      params.push(category);
      query += ` AND c.name = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.name ILIKE $${params.length}`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en getAllProducts:", err);
    res.status(500).json({ message: "Error al obtener productos." });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const productResult = await pool.query(
      `SELECT p.*, c.name AS category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1 AND p.is_active = TRUE`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const variantsResult = await pool.query(
      `SELECT id, size, color, stock FROM product_variants WHERE product_id = $1 ORDER BY size, color`,
      [id]
    );

    const product = productResult.rows[0];
    product.variants = variantsResult.rows;

    res.json(product);
  } catch (err) {
    console.error("Error en getProductById:", err);
    res.status(500).json({ message: "Error al obtener el producto." });
  }
}

module.exports = { getAllProducts, getProductById };