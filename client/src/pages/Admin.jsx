import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Calendar, LogOut, RefreshCw,
  ChevronDown, ChevronUp, Phone, Mail, Users,
  Clock, MapPin, FileText, Coffee, UtensilsCrossed,
  Plus, Pencil, Trash2, X, Check, ImageOff
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const STATUS_COLORS = {
  pending: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
};

const CATEGORIES = ['Coffee', 'Desserts', 'Snacks'];
const EMPTY_FORM = { name: '', price: '', category: 'Coffee', image: '', description: '' };

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

// ── MENU TAB ──────────────────────────────────────────────────────────────────
function MenuTab({ adminKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/menu`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price) };
      const url = editingId ? `${API}/api/menu/${editingId}` : `${API}/api/menu`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setItems(prev => prev.map(i => i._id === editingId ? data.data : i));
        } else {
          setItems(prev => [data.data, ...prev]);
        }
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setImgErrors({});
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, price: String(item.price), category: item.category, image: item.image || '', description: item.description || '' });
    setEditingId(item._id);
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/menu/${deleteId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });
      const data = await res.json();
      if (data.success) setItems(prev => prev.filter(i => i._id !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {});

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#6B3A2A]'
    }`;

  return (
    <div className="space-y-6">

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={22} className="text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Delete this item?</h3>
                <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-300 shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingId ? 'Edit Menu Item' : 'Add New Item'}
              </h3>
              <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Item Name *</label>
                <input type="text" value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: null })); }}
                  placeholder="e.g. Flat White" className={inputClass('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price ($) *</label>
                <input type="number" value={form.price}
                  onChange={e => { setForm(p => ({ ...p, price: e.target.value })); if (errors.price) setErrors(p => ({ ...p, price: null })); }}
                  placeholder="e.g. 4.50" min="0" step="0.01" className={inputClass('price')} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6B3A2A] focus:outline-none text-sm transition-colors appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Image URL</label>
                <input type="url" value={form.image}
                  onChange={e => { setForm(p => ({ ...p, image: e.target.value })); setImgErrors(p => ({ ...p, form: false })); }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6B3A2A] focus:outline-none text-sm transition-colors" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description of the item..." rows={2} maxLength={200}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6B3A2A] focus:outline-none text-sm transition-colors resize-none" />
              </div>
            </div>

            {form.image && !imgErrors['form'] && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Image Preview</p>
                <img src={form.image} alt="preview"
                  onError={() => setImgErrors(p => ({ ...p, form: true }))}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={cancelForm}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#6B3A2A] text-white text-sm font-medium hover:bg-[#7d4533] transition-colors disabled:opacity-50">
                <Check size={15} />
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && (
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6B3A2A] text-white rounded-lg text-sm font-medium hover:bg-[#7d4533] transition-colors shadow-sm">
          <Plus size={16} /> Add Menu Item
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <RefreshCw size={20} className="animate-spin mr-2" /> Loading menu...
        </div>
      ) : (
        CATEGORIES.map(cat => grouped[cat].length > 0 && (
          <div key={cat}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {cat} · {grouped[cat].length} items
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[cat].map(item => (
                <div key={item._id} className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden flex flex-col">
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                    {item.image && !imgErrors[item._id] ? (
                      <img src={item.image} alt={item.name}
                        onError={() => setImgErrors(p => ({ ...p, [item._id]: true }))}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageOff size={32} />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-gray-200">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-900 text-base leading-tight">{item.name}</p>
                      <p className="font-bold text-[#6B3A2A] text-base shrink-0">${Number(item.price).toFixed(2)}</p>
                    </div>
                    {item.description && (
                      <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <div className="px-4 pb-4 flex gap-2">
                    <button onClick={() => handleEdit(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:border-[#6B3A2A] hover:text-[#6B3A2A] transition-colors">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteId(item._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:border-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── PIN SCREEN ────────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: { 'x-admin-key': pin }
      });
      if (res.ok) {
        onUnlock(pin);
      } else {
        setError(true);
        setPin('');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#2A2A2A] rounded-2xl p-10 w-full max-w-sm text-center shadow-2xl"
      >
        <div className="text-4xl mb-4">☕</div>
        <h1 className="text-white text-2xl font-semibold mb-1" style={{ fontFamily: 'Georgia, serif' }}>Brew & Co.</h1>
        <p className="text-gray-400 text-sm mb-8">Admin Access</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={pin}
            onChange={e => { setPin(e.target.value); setError(false); }}
            placeholder="Enter admin key"
            className={`w-full px-4 py-3 rounded-lg bg-[#1C1C1C] text-white text-center tracking-widest border ${error ? 'border-red-500' : 'border-[#3A3A3A] focus:border-[#6B3A2A]'} focus:outline-none transition-colors`}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">Incorrect admin key. Try again.</p>}
          <button type="submit" disabled={!pin || loading}
            className="w-full bg-[#6B3A2A] hover:bg-[#7d4533] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Verifying...' : 'Enter Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── ORDER CARD ────────────────────────────────────────────────────────────────
function OrderCard({ order, adminKey, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API}/api/orders/${order._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        onStatusChange(data.data);
      }
    } finally {
      setUpdating(false);
    }
  };

  const shortId = order._id.slice(-8).toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-5 min-w-0">
          <div className="shrink-0 min-w-[120px]">
            <p className="font-bold text-gray-900 text-base">{order.customerName}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">#{shortId}</p>
          </div>
          <div className="hidden sm:block shrink-0">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${order.orderType === 'Dine-in' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
              {order.orderType === 'Dine-in' ? '🍽 Dine-in' : '🥡 Takeaway'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-700">{order.scheduledDate}</p>
            <p className="text-xs text-gray-500 mt-0.5">{order.scheduledTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <StatusBadge status={order.status} />
          <div className="text-right min-w-[70px]">
            <p className="font-bold text-lg text-gray-900">${order.totalPrice.toFixed(2)}</p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Customer</p>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} />{order.customerEmail}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} />{order.customerPhone}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{order.orderType} · {order.scheduledDate} at {order.scheduledTime}</span>
                </div>
                {order.specialInstructions && (
                  <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2 mt-2">
                    <FileText size={14} className="mt-0.5 shrink-0" />
                    <span>{order.specialInstructions}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Items</p>
                <div className="space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                      <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span className="text-[#6B3A2A]">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              <p className="w-full text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Update Status</p>
              {['pending', 'confirmed', 'completed'].map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={updating || order.status === s}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${order.status === s
                    ? 'bg-[#6B3A2A] text-white border-[#6B3A2A] cursor-default'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#6B3A2A] hover:text-[#6B3A2A]'
                    } disabled:opacity-50`}>
                  {updating ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── RESERVATION CARD ──────────────────────────────────────────────────────────
function ReservationCard({ reservation, adminKey, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API}/api/reservations/${reservation._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        onStatusChange(data.data);
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800">{reservation.name}</p>
            <StatusBadge status={reservation.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500"><Mail size={13} />{reservation.customerEmail}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={13} />
            <span className="font-medium">{new Date(reservation.date).toDateString()}</span>
            <Clock size={13} className="ml-1" />
            <span>{reservation.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={13} />
            <span>{reservation.guests} {reservation.guests === 1 ? 'Guest' : 'Guests'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {['pending', 'confirmed', 'cancelled'].map(s => (
            <button key={s} onClick={() => updateStatus(s)} disabled={updating || reservation.status === s}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${reservation.status === s
                ? 'bg-[#6B3A2A] text-white border-[#6B3A2A] cursor-default'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#6B3A2A] hover:text-[#6B3A2A]'
                } disabled:opacity-50`}>
              {updating ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Admin() {
  const [adminKey, setAdminKey] = useState(null);
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const [oRes, rRes, mRes] = await Promise.all([
        fetch(`${API}/api/orders`, { headers: { 'x-admin-key': adminKey } }),
        fetch(`${API}/api/reservations`, { headers: { 'x-admin-key': adminKey } }),
        fetch(`${API}/api/menu`)
      ]);
      const [oData, rData, mData] = await Promise.all([oRes.json(), rRes.json(), mRes.json()]);
      if (oData.success) setOrders(oData.data);
      if (rData.success) setReservations(rData.data);
      if (mData.success) setMenuCount(mData.data.length);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!adminKey) return <PinScreen onUnlock={setAdminKey} />;

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const filteredReservations = statusFilter === 'all' ? reservations : reservations.filter(r => r.status === statusFilter);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.scheduledDate === todayStr).length;
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0);

  const TABS = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'reservations', label: 'Reservations', icon: Calendar, count: reservations.length },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, count: menuCount },
  ];

  const ORDER_STATUSES = ['all', 'pending', 'confirmed', 'completed'];
  const RESERVE_STATUSES = ['all', 'pending', 'confirmed', 'cancelled'];

  return (
    <div className="min-h-screen bg-[#E8E4DF]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top bar */}
      <div className="bg-[#1C1C1C] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coffee size={20} className="text-[#D4A96A]" />
          <span className="text-white font-semibold" style={{ fontFamily: 'Georgia, serif' }}>Brew & Co. Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setAdminKey(null)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-sm transition-colors">
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Orders', value: pendingOrders, color: 'text-orange-600' },
            { label: 'Pending Reservations', value: pendingReservations, color: 'text-blue-700' },
            { label: "Today's Orders", value: todayOrders, color: 'text-green-700' },
            { label: 'Total Revenue', value: `$${revenue.toFixed(2)}`, color: 'text-[#6B3A2A]' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-md border border-gray-300">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + filter */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex bg-white rounded-xl border border-gray-300 p-1 shadow-md">
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setStatusFilter('all'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-[#6B3A2A] text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}>
                <t.icon size={15} />
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {tab !== 'menu' && (
            <div className="flex gap-2 flex-wrap">
              {(tab === 'orders' ? ORDER_STATUSES : RESERVE_STATUSES).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === s
                    ? 'bg-[#6B3A2A] text-white border-[#6B3A2A]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#6B3A2A] hover:text-[#6B3A2A]'
                    }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-2" /> Loading...
          </div>
        ) : tab === 'menu' ? (
          <MenuTab adminKey={adminKey} />
        ) : tab === 'orders' ? (
          <div className="space-y-3">
            {filteredOrders.length === 0
              ? <div className="text-center py-16 text-gray-400">No orders found.</div>
              : filteredOrders.map(order => (
                <OrderCard key={order._id} order={order} adminKey={adminKey}
                  onStatusChange={updated => setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))} />
              ))
            }
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReservations.length === 0
              ? <div className="text-center py-16 text-gray-400">No reservations found.</div>
              : filteredReservations.map(reservation => (
                <ReservationCard key={reservation._id} reservation={reservation} adminKey={adminKey}
                  onStatusChange={updated => setReservations(prev => prev.map(r => r._id === updated._id ? updated : r))} />
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}