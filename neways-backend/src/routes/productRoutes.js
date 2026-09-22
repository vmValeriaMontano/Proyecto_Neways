const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminController = require('../controllers/adminController');

router.get('/', productController.getAllProducts);
router.get('/categories', adminController.getCategories); 
router.get('/:id', productController.getProductById);

module.exports = router;