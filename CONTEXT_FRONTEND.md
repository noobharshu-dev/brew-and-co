# 🎨 FRONTEND PROMPTS — Gemini Agent
# Café Website | React + Vite + Tailwind

> **Before every step:** Re-read `CONTEXT_FRONTEND.md` fully.
> **Scope:** Only modify files inside `/client/src`. Nothing else.
> **After every step:** List every file you created or modified and one line on why.

---

## 🧩 STEP 1 — Project Setup

```
You are setting up the frontend for a premium café website.

Tech stack:
- React with Vite
- Tailwind CSS
- React Router DOM
- Framer Motion

Tasks:
1. Initialize Vite + React project inside /client
```bash
npm create vite@latest client -- --template react
cd client
npm install tailwindcss postcss autoprefixer react-router-dom lucide-react framer-motion
npx tailwindcss init -p
```
2. Install and configure Tailwind CSS
3. Install React Router DOM
4. Create this exact folder structure inside /client/src:

   /components     ← shared UI (Navbar, Footer, MenuCard, MenuModal, Button)
   /pages          ← one file per route
   /features       ← feature logic (cart/, menu/, reservation/)
   /services       ← api.js only
   /hooks          ← custom hooks
   /context        ← CartContext.jsx
   /utils          ← formatPrice.js

5. Set up routing in App.jsx with these routes:
   /              → Home.jsx
   /menu          → Menu.jsx
   /about         → About.jsx
   /contact       → Contact.jsx
   /cart          → Cart.jsx
   /reservation   → Reservation.jsx

6. Create a .env file with:
   VITE_API_URL=http://localhost:5000

7. Each page file should render a placeholder <h1> with the page name for now.

✅ Done when:
- `npm run dev` runs without errors
- All 6 routes render their placeholder heading
- Folder structure matches exactly
- No business logic yet — setup only
```

---

## 🏠 STEP 2 — Homepage

```
Build the Home page (pages/Home.jsx) for a premium café.

Sections to build (in order, top to bottom):

1. NAVBAR (components/Navbar.jsx)
   - Left: Café logo text (e.g. "Brew & Co.")
   - Center: Nav links → Home, Menu, About, Contact, Reservations
   - Right: Cart icon with item count badge (hardcode 0 for now)
   - Mobile: hamburger menu that toggles nav links
   - Sticky on scroll

2. HERO SECTION
   - Full-width background image (use an Unsplash café URL)
   - Overlay for readability
   - Large heading + short tagline
   - Two CTA buttons: "View Menu" → /menu, "Reserve a Table" → /reservation

3. FEATURED MENU SECTION
   - Heading: "Our Favourites"
   - 3 hardcoded placeholder MenuCard components
   - MenuCard props: { image, name, price, description, onAddToCart }
   - "Add to Cart" does nothing yet (wire up in Step 5)

4. ABOUT PREVIEW
   - Short paragraph about the café
   - Link: "Learn More" → /about

5. CUSTOMER REVIEWS
   - 3 static review cards (name, stars, quote)

6. FOOTER (components/Footer.jsx)
   - Nav links, social icons, copyright line

Design rules (non-negotiable):
- Colors: Brown #6B3A2A | Beige #F5ECD7 | Cream #FFFAF0 | Dark #1C1C1C
- Headings: Playfair Display (import from Google Fonts)
- Body: Inter or system sans-serif
- Mobile-first — test at 375px width
- Smooth hover transitions on buttons and links (transition-all duration-200)

✅ Done when:
- All 5 sections render correctly on desktop and mobile
- No console errors
- Navbar links navigate correctly
- MenuCard component exists in /components/MenuCard.jsx with correct props
```

---

## 🍽️ STEP 3 — Menu Page

```
Build the Menu page (pages/Menu.jsx).

Use this dummy data shape — it MUST match the real API shape exactly:

const dummyMenuItems = [
  {
    _id: "1",
    name: "Flat White",
    price: 4.5,
    category: "Coffee",
    image: "https://source.unsplash.com/400x300/?coffee",
    description: "Rich espresso with velvety steamed milk"
  },
  // add 5–6 more items across all 3 categories
]

Categories: "Coffee" | "Desserts" | "Snacks"

Build:
1. Category filter bar at the top
   - Tabs: All | Coffee | Desserts | Snacks
   - Active tab visually highlighted (brown underline or background)
   - Clicking filters the grid below

2. Menu grid
   - 3 columns on desktop, 2 on tablet, 1 on mobile
   - Renders <MenuCard /> for each filtered item
   - "Add to Cart" button on each card does nothing yet

3. Loading state
   - Show a centered spinner component when isLoading = true
   - (Set isLoading = false for now since we use dummy data)

4. Error state
   - Show a centered message "Failed to load menu. Please try again." when isError = true
   - (Set isError = false for now)

✅ Done when:
- All 3 category filters work correctly
- Grid is responsive at all breakpoints
- Loading and error states are coded (even if not triggered yet)
- dummy data shape matches the schema above exactly
```

---

## 🔗 STEP 4 — API Integration

