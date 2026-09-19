const pool = require('../config/db');

// ==========================================
// 1. CRUD CATEGORÍAS
// ==========================================

async function getCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).json({ message: 'Error al obtener categorías.' });
  }
}

async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre de la categoría es obligatorio.' });

    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear categoría:', err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
    }
    res.status(500).json({ message: 'Error al crear categoría.' });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio.' });

    const result = await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar categoría:', err);
    res.status(500).json({ message: 'Error al actualizar categoría.' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    res.json({ message: 'Categoría eliminada exitosamente.' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({ message: 'Error al eliminar categoría. Asegúrate de que no tenga productos asociados.' });
  }
}

// ==========================================
// 2. CRUD PRODUCTOS
// ==========================================

async function createProduct(req, res) {
  try {
    const { name, description, price, category_id, image_url, is_active } = req.body;

    if (!name || price === undefined || !category_id) {
      return res.status(400).json({ message: 'Nombre, precio y categoría son requeridos.' });
    }

    const activeState = is_active !== undefined ? is_active : true;

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category_id, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || null, price, category_id, image_url || null, activeState]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ message: 'Error al crear el producto.' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image_url, is_active } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category_id = COALESCE($4, category_id),
           image_url = COALESCE($5, image_url),
           is_active = COALESCE($6, is_active)
       WHERE id = $7
       RETURNING *`,
      [name, description, price, category_id, image_url, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ message: 'Error al actualizar el producto.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    // Eliminación lógica cambiando el estado
    const result = await pool.query(
      'UPDATE products SET is_active = FALSE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto desactivado del catálogo.', product: result.rows[0] });
  } catch (err) {
    console.error('Error al desactivar producto:', err);
    res.status(500).json({ message: 'Error al eliminar/desactivar producto.' });
  }
}

// ==========================================
// 3. CRUD VARIANTES (Tallas, Colores y Stock)
// ==========================================

async function addVariant(req, res) {
  try {
    const { product_id, size, color, stock } = req.body;

    if (!product_id || !size || !color || stock === undefined) {
      return res.status(400).json({ message: 'ID de producto, talla, color y stock son obligatorios.' });
    }

    const result = await pool.query(
      `INSERT INTO product_variants (product_id, size, color, stock)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_id, size, color, stock]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar variante:', err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Esta combinación de talla y color ya existe para este producto.' });
    }
    res.status(500).json({ message: 'Error al agregar variante.' });
  }
}

async function updateVariantStock(req, res) {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: 'Proporciones un stock válido (mayor o igual a 0).' });
    }

    const result = await pool.query(
      'UPDATE product_variants SET stock = $1 WHERE id = $2 RETURNING *',
      [stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Variante no encontrada.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar inventario:', err);
    res.status(500).json({ message: 'Error al actualizar inventario de la variante.' });
  }
}

async function deleteVariant(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM product_variants WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Variante no encontrada.' });
    }

    res.json({ message: 'Variante eliminada correctamente.' });
  } catch (err) {
    console.error('Error al eliminar variante:', err);
    res.status(500).json({ message: 'Error al eliminar variante.' });
  }
}

// ==========================================
// 4. GESTIÓN DE PEDIDOS Y ESTADOS
// ==========================================

async function getAllOrders(req, res) {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ message: 'Error al obtener pedidos.' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const validStatuses = ['recibido', 'preparando', 'enviado', 'entregado', 'cancelado'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ message: 'Estado de pedido no válido.' });
    }

    const result = await pool.query(
      'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *',
      [order_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al cambiar estado del pedido:', err);
    res.status(500).json({ message: 'Error al cambiar estado del pedido.' });
  }
}

// ==========================================
// 5. GESTIÓN DE USUARIOS
// ==========================================

async function getAllUsers(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, phone, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['cliente', 'administrador'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Debe ser cliente o administrador.' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar rol:', err);
    res.status(500).json({ message: 'Error al actualizar el rol de usuario.' });
  }
}

module.exports = {
  // Categorías
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Productos
  createProduct,
  updateProduct,
  deleteProduct,
  // Variantes
  addVariant,
  updateVariantStock,
  deleteVariant,
  // Pedidos
  getAllOrders,
  updateOrderStatus,
  // Usuarios
  getAllUsers,
  updateUserRole
};