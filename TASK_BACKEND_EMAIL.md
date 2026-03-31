# ⚙️ BACKEND TASK — Email Notifications
# Read CONTEXT_BACKEND.md before starting.
# Only touch files inside /server. Nothing else.

## Goal
Add email notifications using Nodemailer + Gmail.

When a new order is placed:
- Owner receives email with full order details
- Customer receives order confirmation email

When a new reservation is made:
- Owner receives email with reservation details
- Customer receives reservation confirmation email

---

## Step 1 — Install Nodemailer

```
npm install nodemailer
```

---

## Step 2 — Add to server/.env

Add these lines (do not remove existing vars):

```
GMAIL_USER=your_cafe_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
OWNER_EMAIL=your_cafe_gmail@gmail.com
```

---

## Step 3 — Create /server/utils/emailService.js

Create this file from scratch:

```js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

// Send email helper
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Brew & Co." <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  })
}

// Owner email — new order
const sendOwnerOrderEmail = async (order) => {
  const itemsList = order.items
    .map(i => `<li>${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}</li>`)
    .join('')

  await sendEmail({
    to: process.env.OWNER_EMAIL,
    subject: `🛎️ New Order — $${order.totalPrice.toFixed(2)}`,
    html: `
      <h2>New Order Received</h2>
      <p><strong>Customer Email:</strong> ${order.customerEmail}</p>
      <ul>${itemsList}</ul>
      <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `
  })
}

// Customer email — order confirmation
const sendCustomerOrderEmail = async (order) => {
  const itemsList = order.items
    .map(i => `<li>${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}</li>`)
    .join('')

  await sendEmail({
    to: order.customerEmail,
    subject: `✅ Your order at Brew & Co. is confirmed!`,
    html: `
      <h2>Thanks for your order!</h2>
      <p>We're preparing your order right now.</p>
      <ul>${itemsList}</ul>
      <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
      <p>See you soon! ☕</p>
    `
  })
}

// Owner email — new reservation
const sendOwnerReservationEmail = async (reservation) => {
  await sendEmail({
    to: process.env.OWNER_EMAIL,
    subject: `📅 New Reservation — ${reservation.name}`,
    html: `
      <h2>New Reservation</h2>
      <p><strong>Name:</strong> ${reservation.name}</p>
      <p><strong>Email:</strong> ${reservation.customerEmail}</p>
      <p><strong>Date:</strong> ${new Date(reservation.date).toDateString()}</p>
      <p><strong>Time:</strong> ${reservation.time}</p>
      <p><strong>Guests:</strong> ${reservation.guests}</p>
    `
  })
}

// Customer email — reservation confirmation
const sendCustomerReservationEmail = async (reservation) => {
  await sendEmail({
    to: reservation.customerEmail,
    subject: `✅ Your reservation at Brew & Co. is confirmed!`,
    html: `
      <h2>Reservation Confirmed!</h2>
      <p>Hi ${reservation.name}, your table is booked.</p>
      <p><strong>Date:</strong> ${new Date(reservation.date).toDateString()}</p>
      <p><strong>Time:</strong> ${reservation.time}</p>
      <p><strong>Guests:</strong> ${reservation.guests}</p>
      <p>We look forward to seeing you! ☕</p>
    `
  })
}

module.exports = {
  sendOwnerOrderEmail,
  sendCustomerOrderEmail,
  sendOwnerReservationEmail,
  sendCustomerReservationEmail
}
```

---

## Step 4 — Update /server/models/Order.js

Add customerEmail field to the schema:

```js
customerEmail: { type: String, required: true }
```

---

## Step 5 — Update /server/models/Reservation.js

Add customerEmail field to the schema:

```js
customerEmail: { type: String, required: true }
```

---

## Step 6 — Update /server/controllers/orderController.js

In createOrder:
1. Accept customerEmail from req.body
2. Validate it is present and looks like an email — if missing return 400
3. Save it to the order
4. After successful save, call both email functions:

```js
const { sendOwnerOrderEmail, sendCustomerOrderEmail } = require('../utils/emailService')

// After order is saved:
try {
  await sendOwnerOrderEmail(newOrder)
  await sendCustomerOrderEmail(newOrder)
} catch (emailErr) {
  console.error('Email sending failed:', emailErr.message)
  // Do NOT fail the request if email fails — order is already saved
}
```

---

## Step 7 — Update /server/controllers/reservationController.js

In createReservation:
1. Accept customerEmail from req.body
2. Validate it is present — if missing return 400
3. Save it to the reservation
4. After successful save, call both email functions:

```js
const { sendOwnerReservationEmail, sendCustomerReservationEmail } = require('../utils/emailService')

// After reservation is saved:
try {
  await sendOwnerReservationEmail(newReservation)
  await sendCustomerReservationEmail(newReservation)
} catch (emailErr) {
  console.error('Email sending failed:', emailErr.message)
  // Do NOT fail the request if email fails — reservation is already saved
}
```

---

## Critical Rules

- If email fails, NEVER fail the API request — log the error and move on
- Never hardcode email addresses — always use process.env
- Wrap all DB operations in try/catch as before
- Follow the standard response format: { success: true, data: ... }

---

## ✅ Done when:

- node server.js starts without errors
- POST /api/orders with customerEmail → owner and customer both receive emails
- POST /api/reservations with customerEmail → owner and customer both receive emails
- POST without customerEmail → returns 400 error
- If email fails → request still returns 201 (order/reservation saved)
- No hardcoded values anywhere
