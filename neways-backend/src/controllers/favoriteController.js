const db = require('../config/db'); // Tu conexión a PostgreSQL

// Obtener los favoritos del usuario autenticado
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT p.*, f.created_at AS favorited_at
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Agregar o quitar producto de favoritos (Toggle)
exports.toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Verificar si ya existe en favoritos
    const checkQuery = 'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2;';
    const checkRes = await db.query(checkQuery, [userId, productId]);

    if (checkRes.rows.length > 0) {
      // Si existe, se elimina
      await db.query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2;', [userId, productId]);
      return res.json({ message: 'Producto eliminado de favoritos', isFavorite: false });
    } else {
      // Si no existe, se inserta
      await db.query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2);', [userId, productId]);
      return res.status(201).json({ message: 'Producto agregado a favoritos', isFavorite: true });
    }
  } catch (error) {
    next(error);
  }
};

// Eliminar un favorito por ID
exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2;', [userId, id]);
    res.json({ message: 'Favorito eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};