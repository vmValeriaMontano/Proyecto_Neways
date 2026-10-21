const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const siteSettingsController = require('../controllers/siteSettingsController');
const uploadSiteLogo = require('../middlewares/uploadSiteLogo');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// PROTEGER TODAS LAS RUTAS: Requieren Token JWT válido y Rol Administrador
router.use(authenticateToken);
router.use(isAdmin);

// --- Personalización del sitio ---
router.get('/site-settings', siteSettingsController.getSettings);
router.put('/site-settings', siteSettingsController.updateSettings);
router.post('/site-settings/logos/:slot', uploadSiteLogo, siteSettingsController.uploadLogo);

// --- Descuentos y cupones ---
const discountController = require('../controllers/discountController');
router.get('/discounts', discountController.getAdminDiscounts);
router.post('/discounts', discountController.saveDiscount);
router.put('/discounts/:id', discountController.saveDiscount);
router.delete('/discounts/:id', discountController.deleteDiscount);

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
router.get('/products/:productId/variants', adminController.getProductVariantsAdmin);
router.post('/variants', adminController.addVariant);
router.put('/variants/:id/stock', adminController.updateVariantStock);
router.delete('/variants/:id', adminController.deleteVariant);

// --- Pedidos ---
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// --- Usuarios ---
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

// --- Departamentos (CRUD ADMIN) ---
router.get('/departments', adminController.getAllDepartmentsAdmin);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// --- Municipios (CRUD ADMIN) ---
router.get('/departments/:departmentId/municipalities', adminController.getMunicipalitiesAdmin);
router.post('/municipalities', adminController.createMunicipality);
router.put('/municipalities/:id', adminController.updateMunicipality);
router.delete('/municipalities/:id', adminController.deleteMunicipality);

module.exports = router;