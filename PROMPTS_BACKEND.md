# ⚙️ BACKEND PROMPTS — Claude Agent
# Café Website | Node.js + Express + MongoDB

> **Before every step:** Re-read `CONTEXT_BACKEND.md` fully.
> **Scope:** Only modify files inside `/server`. Nothing else.
> **After every step:** List every file you created or modified and one line on why.

---

## 🧩 STEP 1 — Server Setup

```
Set up the Express server for a café website backend.

Tasks:

1. Initialize a Node.js project inside /server
   Run: npm init -y
   Install: express mongoose dotenv cors

2. Create this exact folder structure:

   /server
   ├── config/
   │   └── db.js
   ├── models/
   ├── controllers/
   ├── routes/
   ├── middleware/
   │   └── errorHandler.js
   ├── utils/
   │   └── helpers.js
   ├── server.js
   ├── .env
   └── package.json

3. /config/db.js — MongoDB connection:
   - Use mongoose.connect() with MONGO_URI from .env
   - Log "MongoDB connected" on success
   - Log the error and exit process on failure

4. /middleware/errorHandler.js — global error handler:
   - Signature: (err, req, res, next)
   - Always return: { success: false, message: err.message || "Server error" }
   - Status code: err.statusCode || 500

5. server.js — entry point:
   - Import and call connectDB()
   - Use express.json() and cors()
   - CORS origin: http://localhost:5173
   - Mount routes (empty for now — just the shell):
     app.use('/api/menu', menuRoutes)
     app.use('/api/orders', orderRoutes)
     app.use('/api/reservations', reservationRoutes)
   - Mount errorHandler as the LAST middleware
   - Listen on PORT from .env

6. .env file:
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri_here
   JWT_SECRET=your_secret_here

✅ Done when:
- node server.js starts without errors
- "MongoDB connected" logs on startup
- GET http://localhost:5000 returns something (even a 404 JSON is fine)
- Folder structure matches exactly
```

---

## 🗄️ STEP 2 — Mongoose Models

```
Create all three Mongoose schemas inside /models.

1. /models/MenuItem.js
{
  name:        { type: String, required: [true, 'Name is required'] },
  price:       { type: Number, required: [true, 'Price is required'], min: 0 },
  category:    { type: String, required: true, enum: ['Coffee', 'Desserts', 'Snacks'] },
  image:       { type: String, default: '' },
  description: { type: String, default: '' }
},
{ timestamps: true }

2. /models/Order.js
{
  items: [
    {
      menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name:      { type: String, required: true },
      price:     { type: Number, required: true },
      quantity:  { type: Number, required: true, min: 1 }
    }
  ],
  totalPrice: { type: Number, required: true, min: 0 },
  status:     { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' }
},
{ timestamps: true }

3. /models/Reservation.js
{
  name:   { type: String, required: [true, 'Name is required'] },
  date:   { type: Date, required: [true, 'Date is required'] },
  time:   { type: String, required: [true, 'Time is required'] },
  guests: { type: Number, required: true, min: [1, 'Min 1 guest'], max: [20, 'Max 20 guests'] }
},
{ timestamps: true }

Rules:
- Export each model as default
- Use mongoose.model('ModelName', schema)
- Do not put any logic in model files — schemas only

✅ Done when:
- All 3 model files exist with correct schemas
- Required fields and validations are in place
- node server.js still starts without errors
```

---

## 🔌 STEP 3 — Menu API

```
Build full CRUD for menu items.

Standard response format — use this in EVERY response:
  Success: res.status(200).json({ success: true, data: result })
  Created: res.status(201).json({ success: true, data: result })
  Error:   next(error)  ← always pass to errorHandler, never res.json errors manually

1. /controllers/menuController.js — create these 4 functions:

   getAllMenuItems
   - GET /api/menu
   - Return all menu items sorted by category
   - Response: { success: true, data: [items] }

   createMenuItem
   - POST /api/menu
   - Body: { name, price, category, image, description }
   - Validate: name, price, category are required — if missing, throw error with status 400
   - Response: { success: true, data: newItem } with status 201

   updateMenuItem
   - PUT /api/menu/:id
   - Find by ID, update with req.body
   - If not found: throw error "Menu item not found" with status 404
   - Response: { success: true, data: updatedItem }

   deleteMenuItem
   - DELETE /api/menu/:id
   - If not found: throw error "Menu item not found" with status 404
   - Response: { success: true, data: {} }

2. /routes/menuRoutes.js
   GET    /        → getAllMenuItems
   POST   /        → createMenuItem
   PUT    /:id     → updateMenuItem
   DELETE /:id     → deleteMenuItem

   (Routes mount at /api/menu in server.js, so paths are relative)

3. In /utils/helpers.js, add:
   export const createError = (message, statusCode) => {
     const err = new Error(message)
     err.statusCode = statusCode
     return err
   }
   Use this in controllers: throw createError('Not found', 404)

✅ Done when:
- GET http://localhost:5000/api/menu returns { success: true, data: [] }
- POST with valid body creates and returns item with status 201
- POST with missing fields returns { success: false, message: "..." } with status 400
- PUT with valid ID updates and returns item
- DELETE with valid ID returns { success: true, data: {} }
- All errors go through errorHandler — no raw error objects in responses
```

