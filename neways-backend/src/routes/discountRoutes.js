const express = require('express');
const discountController = require('../controllers/discountController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();
router.use(authenticateToken);
router.post('/validate', discountController.validateCoupon);

module.exports = router;
