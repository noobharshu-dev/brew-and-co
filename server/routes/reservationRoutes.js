const express = require('express');
const router = express.Router();
const { createReservation, getAllReservations, updateReservationStatus } = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', createReservation);
router.get('/', authMiddleware, getAllReservations);
router.patch('/:id/status', authMiddleware, updateReservationStatus);

module.exports = router;