```
Replace dummy data in Menu.jsx with a real API call.

1. In /services/api.js, create and export this function:

   export const fetchMenuItems = async () => {
     const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`)
     if (!res.ok) throw new Error('Failed to fetch menu')
     const data = await res.json()
     return data.data  // backend returns { success: true, data: [...] }
   }

2. In Menu.jsx, replace dummy data with:
   - Call fetchMenuItems() inside a useEffect
   - Track three states: menuItems, isLoading, isError
   - Show spinner while loading
   - Show error message on failure
   - Render filtered items on success

3. In Home.jsx, featured section:
   - Also fetch from /api/menu
   - Show only first 3 items returned
   - Same loading/error handling

Rules:
- Never call fetch/axios directly inside a component
- Always go through /services/api.js
- Never hardcode the API URL — always use import.meta.env.VITE_API_URL
- The backend returns: { success: true, data: [...] } — always read from .data

✅ Done when:
- Menu page loads real data when backend is running
- Loading spinner shows during fetch
- Error message shows if backend is unreachable
- No fetch calls exist outside of api.js
```

---

## 🛒 STEP 5 — Cart System

```
Implement the full cart system.

1. Create /context/CartContext.jsx
   Provide these values to the whole app:
   {
     cartItems,          // [{ _id, name, price, quantity, image }]
     addToCart(item),    // if item exists → increment qty, else add with qty: 1
     removeFromCart(id), // remove item by _id
     updateQuantity(id, qty), // set exact quantity (min 1)
     clearCart(),        // empty the array
     totalPrice          // computed: sum of (price * quantity)
   }
   - Persist cartItems to localStorage (load on mount, save on change)

2. Create /hooks/useCart.js
   export const useCart = () => useContext(CartContext)

3. Create /utils/formatPrice.js
   export const formatPrice = (price) => `$${price.toFixed(2)}`

4. Update Navbar.jsx
   - Import useCart
   - Show real cart item count in the badge

5. Update MenuCard.jsx
   - "Add to Cart" button calls addToCart(item) from useCart

6. Build Cart page (pages/Cart.jsx)
   - List all cartItems
   - For each item: image, name, unit price, quantity controls (− qty +), remove button
   - Show formatted total price (use formatPrice)
   - "Place Order" button → POST to /api/orders (add to api.js first)
   - On success: show "Order placed!" message + clearCart()
   - On failure: show "Order failed. Please try again."
   - If cart is empty: show "Your cart is empty" + link to /menu

Add to api.js:
   export const placeOrder = async (cartItems, totalPrice) => {
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
         totalPrice
       })
     })
     if (!res.ok) throw new Error('Order failed')
     return res.json()
   }

✅ Done when:
- Adding items from Menu page updates cart badge in Navbar
- Cart page shows correct items, quantities, and total
- Quantity controls work (min 1)
- Remove button works
- Place Order posts to backend and clears cart on success
- Cart survives page refresh (localStorage)
```

---

## 📅 STEP 6 — Reservation Page

```
Build the Reservation page (pages/Reservation.jsx).

Form fields (all required):
- Name (text input)
- Date (date input — no past dates)
- Time (select: 9:00 AM to 9:00 PM in 30-min slots)
- Number of Guests (number input, min 1, max 20)

Validation (before submitting):
- All fields must be filled
- Date cannot be in the past
- Guests must be between 1 and 20
- Show inline error messages under each invalid field

On submit:
- Show loading state on the button ("Booking...")
- POST to /api/reservations via api.js
- On success: hide form, show success message:
  "Your table is booked! We'll see you on [date] at [time]."
- On failure: show "Booking failed. Please try again."

Add to api.js:
   export const makeReservation = async (formData) => {
     const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(formData)
     })
     if (!res.ok) throw new Error('Reservation failed')
     return res.json()
   }

Design:
- Centered card layout on desktop
- Full-width on mobile
- Match the café color palette

✅ Done when:
- All validations fire correctly before submit
- API call posts correct data shape
- Success and failure states both render
- Form resets are NOT needed (success state replaces form)
```

---

## ✨ STEP 7 — Polish & Mobile Optimization

```
Final pass. Do not add new features — only improve existing ones.

Animations & Transitions:
- Navbar: add shadow on scroll (useEffect + window.addEventListener)
- MenuCard: subtle scale on hover (hover:scale-105 transition-transform)
- Buttons: slight lift on hover (hover:-translate-y-0.5)
- Cart badge: animate count change (CSS transition on content)
- Page transitions: add a simple fade-in on page mount for all pages

Mobile fixes (test at 375px):
- Navbar hamburger menu must fully work
- Menu grid must be single column
- Hero text must not overflow
- Cart items must stack vertically
- Reservation form must have full-width inputs

Spacing & Typography audit:
- Consistent section padding (py-16 on desktop, py-10 on mobile)
- No orphaned headings or cramped sections
- Line heights comfortable for reading

Performance:
- Add loading="lazy" to all images
- Use consistent alt text on all images

✅ Done when:
- Site looks polished at 375px, 768px, and 1280px
- No layout breaks at any breakpoint
- All hover effects work
- No console errors or warnings
```
