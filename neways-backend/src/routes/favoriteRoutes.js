const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middlewares/auth');

// Aplicar el middleware usando la función correcta
router.use(authenticateToken);

router.get('/', favoriteController.getFavorites);
router.post('/toggle', favoriteController.toggleFavorite);
router.delete('/:id', favoriteController.removeFavorite);

module.exports = router;