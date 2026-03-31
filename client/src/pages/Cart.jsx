import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Clock, Calendar, CreditCard, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';

const API = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i <= 22; i++) {
    for (let j = 0; j < 60; j += 30) {
      if (i === 22 && j === 30) break;
      const hour = i === 12 ? 12 : i % 12 || 12;
      const ampm = i < 12 ? 'AM' : 'PM';
      const minute = j === 0 ? '00' : '30';
      slots.push(`${hour}:${minute} ${ampm}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const PROCESSING_STEPS = [
  { message: 'Sending your order to the kitchen...', duration: 1200 },
  { message: 'Confirming your details...', duration: 900 },
  { message: 'Preparing your receipt...', duration: 700 },
];

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── PDF RECEIPT GENERATOR ─────────────────────────────────────────────────────
const downloadReceipt = async (order, customerName, customerEmail, customerPhone, orderType) => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const shortId = order._id.slice(-8).toUpperCase();
  const subtotal = order.totalPrice / 1.08;
  const tax = order.totalPrice - subtotal;
  const issueDate = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  // ── HEADER BAND ──
  doc.setFillColor(107, 58, 42);
  doc.rect(0, 0, pageW, 38, 'F');

  doc.setTextColor(255, 250, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Brew & Co.', 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(212, 169, 106);
  doc.text('PREMIUM CAFÉ', 15, 22);

  doc.setTextColor(255, 250, 240);
  doc.setFontSize(8);
  doc.text('123 Café Lane, Mumbai, India', pageW - 15, 14, { align: 'right' });
  doc.text('+91 98765 43210', pageW - 15, 19, { align: 'right' });
  doc.text('cafe.brewandco@gmail.com', pageW - 15, 24, { align: 'right' });

  // RECEIPT label
  doc.setFillColor(212, 169, 106);
  doc.roundedRect(pageW - 50, 28, 35, 8, 2, 2, 'F');
  doc.setTextColor(107, 58, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RECEIPT', pageW - 32.5, 33.5, { align: 'center' });

  // ── ORDER META ──
  let y = 48;
  doc.setTextColor(28, 28, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`Order #${shortId}`, 15, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Issued: ${issueDate}`, 15, y + 6);

  // Status badge
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(pageW - 50, y - 6, 35, 10, 2, 2, 'F');
  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PAID', pageW - 32.5, y, { align: 'center' });

  // ── DIVIDER ──
  y += 14;
  doc.setDrawColor(232, 217, 192);
  doc.setLineWidth(0.3);
  doc.line(15, y, pageW - 15, y);

  // ── TWO COLUMN INFO ──
  y += 8;
  const col1 = 15;
  const col2 = pageW / 2 + 5;

  const labelStyle = () => { doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(150, 150, 150); };
  const valueStyle = () => { doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(28, 28, 28); };

  // Col 1
  labelStyle(); doc.text('CUSTOMER NAME', col1, y);
  valueStyle(); doc.text(customerName, col1, y + 5);

  labelStyle(); doc.text('EMAIL', col1, y + 13);
  valueStyle(); doc.text(customerEmail, col1, y + 18);

  labelStyle(); doc.text('PHONE', col1, y + 26);
  valueStyle(); doc.text(customerPhone, col1, y + 31);

  // Col 2
  labelStyle(); doc.text('ORDER TYPE', col2, y);
  valueStyle(); doc.text(orderType, col2, y + 5);

  labelStyle(); doc.text(`${orderType === 'Dine-in' ? 'VISIT' : 'PICKUP'} DATE`, col2, y + 13);
  valueStyle(); doc.text(order.scheduledDate, col2, y + 18);

  labelStyle(); doc.text('TIME', col2, y + 26);
  valueStyle(); doc.text(order.scheduledTime, col2, y + 31);

  // Payment ID row
  y += 38;
  doc.setFillColor(245, 236, 215);
  doc.roundedRect(15, y, pageW - 30, 12, 2, 2, 'F');
  labelStyle();
  doc.setTextColor(107, 58, 42);
  doc.text('PAYMENT ID', 20, y + 4.5);
  valueStyle();
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(28, 28, 28);
  doc.text(order.paymentId || 'N/A', 20, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('RAZORPAY ORDER ID', col2, y + 4.5);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(28, 28, 28);
  doc.text(order.razorpayOrderId || 'N/A', col2, y + 9.5);

  // ── ITEMS TABLE ──
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(28, 28, 28);
  doc.text('ORDER ITEMS', 15, y);

  y += 4;
  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: order.items.map(i => [
      i.name,
      `×${i.quantity}`,
      `Rs. ${i.price.toFixed(2)}`,
      `Rs. ${(i.price * i.quantity).toFixed(2)}`
    ]),
    headStyles: {
      fillColor: [107, 58, 42],
      textColor: [255, 250, 240],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [28, 28, 28],
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [252, 248, 243] },
    tableLineColor: [232, 217, 192],
    tableLineWidth: 0.2,
  });

  // ── TOTALS ──
  const tableBottom = doc.lastAutoTable.finalY + 6;
  const totalsX = 15;
  const totalsW = pageW - 30;

  doc.setDrawColor(232, 217, 192);
  doc.setLineWidth(0.3);

  // Subtotal row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal', totalsX + 5, tableBottom);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, totalsX + totalsW - 5, tableBottom, { align: 'right' });

  // Tax row
  doc.text('Tax (8%)', totalsX + 5, tableBottom + 6);
  doc.text(`Rs. ${tax.toFixed(2)}`, totalsX + totalsW - 5, tableBottom + 6, { align: 'right' });

  // Total row with background
  doc.setFillColor(107, 58, 42);
  doc.roundedRect(totalsX, tableBottom + 9, totalsW, 10, 2, 2, 'F');
  doc.setTextColor(255, 250, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', totalsX + 5, tableBottom + 15.5);
  doc.text(`Rs. ${order.totalPrice.toFixed(2)}`, totalsX + totalsW - 5, tableBottom + 15.5, { align: 'right' });

  // ── SPECIAL INSTRUCTIONS ──
  if (order.specialInstructions) {
    const noteY = tableBottom + 26;
    doc.setFillColor(255, 248, 232);
    doc.setDrawColor(212, 169, 106);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, noteY, pageW - 30, 14, 2, 2, 'FD');
    doc.setTextColor(107, 58, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('SPECIAL INSTRUCTIONS', 20, noteY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(28, 28, 28);
    doc.text(order.specialInstructions, 20, noteY + 10);
  }

  // ── FOOTER ──
  const footerY = doc.internal.pageSize.getHeight() - 22;
  doc.setFillColor(28, 28, 28);
  doc.rect(0, footerY, pageW, 22, 'F');

  doc.setTextColor(212, 169, 106);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Thank you for choosing Brew & Co.!', pageW / 2, footerY + 8, { align: 'center' });

  doc.setTextColor(180, 180, 180);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('123 Café Lane, Mumbai, India  |  +91 98765 43210  |  cafe.brewandco@gmail.com', pageW / 2, footerY + 14, { align: 'center' });
  doc.text(`Receipt generated on ${issueDate}`, pageW / 2, footerY + 19, { align: 'center' });

  doc.save(`BrewAndCo_Receipt_${shortId}.pdf`);
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [orderStatus, setOrderStatus] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const todayString = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderType: 'Dine-in',
    scheduledDate: '',
    scheduledTime: '',
    specialInstructions: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadRazorpay(); }, []);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Name is required';
    if (!form.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      e.customerEmail = 'Please enter a valid email';
    }
    if (!form.customerPhone || !/^(\+91[\s-]?)?[6-9][0-9]{9}$/.test(form.customerPhone.replace(/[\s-]/g, ''))) {
      e.customerPhone = 'Please enter a valid 10-digit phone number';
    }
    if (!form.scheduledDate) {
      e.scheduledDate = 'Please select a date';
    } else if (form.scheduledDate < todayString) {
      e.scheduledDate = 'Date cannot be in the past';
    }
    if (!form.scheduledTime) e.scheduledTime = 'Please select a time slot';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const runProcessingSteps = () =>
    new Promise((resolve) => {
      let step = 0;
      setProcessingStep(0);
      const next = () => {
        if (step < PROCESSING_STEPS.length - 1) {
          step++;
          setProcessingStep(step);
          setTimeout(next, PROCESSING_STEPS[step].duration);
        } else {
          setTimeout(resolve, 600);
        }
      };
      setTimeout(next, PROCESSING_STEPS[0].duration);
    });

  const handleCheckout = async () => {
    if (!validate()) return;
    const taxedTotal = parseFloat((totalPrice * 1.08).toFixed(2));

    try {
      setIsSubmitting(true);
      setOrderStatus(null);

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay failed to load.');

      const paymentRes = await fetch(`${API}/api/orders/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalPrice: taxedTotal })
      });
      const paymentData = await paymentRes.json();
      if (!paymentData.success) throw new Error('Could not initiate payment.');

      await new Promise((resolve, reject) => {
        const options = {
          key: RAZORPAY_KEY,
          amount: paymentData.data.amount,
          currency: 'INR',
          name: 'Brew & Co.',
          description: `${form.orderType} Order`,
          order_id: paymentData.data.id,
          prefill: { name: form.customerName, email: form.customerEmail, contact: form.customerPhone },
          theme: { color: '#6B3A2A' },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
          handler: async (response) => {
            try {
              const [verifyRes] = await Promise.all([
                fetch(`${API}/api/orders/verify-payment`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    items: cartItems.map(i => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity })),
                    totalPrice: taxedTotal,
                    customerEmail: form.customerEmail,
                    customerName: form.customerName,
                    customerPhone: form.customerPhone,
                    orderType: form.orderType,
                    scheduledDate: form.scheduledDate,
                    scheduledTime: form.scheduledTime,
                    specialInstructions: form.specialInstructions
                  })
                }),
                runProcessingSteps()
              ]);
              const verifyData = await verifyRes.json();
              if (!verifyData.success) throw new Error('Payment verification failed.');
              setConfirmedOrder(verifyData.data);
              setOrderStatus('success');
              clearCart();
              resolve();
            } catch (err) { reject(err); }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });

    } catch (error) {
      if (error.message !== 'Payment cancelled') setOrderStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    setDownloadingPdf(true);
    try {
      await downloadReceipt(confirmedOrder, form.customerName, form.customerEmail, form.customerPhone, form.orderType);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ── SUCCESS SCREEN ──
  if (orderStatus === 'success' && confirmedOrder) {
    const shortId = confirmedOrder._id.slice(-8).toUpperCase();
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center"
      >
        <CheckCircle2 size={80} className="text-green-600 mb-6" />
        <h1 className="font-heading font-bold text-4xl text-dark mb-2">Order Placed!</h1>
        <p className="text-dark/50 text-sm mb-1 font-mono tracking-widest">Order ID: #{shortId}</p>
        <p className="text-dark/70 text-base mb-2 max-w-md">
          {form.orderType === 'Dine-in'
            ? `Your table is ready for ${form.scheduledDate} at ${form.scheduledTime}.`
            : `Your takeaway will be ready at ${form.scheduledTime} on ${form.scheduledDate}.`}
        </p>
        <p className="text-dark/50 text-sm mb-8">
          Confirmation sent to <span className="font-medium text-dark">{form.customerEmail}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Download Receipt */}
          <button onClick={handleDownloadReceipt} disabled={downloadingPdf}
            className="flex items-center gap-2 bg-brown text-cream px-6 py-3 rounded-lg font-medium hover:bg-brown/90 transition-all hover:-translate-y-0.5 shadow-md disabled:opacity-70">
            {downloadingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {downloadingPdf ? 'Generating...' : 'Download Receipt'}
          </button>

          <Link to="/menu"
            className="flex items-center gap-2 border border-brown text-brown px-6 py-3 rounded-lg font-medium hover:bg-brown/5 transition-all">
            <ArrowLeft size={18} /> Back to Menu
          </Link>
        </div>

        <p className="text-dark/30 text-xs">Receipt is also available in your confirmation email.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="min-h-[70vh] pt-24 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      <h1 className="font-heading font-bold text-4xl text-dark mb-2">Your Cart</h1>
      <p className="text-dark/60 mb-8 border-b border-beige pb-6">Review your items and complete your details.</p>

      {orderStatus === 'error' && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-8 flex items-center shadow-sm border border-red-200">
          <AlertCircle className="mr-3 text-red-500 shrink-0" size={24} />
          <p>Payment failed. Please try again or contact us directly.</p>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl shadow-sm border border-beige border-dashed">
          <ShoppingBag size={64} className="text-beige mb-6" />
          <h2 className="font-heading font-bold text-2xl text-dark mb-3">Your cart is empty</h2>
          <p className="text-dark/60 mb-8">Looks like you haven't added anything delicious yet.</p>
          <Link to="/menu" className="bg-brown hover:bg-brown/90 text-cream px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md">
            Browse our Menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Cart Items */}
          <div className="flex-grow space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex flex-col sm:flex-row items-center bg-white p-4 rounded-xl shadow-sm border border-beige/60">
                <img src={item.image} alt={item.name} className="w-full sm:w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0" loading="lazy" />
                <div className="flex-grow px-4 text-center sm:text-left w-full sm:w-auto">
                  <h3 className="font-heading font-bold text-xl text-dark">{item.name}</h3>
                  <div className="text-brown font-medium mt-1">{formatPrice(item.price)}</div>
                </div>
                <div className="flex items-center space-x-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center border border-beige rounded-lg overflow-hidden bg-cream">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-3 py-2 text-dark hover:bg-brown hover:text-cream transition-colors" disabled={item.quantity <= 1}>
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-medium bg-white py-2 border-x border-beige">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-3 py-2 text-dark hover:bg-brown hover:text-cream transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)}
                    className="p-2 text-dark/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-beige p-6 sticky top-28 space-y-5">

              <div>
                <h2 className="font-heading font-bold text-2xl text-dark mb-4">Order Summary</h2>
                <div className="space-y-3 text-dark/80">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatPrice(totalPrice)}</span></div>
                  <div className="flex justify-between"><span>Taxes (8%)</span><span className="font-medium">{formatPrice(totalPrice * 0.08)}</span></div>
                  <div className="border-t border-beige pt-3 flex justify-between font-bold text-xl text-dark font-heading">
                    <span>Total</span><span className="text-brown">{formatPrice(totalPrice * 1.08)}</span>
                  </div>
                </div>
              </div>

              <hr className="border-beige" />

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Order Type</label>
                <div className="flex rounded-lg border border-beige overflow-hidden">
                  {['Dine-in', 'Takeaway'].map((type) => (
                    <button key={type} type="button"
                      onClick={() => setForm(prev => ({ ...prev, orderType: type, scheduledDate: '', scheduledTime: '' }))}
                      className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${form.orderType === type ? 'bg-brown text-cream' : 'bg-cream/30 text-dark hover:bg-beige'}`}>
                      {type === 'Dine-in' ? '🍽️ Dine-in' : '🥡 Takeaway'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    <Calendar size={13} className="inline mr-1" />
                    {form.orderType === 'Dine-in' ? 'Visit Date' : 'Pickup Date'}
                  </label>
                  <input type="date" name="scheduledDate" value={form.scheduledDate}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value && e.target.value < todayString)
                        setErrors(prev => ({ ...prev, scheduledDate: 'Date cannot be in the past' }));
                    }}
                    min={todayString}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${errors.scheduledDate ? 'border-red-500' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30 text-dark`}
                  />
                  {errors.scheduledDate && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={11} className="mr-1" />{errors.scheduledDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    <Clock size={13} className="inline mr-1" />
                    {form.orderType === 'Dine-in' ? 'Arrival Time' : 'Pickup Time'}
                  </label>
                  <select name="scheduledTime" value={form.scheduledTime} onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm ${errors.scheduledTime ? 'border-red-500' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30 text-dark appearance-none`}>
                    <option value="" disabled>Select</option>
                    {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                  {errors.scheduledTime && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={11} className="mr-1" />{errors.scheduledTime}</p>}
                </div>
              </div>

              <hr className="border-beige" />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-dark uppercase tracking-wide">Your Details</h3>
                <div>
                  <input type="text" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Full Name"
                    className={`w-full px-4 py-3 rounded-lg border text-sm ${errors.customerName ? 'border-red-500' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30`} />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={11} className="mr-1" />{errors.customerName}</p>}
                </div>
                <div>
                  <input type="email" name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="Email Address"
                    className={`w-full px-4 py-3 rounded-lg border text-sm ${errors.customerEmail ? 'border-red-500' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30`} />
                  {errors.customerEmail && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={11} className="mr-1" />{errors.customerEmail}</p>}
                </div>
                <div>
                  <input type="tel" name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="Phone Number"
                    className={`w-full px-4 py-3 rounded-lg border text-sm ${errors.customerPhone ? 'border-red-500' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30`} />
                  {errors.customerPhone && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={11} className="mr-1" />{errors.customerPhone}</p>}
                </div>
                <textarea name="specialInstructions" value={form.specialInstructions} onChange={handleChange}
                  placeholder="Special instructions (optional) — e.g. no sugar, extra shot..."
                  rows={2} maxLength={200}
                  className="w-full px-4 py-3 rounded-lg border border-beige focus:border-brown focus:ring-brown/20 focus:outline-none focus:ring-2 transition-all bg-cream/30 text-sm resize-none" />
              </div>

              <button onClick={handleCheckout} disabled={isSubmitting}
                className="w-full bg-brown hover:bg-brown/90 text-cream px-6 py-4 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <AnimatePresence mode="wait">
                    <motion.span key={processingStep} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="flex items-center">
                      <Loader2 className="animate-spin mr-2" size={18} />
                      {PROCESSING_STEPS[processingStep].message}
                    </motion.span>
                  </AnimatePresence>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard size={18} />
                    Pay {formatPrice(totalPrice * 1.08)}
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-dark/40">🔒 Secured by Razorpay</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}