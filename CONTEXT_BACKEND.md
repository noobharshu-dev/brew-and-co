# ⚙️ BACKEND AGENT CONTEXT — Café Website (Claude)

> You are the **Backend Agent** for a production-level café website.
> Read this file fully before writing any code. Follow every rule strictly.

---

## 🧠 Project Overview

A production-grade café website backend. You handle all server logic, database operations, and API responses.

The frontend is built separately by another agent. Your job is to deliver clean, reliable, well-structured APIs that the frontend can consume.

---

## 🎯 Your Objectives

- Build and maintain all REST API endpoints
- Connect and manage MongoDB via Mongoose
- Follow MVC pattern strictly
- Return consistent, predictable API responses
- Handle all errors properly — never let the server crash silently

---

## 🚫 Hard Boundaries — NEVER Cross These

| ❌ Never Do This |
|---|
| Touch anything inside `/client` |
| Write or modify any JSX / frontend code |
| Install frontend dependencies |
| Mix controller logic into route files |
| Rewrite the entire server from scratch |

---

## 📁 Your Workspace

You only touch files inside:

```
/server/
```

Full structure you own:

```
server/
├── config/
│   └── db.js               ← MongoDB connection setup
│
├── models/
│   ├── MenuItem.js          ← Mongoose schema for menu
│   ├── Order.js             ← Mongoose schema for orders
│   └── Reservation.js       ← Mongoose schema for reservations
│
├── controllers/
│   ├── menuController.js    ← Menu CRUD logic
│   ├── orderController.js   ← Order creation & retrieval
│   └── reservationController.js ← Reservation logic
│
├── routes/
│   ├── menuRoutes.js        ← Route definitions for /api/menu
│   ├── orderRoutes.js       ← Route definitions for /api/orders
│   └── reservationRoutes.js ← Route definitions for /api/reservations
│
├── middleware/
│   ├── errorHandler.js      ← Global error handler
│   └── authMiddleware.js    ← Auth guard (optional, JWT-based)
│
├── utils/
│   └── helpers.js           ← Shared utility functions
│
├── server.js                ← App entry point
├── .env                     ← Backend env vars only
└── package.json
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Pattern | MVC (Model-View-Controller) |
| Auth (optional) | JWT |

---

## 🗄️ Database Schemas

### `MenuItem.js`
```js
{
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: String, enum: ['Coffee', 'Desserts', 'Snacks'], required: true },
  image:       { type: String },
  description: { type: String }
}
```

### `Order.js`
```js
{
  items: [
    {
      menuItem:  { type: ObjectId, ref: 'MenuItem' },
      name:      String,
      price:     Number,
      quantity:  Number
    }
  ],
  totalPrice: { type: Number, required: true },
  status:     { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
  createdAt:  { type: Date, default: Date.now }
}
```

### `Reservation.js`
```js
{
  name:      { type: String, required: true },
  date:      { type: Date, required: true },
  time:      { type: String, required: true },
  guests:    { type: Number, required: true, min: 1 },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 🔌 API Endpoints

### Menu — `/api/menu`

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| GET | `/api/menu` | `getAllMenuItems` | Return all menu items |
| POST | `/api/menu` | `createMenuItem` | Add new item (admin) |
| PUT | `/api/menu/:id` | `updateMenuItem` | Edit item by ID (admin) |
| DELETE | `/api/menu/:id` | `deleteMenuItem` | Remove item by ID (admin) |

### Orders — `/api/orders`

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/api/orders` | `createOrder` | Place a new order |
| GET | `/api/orders` | `getAllOrders` | List all orders (admin) |

### Reservations — `/api/reservations`

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/api/reservations` | `createReservation` | Book a table |
| GET | `/api/reservations` | `getAllReservations` | List all reservations (admin) |

---

## 📦 Standard API Response Format

Always return responses in this shape — the frontend depends on it:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

**Status codes:**
| Situation | Code |
|---|---|
| Success (read) | 200 |
| Success (created) | 201 |
| Bad request / validation fail | 400 |
| Unauthorized | 401 |
| Not found | 404 |
| Server error | 500 |

---

## 🛡️ Middleware

### `errorHandler.js`
Global Express error handler. Catches errors thrown in controllers via `next(error)`.

```js
// Usage in controllers:
try {
  // ...logic
} catch (error) {
  next(error); // passes to errorHandler
}
```

### `authMiddleware.js` *(optional)*
JWT-based route guard. Apply to admin-only routes (POST/PUT/DELETE on menu, GET on orders/reservations).

---

## ⚙️ `server.js` — App Entry Point

Responsibilities:
- Initialize Express app
- Connect to MongoDB via `db.js`
- Register middleware (CORS, JSON parser, error handler)
- Mount all route files
- Listen on `PORT` from `.env`

```js
// .env variables needed:
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here   // only if using auth
```

CORS should allow requests from the frontend origin (`http://localhost:5173` in dev).

---

## ⚙️ Engineering Standards

- **MVC strictly enforced** — routes only call controllers, controllers handle logic, models handle data
- **No logic in route files** — routes are just maps to controller functions
- **Always validate inputs** — check required fields before hitting the DB
- **Use `async/await`** with `try/catch` everywhere — never `.then().catch()` chains
- **Consistent response format** — always use the standard shape defined above
- **Use env variables** — never hardcode secrets or connection strings
- **Comment non-obvious logic**
- **Improve or extend existing files** — do not rewrite from scratch unless instructed

---

## 🧩 MVC Flow (How It Works)

```
Request
   ↓
Route File        → /routes/menuRoutes.js
   ↓
Controller        → /controllers/menuController.js
   ↓
Model (Mongoose)  → /models/MenuItem.js
   ↓
MongoDB Atlas
   ↓
Response (JSON)   → { success, data } or { success, message }
```

---

## 🔁 Agent Workflow Rules

1. Read this file before every session
2. Focus on **one endpoint or feature at a time**
3. Do not touch anything outside `/server`
4. After completing a task, summarize what you changed and why
5. If a schema change is needed, update the model file and note the change clearly — the frontend agent may need to know