---

## 📦 STEP 4 — Orders API

```
Build the order system.

1. /controllers/orderController.js — create 2 functions:

   createOrder
   - POST /api/orders
   - Expected body:
     {
       items: [
         { menuItem: "id", name: "...", price: 4.5, quantity: 2 }
       ],
       totalPrice: 9.0
     }
   - Validation (return 400 if fails):
     - items must be a non-empty array
     - totalPrice must be a positive number
     - each item must have name, price, quantity
   - Save order with status: "pending"
   - Response: { success: true, data: newOrder } with status 201

   getAllOrders
   - GET /api/orders
   - Return all orders, sorted by createdAt descending (newest first)
   - Response: { success: true, data: [orders] }

2. /routes/orderRoutes.js
   POST /  → createOrder
   GET  /  → getAllOrders

Rules:
- Wrap all DB operations in try/catch and pass errors to next()
- Do not recalculate totalPrice on the server — trust the value sent from frontend
  (price validation is frontend's job; backend just stores and validates structure)

✅ Done when:
- POST with valid body saves order and returns it with status 201
- POST with empty items array returns 400 error
- GET returns all orders sorted newest first
- All responses follow { success, data } format
```

---

## 📅 STEP 5 — Reservations API

```
Build the reservation system.

1. /controllers/reservationController.js — create 2 functions:

   createReservation
   - POST /api/reservations
   - Expected body: { name, date, time, guests }
   - Validation (return 400 if fails):
     - name: required, non-empty string
     - date: required, must be a valid date, must not be in the past
     - time: required, non-empty string
     - guests: required, must be between 1 and 20
   - Save reservation to DB
   - Response: { success: true, data: newReservation } with status 201

   getAllReservations
   - GET /api/reservations
   - Return all reservations, sorted by date ascending (soonest first)
   - Response: { success: true, data: [reservations] }

2. /routes/reservationRoutes.js
   POST /  → createReservation
   GET  /  → getAllReservations

Validation note:
- For past date check:
  const today = new Date(); today.setHours(0,0,0,0)
  if (new Date(date) < today) throw createError('Date cannot be in the past', 400)

✅ Done when:
- POST with valid body creates reservation and returns it with status 201
- POST with past date returns 400 with clear message
- POST with guests outside 1–20 returns 400
- POST with missing fields returns 400
- GET returns all reservations sorted by date ascending
```

---

## 🔐 STEP 6 — Admin Protection

```
Add lightweight admin protection for write operations on the menu.

Approach: simple API key in request header (no user auth system needed yet).

1. /middleware/authMiddleware.js
   - Read header: x-admin-key
   - Compare to ADMIN_KEY from .env
   - If missing or wrong: return { success: false, message: "Unauthorized" } with status 401
   - If correct: call next()

2. Add to .env:
   ADMIN_KEY=your_admin_secret_here

3. Apply authMiddleware to protected routes in menuRoutes.js:
   - POST   /api/menu       ← protected
   - PUT    /api/menu/:id   ← protected
   - DELETE /api/menu/:id   ← protected
   - GET    /api/menu       ← public (no protection)

4. In /utils/helpers.js, add a seed script comment block:
   // To seed test menu items, POST to /api/menu with x-admin-key header
   // Example body: { name: "Flat White", price: 4.5, category: "Coffee", description: "...", image: "..." }

Rules:
- Do not implement full JWT auth in this step — that's optional and separate
- Keep the middleware simple and readable
- The ADMIN_KEY check is sufficient for a portfolio project

✅ Done when:
- POST/PUT/DELETE /api/menu without correct header returns 401
- POST/PUT/DELETE /api/menu with correct x-admin-key header works normally
- GET /api/menu still works without any header
- No changes to order or reservation routes
```
