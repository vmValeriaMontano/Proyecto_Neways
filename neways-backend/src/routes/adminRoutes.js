const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// PROTEGER TODAS LAS RUTAS: Requieren Token JWT válido y Rol Administrador
router.use(authenticateToken);
router.use(isAdmin);

// --- Categorías ---
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// --- Productos ---
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// --- Variantes y Stock ---
router.post('/variants', adminController.addVariant);
router.put('/variants/:id/stock', adminController.updateVariantStock);
router.delete('/variants/:id', adminController.deleteVariant);

// --- Pedidos ---
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// --- Usuarios ---
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;