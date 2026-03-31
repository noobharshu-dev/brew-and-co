const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/create-payment', createPayment);
router.post('/verify-payment', verifyPayment);
router.get('/', authMiddleware, getAllOrders);
router.patch('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;