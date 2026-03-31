const Reservation = require('../models/Reservation');
const { createError } = require('../utils/helpers');
const { sendOwnerReservationEmail, sendCustomerReservationEmail } = require('../utils/emailService');

const createReservation = async (req, res, next) => {
  try {
    const { name, customerEmail, date, time, guests } = req.body;

    if (!name || !name.trim()) throw createError('Name is required', 400);
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw createError('A valid customer email is required', 400);
    if (!date) throw createError('Date is required', 400);
    if (!time || !time.trim()) throw createError('Time is required', 400);
    if (guests === undefined || guests === null) throw createError('Number of guests is required', 400);
    if (guests < 1 || guests > 20) throw createError('Guests must be between 1 and 20', 400);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) throw createError('Date cannot be in the past', 400);

    const reservation = await Reservation.create({ name, customerEmail, date, time, guests, status: 'pending' });

    setImmediate(() => {
      sendOwnerReservationEmail(reservation).catch(err => console.error('Owner reservation email failed:', err.message));
      sendCustomerReservationEmail(reservation).catch(err => console.error('Customer reservation email failed:', err.message));
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1 });
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw createError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!reservation) throw createError('Reservation not found', 404);
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReservation, getAllReservations, updateReservationStatus };