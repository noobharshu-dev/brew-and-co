const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createReservation, getAllReservations, updateReservationStatus } = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many reservation attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', reservationLimiter, createReservation);
router.get('/', authMiddleware, getAllReservations);
router.patch('/:id/status', authMiddleware, updateReservationStatus);

module.exports = router;