const pool = require('../config/db');
const { calculateItemPrice, getActiveDiscounts } = require('../services/discountService');

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
    const onlyDiscounted = category
      && ['descuentos', 'ofertas'].includes(category.toLowerCase());
    let query = `
      SELECT p.id, p.name, p.description, p.price, p.discount, p.image_url, p.category_id, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category && category !== 'Todos') {
      if (!onlyDiscounted) {
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
    const discounts = await getActiveDiscounts(pool);
    const products = result.rows.map((product) => {
      const price = calculateItemPrice(product, discounts);
      return {
        ...product,
        legacy_discount: Number(product.discount || 0),
        discount: Number(price.discountPercent.toFixed(2)),
        discount_amount: Number(price.discountAmount.toFixed(2)),
        discount_label: price.discountLabel,
        discount_name: price.discountName,
        discounted_price: Number(price.finalPrice.toFixed(2)),
      };
    });
    res.json(onlyDiscounted ? products.filter((product) => product.discount_amount > 0) : products);
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
    const discounts = await getActiveDiscounts(pool);
    const legacyDiscount = Number(product.discount || 0);
    const price = calculateItemPrice({ ...product, legacy_discount: legacyDiscount }, discounts);
    product.legacy_discount = legacyDiscount;
    product.discount = Number(price.discountPercent.toFixed(2));
    product.discount_amount = Number(price.discountAmount.toFixed(2));
    product.discount_label = price.discountLabel;
    product.discounted_price = Number(price.finalPrice.toFixed(2));
    product.variants = variantsResult.rows.map((variant) => {
      const variantPrice = calculateItemPrice({
        ...product,
        ...variant,
        legacy_discount: legacyDiscount,
      }, discounts);
      return {
        ...variant,
        discount: Number(variantPrice.discountPercent.toFixed(2)),
        discount_amount: Number(variantPrice.discountAmount.toFixed(2)),
        discount_label: variantPrice.discountLabel,
        discounted_price: Number(variantPrice.finalPrice.toFixed(2)),
      };
    });

    res.json(product);
  } catch (err) {
    console.error("Error en getProductById:", err);
    res.status(500).json({ message: "Error al obtener el producto." });
  }
}

module.exports = { getAllProducts, getProductById, getCategories };