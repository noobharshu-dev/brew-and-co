const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'] },
    customerEmail: { type: String, required: [true, 'Email is required'] },
    date: { type: Date, required: [true, 'Date is required'] },
    time: { type: String, required: [true, 'Time is required'] },
    guests: {
      type: Number,
      required: true,
      min: [1, 'Min 1 guest'],
      max: [20, 'Max 20 guests']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);