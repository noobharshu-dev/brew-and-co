# Brew & Co.

A full-stack café ordering, payment, reservation, and admin management platform built with React, Express, MongoDB, and Razorpay.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933)](#)
[![React](https://img.shields.io/badge/React-19-61DAFB)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)](#)

## Overview

Brew & Co. is a café web application with a customer-facing storefront and an administrative dashboard. Customers can browse a menu, add items to cart, place prepaid orders, schedule dine-in or takeaway requests, and book tables. The admin area lets staff manage orders, reservations, and menu items from a single interface.

## Key Features

- Customer menu browsing with category-based items for Coffee, Desserts, and Snacks
- Persistent cart flow with quantity controls and checkout experience
- Razorpay-powered payment creation and signature verification for order completion
- Dine-in and takeaway scheduling with date and time selection
- PDF receipt generation for completed orders
- Table reservation form with validation and status management
- Automated order and reservation email notifications for customers and the owner
- Admin dashboard for viewing stats, updating order status, confirming reservations, and editing menu items
- Server-side security protections including CORS restrictions, payload limits, rate limiting, and input sanitization

## Tech Stack & Architecture

### Frontend
- React 19 with Vite
- React Router for route-based navigation
- Tailwind CSS for UI styling
- Framer Motion for animations
- Lucide React for icons
- jsPDF and jsPDF-AutoTable for receipt generation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Razorpay SDK for payment order creation and verification
- Nodemailer-based email delivery
- express-rate-limit, mongo-sanitize, and custom middleware for protection

### Project Structure

```text
brew-and-co/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.js
│   └── server.js
└── README.md
```

### Application Flow

1. The React client renders public pages such as Home, Menu, Cart, Reservation, and About.
2. Customer interactions call the Express API for menu data, order creation, payment verification, and reservation submission.
3. The admin dashboard uses protected routes and a shared admin key to manage orders and reservations.
4. The backend stores records in MongoDB and sends email notifications for completed transactions and bookings.

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm 10+
- MongoDB Atlas account or local MongoDB instance
- Razorpay account for test mode
- Gmail account for SMTP email delivery

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd brew-and-co-main
```

### 2. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Configure environment variables

Create a file named `.env` inside the server directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
ADMIN_KEY=your-secure-admin-key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
OWNER_EMAIL=owner@example.com
FRONTEND_URL=http://localhost:5173
```

Create a file named `.env` inside the client directory:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 4. Seed the menu data

```bash
cd ../server
node seed.js
```

### 5. Run the app locally

Start the backend:

```bash
cd server
node server.js
```

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

Open the frontend at `http://localhost:5173` and the backend health check at `http://localhost:5000/health`.

## Usage

### Customer Experience

- Visit the home page to explore branding and café information.
- Open the menu page to view available items.
- Add menu items to the cart, choose a schedule, and proceed to checkout.
- Complete payment through Razorpay and receive a receipt and confirmation email.
- Submit a reservation through the reservation page.

### Admin Experience

- Open `/admin` in the browser.
- Enter the configured admin key to unlock the dashboard.
- Review orders, update statuses, manage reservations, and create or edit menu items.

### Core API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/menu` | Fetch all menu items |
| POST | `/api/menu` | Create a menu item (admin) |
| PUT | `/api/menu/:id` | Update a menu item (admin) |
| DELETE | `/api/menu/:id` | Delete a menu item (admin) |
| POST | `/api/orders/create-payment` | Create a Razorpay payment order |
| POST | `/api/orders/verify-payment` | Verify payment and save an order |
| GET | `/api/orders` | Retrieve orders (admin) |
| PATCH | `/api/orders/:id/status` | Update order status (admin) |
| POST | `/api/reservations` | Create a reservation |
| GET | `/api/reservations` | Retrieve reservations (admin) |
| PATCH | `/api/reservations/:id/status` | Update reservation status (admin) |
| GET | `/health` | Backend health check |

> Protected admin operations require the `x-admin-key` header to match `ADMIN_KEY`.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and keep them scoped to the relevant frontend or backend area.
4. Test locally and ensure environment variables are documented if new ones are introduced.
5. Open a pull request with a clear summary of the change.

Please keep the project structure and existing conventions intact, especially around API routes, admin protection, and UI organization.

## License

This project is licensed under the MIT License.

```text
MIT License

Copyright (c) 2026 Brew & Co.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
