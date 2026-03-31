const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { createError } = require('../utils/helpers');
const { sendOwnerOrderEmail, sendCustomerOrderEmail } = require('../utils/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc  Create Razorpay payment order (step 1 of checkout)
// @route POST /api/orders/create-payment
const createPayment = async (req, res, next) => {
  try {
    const { totalPrice } = req.body;
    if (!totalPrice || typeof totalPrice !== 'number' || totalPrice <= 0) {
      throw createError('Valid total price is required', 400);
    }

    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100), // Razorpay uses paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    res.status(201).json({ success: true, data: paymentOrder });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify payment + save order (step 2 of checkout)
// @route POST /api/orders/verify-payment
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalPrice,
      customerEmail,
      customerName,
      customerPhone,
      orderType,
      scheduledDate,
      scheduledTime,
      specialInstructions
    } = req.body;

    // Verify signature — this is the security check
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw createError('Payment verification failed — invalid signature', 400);
    }

    // Validate order fields
    if (!customerName?.trim()) throw createError('Customer name is required', 400);
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw createError('Valid email required', 400);
    if (!customerPhone?.trim()) throw createError('Phone is required', 400);
    if (!scheduledDate) throw createError('Date is required', 400);
    if (!scheduledTime) throw createError('Time is required', 400);
    if (!items || !Array.isArray(items) || items.length === 0) throw createError('Items required', 400);

    const order = await Order.create({
      items,
      totalPrice,
      customerName,
      customerEmail,
      customerPhone,
      orderType: orderType || 'Dine-in',
      scheduledDate,
      scheduledTime,
      specialInstructions: specialInstructions || '',
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: 'confirmed' // paid = confirmed immediately
    });

    setImmediate(() => {
      sendOwnerOrderEmail(order).catch(err => console.error('Owner email failed:', err.message));
      sendCustomerOrderEmail(order).catch(err => console.error('Customer email failed:', err.message));
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed'];
    if (!validStatuses.includes(status)) {
      throw createError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) throw createError('Order not found', 404);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPayment, verifyPayment, getAllOrders, updateOrderStatus };