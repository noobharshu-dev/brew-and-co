import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { makeReservation } from '../services/api';

// Generate 9:00 AM to 9:00 PM slots
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 9; i <= 21; i++) {
    for (let j = 0; j < 60; j += 30) {
      if (i === 21 && j === 30) break;
      const hour = i === 12 ? 12 : i % 12 || 12;
      const ampm = i < 12 ? 'AM' : 'PM';
      const minute = j === 0 ? '00' : '30';
      slots.push(`${hour}:${minute} ${ampm}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function Reservation() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    guests: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState(null); // 'success' | 'error' | null

  const todayString = new Date().toISOString().split('T')[0];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (formData.date < todayString) {
      newErrors.date = "Date cannot be in the past";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.guests) {
      newErrors.guests = "Number of guests is required";
    } else {
      const g = parseInt(formData.guests, 10);
      if (g < 1 || g > 20) {
        newErrors.guests = "Guests must be between 1 and 20";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setSubmitState(null);
      await makeReservation(formData);
      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-beige max-w-lg w-full">
          <CalendarCheck size={80} className="text-green-600 mb-6 mx-auto" />
          <h1 className="font-heading font-bold text-4xl text-dark mb-4 leading-tight">Your table is booked!</h1>
          <p className="text-dark/80 text-lg mb-2">
            We'll see you on <span className="font-bold text-brown">{formData.date}</span> at <span className="font-bold text-brown">{formData.time}</span>.
          </p>
          <p className="text-dark/60 text-sm mb-8">
            A confirmation has been sent to <span className="font-medium">{formData.email}</span>
          </p>
          <Link
            to="/"
            className="inline-flex items-center text-brown hover:text-dark font-medium transition-colors border-b-2 border-transparent hover:border-dark pb-1"
          >
            <ArrowLeft size={18} className="mr-2" /> Return to Homepage
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[80vh] py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-cream/50"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-5xl text-dark mb-4">Reserve a Table</h1>
          <div className="w-16 h-1 bg-brown mx-auto rounded"></div>
          <p className="mt-4 text-dark/70">Join us for a carefully crafted experience. Book your spot below.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-beige">

          {submitState === 'error' && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-8 flex items-center shadow-sm border border-red-200">
              <AlertCircle className="mr-3 text-red-500 shrink-0" size={24} />
              <p className="font-medium">Booking failed. Please try again or call us directly.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-dark mb-1.5">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1.5 flex items-center"><AlertCircle size={14} className="mr-1" /> {errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-dark mb-1.5">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1.5 flex items-center"><AlertCircle size={14} className="mr-1" /> {errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-dark mb-1.5">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value && e.target.value < todayString) {
                      setErrors(prev => ({ ...prev, date: 'Date cannot be in the past' }));
                    }
                  }}
                  min={todayString}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.date ? 'border-red-500 focus:ring-red-200' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30 text-dark`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1.5 flex items-center"><AlertCircle size={14} className="mr-1" /> {errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-dark mb-1.5">Time</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.time ? 'border-red-500 focus:ring-red-200' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30 text-dark appearance-none`}
                >
                  <option value="" disabled>Select a time</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.time && <p className="text-red-500 text-sm mt-1.5 flex items-center"><AlertCircle size={14} className="mr-1" /> {errors.time}</p>}
              </div>
            </div>

            {/* Guests */}
            <div>
              <label htmlFor="guests" className="block text-sm font-semibold text-dark mb-1.5">Number of Guests (1-20)</label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                max="20"
                placeholder="2"
                className={`w-full px-4 py-3 rounded-lg border ${errors.guests ? 'border-red-500 focus:ring-red-200' : 'border-beige focus:border-brown focus:ring-brown/20'} focus:outline-none focus:ring-2 transition-all bg-cream/30 text-dark`}
              />
              {errors.guests && <p className="text-red-500 text-sm mt-1.5 flex items-center"><AlertCircle size={14} className="mr-1" /> {errors.guests}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brown hover:bg-brown/90 text-cream px-6 py-4 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Booking...
                </>
              ) : (
                'Confirm Reservation'
              )}
            </button>
            <p className="text-center text-xs text-dark/50 mt-4">By booking, you agree to our cancellation policy.</p>

          </form>
        </div>
      </div>
    </motion.div>
  );
}