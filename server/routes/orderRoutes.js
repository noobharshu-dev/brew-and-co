const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createPayment, verifyPayment, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many payment attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/create-payment', paymentLimiter, createPayment);
router.post('/verify-payment', paymentLimiter, verifyPayment);
router.get('/', authMiddleware, getAllOrders);
router.patch('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;