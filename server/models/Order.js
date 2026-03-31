const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    totalPrice: { type: Number, required: true, min: 0 },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    orderType: { type: String, enum: ['Dine-in', 'Takeaway'], default: 'Dine-in' },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    specialInstructions: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);