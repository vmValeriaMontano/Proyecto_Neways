const pool = require('../config/db');

// 1. Obtener todas las categorías para la tienda cliente
async function getCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías públicas:', err);
    res.status(500).json({ message: 'Error al obtener categorías.' });
  }
}

// 2. Obtener productos (con filtro de categoría virtual "Descuentos")
async function getAllProducts(req, res) {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT p.id, p.name, p.description, p.price, p.discount, p.image_url, p.category_id, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category && category !== 'Todos') {
      if (category.toLowerCase() === 'descuentos' || category.toLowerCase() === 'ofertas') {
        query += ` AND p.discount > 0`;
      } else {
        params.push(category);
        query += ` AND c.name = $${params.length}`;
      }
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

// 3. Obtener detalle de producto por ID
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

module.exports = { getAllProducts, getProductById, getCategories };