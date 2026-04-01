# ☕ Brew & Co. — Premium Café Website

A production-grade, full-stack café web application built with React, Node.js, Express, and MongoDB. Features real payment processing, email notifications, PDF receipts, and a complete admin dashboard.

**Live Demo:** [brewandcocafe.vercel.app](https://brewandcocafe.vercel.app)

---

## ✨ Features

### Customer-Facing
- **Dynamic Menu** — Browse items by category (Coffee, Desserts, Snacks) with real-time data from the backend
- **Cart System** — Add/remove items, quantity controls, persistent across page refreshes via localStorage
- **Razorpay Payments** — Secure, real payment processing in INR with signature verification
- **Order Scheduling** — Choose Dine-in or Takeaway with date and time slot selection
- **PDF Receipt** — Downloadable, professionally designed receipt after every order
- **Table Reservations** — Book a table with full form validation
- **Email Confirmations** — Branded HTML emails sent to customers after orders and reservations

### Owner/Admin
- **Admin Dashboard** — Accessible at `/admin` with password protection
- **Order Management** — View all orders, expand for full details, update status (Pending → Confirmed → Completed)
- **Reservation Management** — View and manage all reservations, confirm or cancel
- **Menu Management** — Add, edit, and delete menu items directly from the dashboard
- **Real-time Stats** — Pending orders, today's orders, total revenue at a glance
- **Owner Email Alerts** — Instant email notification for every new order and reservation

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Payments | Razorpay |
| Email | Resend |
| PDF | jsPDF + jsPDF-AutoTable |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
brew-and-co/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # Navbar, Footer, MenuCard
│   │   ├── pages/            # Home, Menu, Cart, Reservation, About, Contact, Admin
│   │   ├── context/          # CartContext (global state)
│   │   ├── hooks/            # useCart
│   │   ├── services/         # api.js (all API calls)
│   │   └── utils/            # formatPrice
│   └── vercel.json           # Vercel routing config
│
├── server/                   # Express backend
│   ├── config/               # MongoDB connection
│   ├── controllers/          # Business logic
│   ├── middleware/            # Auth, error handler, rate limiting
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── utils/                # emailService, helpers
│   └── server.js             # Entry point
│
└── .gitignore
```

---

## 🔌 API Endpoints

### Menu
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | Public | Get all menu items |
| POST | `/api/menu` | Admin | Add new item |
| PUT | `/api/menu/:id` | Admin | Update item |
| DELETE | `/api/menu/:id` | Admin | Delete item |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/create-payment` | Public | Create Razorpay payment order |
| POST | `/api/orders/verify-payment` | Public | Verify payment + save order |
| GET | `/api/orders` | Admin | Get all orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

### Reservations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/reservations` | Public | Create reservation |
| GET | `/api/reservations` | Admin | Get all reservations |
| PATCH | `/api/reservations/:id/status` | Admin | Update reservation status |

> Admin routes require `x-admin-key` header.

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Razorpay account (test mode)
- Resend account

### Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
ADMIN_KEY=your_secure_admin_key
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RESEND_API_KEY=re_xxxxxxxxxxxx
OWNER_EMAIL=your_email@gmail.com
FRONTEND_URL=http://localhost:5173
```

```bash
node server.js
```

### Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
```

```bash
npm run dev
```

### Seed Menu Data

```bash
cd server
node seed.js
```

---

## 🌐 Deployment

| Service | Platform | Config |
|---|---|---|
| Frontend | Vercel | Root: `client`, Framework: Vite |
| Backend | Render | Root: `server`, Start: `node server.js` |
| Database | MongoDB Atlas | M0 Free Tier |

After deploying backend, add `FRONTEND_URL=https://your-app.vercel.app` to Render environment variables.

---

## 🔐 Security

- **Rate Limiting** — 100 req/15min (general), 20 req/15min (payments), 10 req/hour (reservations)
- **NoSQL Injection Protection** — `mongo-sanitize` strips malicious operators from all input
- **XSS Protection** — HTML tags stripped from all string fields server-side
- **Razorpay Signature Verification** — Payment authenticity cryptographically verified before order is saved
- **Admin Protection** — All write/read admin operations require a secret key header
- **CORS** — Locked to specific frontend origin
- **Payload Limit** — JSON body capped at 10kb

---

## 📸 Screenshots

> Home Page · Menu · Cart & Checkout · Admin Dashboard

---

## 🧪 Test Payment

Use Razorpay test credentials:
```
Card Number: 5267 3181 8797 5449
Expiry:      Any future date
CVV:         Any 3 digits
OTP:         1234
```

---

## 👨‍💻 Author

Built by **Harshit** — [github.com/noobharshu-dev](https://github.com/noobharshu-dev)

---

## 📄 License

MIT — free to use and modify.
