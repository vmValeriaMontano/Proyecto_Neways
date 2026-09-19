const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken); // Protege todas las rutas de órdenes

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);

module.exports = router;