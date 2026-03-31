# 🎨 FRONTEND TASK — Collect Customer Email
# Read CONTEXT_FRONTEND.md before starting.
# Only touch files inside /client/src. Nothing else.

## Goal
Collect the customer's email address at two points:
1. Cart checkout — before placing an order
2. Reservation form — already has fields, just add email

---

## Change 1 — Cart Page (pages/Cart.jsx)

Add an email input above the "Place Order" button inside the Order Summary card.

Field:
- Label: "Your Email"
- Placeholder: "you@example.com"
- Type: email
- Required

State: add `const [customerEmail, setCustomerEmail] = useState('')`

Validation before submitting:
- Email must not be empty
- Must match basic email format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- If invalid: show inline error "Please enter a valid email address"

Update the placeOrder call in api.js to include customerEmail:

```js
export const placeOrder = async (cartItems, totalPrice, customerEmail) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cartItems.map(i => ({
        menuItem: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      totalPrice,
      customerEmail
    })
  })
  if (!res.ok) throw new Error('Order failed')
  return res.json()
}
```

Update the call in Cart.jsx to pass customerEmail:
```js
await placeOrder(cartItems, totalPrice, customerEmail)
```

Success message should include the email:
"Order placed! A confirmation has been sent to [customerEmail]"

---

## Change 2 — Reservation Page (pages/Reservation.jsx)

Add email field to the existing form:

Field:
- Label: "Your Email"
- Placeholder: "you@example.com"
- Type: email
- Required
- Position: after the Name field, before Date

Add to form state:
```js
const [formData, setFormData] = useState({
  name: '',
  email: '',   // add this
  date: '',
  time: '',
  guests: ''
})
```

Validation:
- Email must not be empty
- Must match basic email format

Update the makeReservation call in api.js to include email:

```js
export const makeReservation = async (formData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      customerEmail: formData.email,  // map email → customerEmail for backend
      date: formData.date,
      time: formData.time,
      guests: formData.guests
    })
  })
  if (!res.ok) throw new Error('Reservation failed')
  return res.json()
}
```

Success message should include the email:
"Your table is booked! A confirmation has been sent to [formData.email]"

---

## Design Rules

- Email input must match the existing input styling on each page
- Error message: small red text directly below the input
- Do not change any other part of the Cart or Reservation pages
- Do not touch any other files

---

## ✅ Done when:

- Cart page has email input above Place Order button
- Empty or invalid email shows inline error, blocks submission
- Successful order shows confirmation with the email address
- Reservation form has email field after Name
- Successful reservation shows confirmation with the email address
- Both api.js functions send customerEmail to backend
- No other files modified
