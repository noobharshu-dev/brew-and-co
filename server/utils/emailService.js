const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Brew & Co." <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  })
}

const getShortId = (id) => id.toString().slice(-8).toUpperCase()

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#F5ECD7;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5ECD7;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#6B3A2A;padding:36px 40px;border-radius:12px 12px 0 0;text-align:center;">
          <div style="font-size:32px;margin-bottom:6px;">☕</div>
          <h1 style="margin:0;color:#FFFAF0;font-size:26px;letter-spacing:3px;font-weight:normal;text-transform:uppercase;">Brew &amp; Co.</h1>
          <p style="margin:6px 0 0;color:#D4A96A;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Premium Café Experience</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFAF0;padding:40px;border-left:1px solid #E8D9C0;border-right:1px solid #E8D9C0;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1C1C1C;padding:28px 40px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="margin:0 0 8px;color:#D4A96A;font-size:13px;letter-spacing:1px;">FIND US</p>
          <p style="margin:0 0 4px;color:#F5ECD7;font-size:13px;">📍 123 Café Lane, Mumbai, India</p>
          <p style="margin:0 0 16px;color:#F5ECD7;font-size:13px;">📞 +91 98765 43210 &nbsp;|&nbsp; ✉️ cafe.brewandco@gmail.com</p>
          <p style="margin:0;color:#666;font-size:11px;">© 2026 Brew &amp; Co. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

const divider = `<hr style="border:none;border-top:1px solid #E8D9C0;margin:24px 0;"/>`

const badge = (text, color = '#6B3A2A') =>
  `<span style="display:inline-block;background:${color};color:#FFFAF0;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:20px;">${text}</span>`

// ─── CUSTOMER ORDER CONFIRMATION ─────────────────────────────────────────────
const sendCustomerOrderEmail = async (order) => {
  const shortId = getShortId(order._id)

  const itemsRows = order.items.map(i => `
    <tr>
      <td style="padding:12px 0;color:#1C1C1C;font-size:15px;border-bottom:1px solid #F0E6D3;">${i.name}</td>
      <td style="padding:12px 0;color:#6B3A2A;text-align:center;font-size:15px;border-bottom:1px solid #F0E6D3;">×${i.quantity}</td>
      <td style="padding:12px 0;color:#1C1C1C;text-align:right;font-size:15px;font-weight:bold;border-bottom:1px solid #F0E6D3;">₹${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join('')

  const specialNote = order.specialInstructions
    ? `<tr><td colspan="3" style="padding:12px 0 0;color:#888;font-size:13px;font-style:italic;">📝 Note: "${order.specialInstructions}"</td></tr>`
    : ''

  const content = `
    <h2 style="margin:0 0 4px;color:#6B3A2A;font-size:26px;font-weight:normal;">Your order is confirmed ✅</h2>
    <p style="margin:0 0 28px;color:#777;font-size:15px;">Hi <strong style="color:#1C1C1C;">${order.customerName}</strong>, we've received your order and we're on it.</p>

    <!-- Order Meta Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5ECD7;border-radius:10px;margin-bottom:28px;">
      <tr><td style="padding:24px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom:16px;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order ID</div>
              <div style="color:#1C1C1C;font-size:18px;font-weight:bold;font-family:monospace;letter-spacing:2px;">#${shortId}</div>
            </td>
            <td width="50%" style="padding-bottom:16px;text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Type</div>
              <div>${badge(order.orderType)}</div>
            </td>
          </tr>
          <tr>
            <td width="50%">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${order.orderType === 'Dine-in' ? 'Visit' : 'Pickup'} Date</div>
              <div style="color:#1C1C1C;font-size:15px;font-weight:bold;">${order.scheduledDate}</div>
            </td>
            <td width="50%" style="text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Time</div>
              <div style="color:#1C1C1C;font-size:15px;font-weight:bold;">${order.scheduledTime}</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${divider}

    <!-- Items -->
    <h3 style="margin:0 0 16px;color:#1C1C1C;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Your Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <th style="text-align:left;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;font-weight:normal;">Item</th>
        <th style="text-align:center;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;font-weight:normal;">Qty</th>
        <th style="text-align:right;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;font-weight:normal;">Price</th>
      </tr>
      ${itemsRows}
      ${specialNote}
      <tr><td colspan="3"><hr style="border:none;border-top:1px solid #E8D9C0;margin:12px 0 8px;"/></td></tr>
      <tr>
        <td colspan="2" style="font-size:14px;color:#777;padding-bottom:4px;">Subtotal</td>
        <td style="font-size:14px;color:#777;text-align:right;padding-bottom:4px;">₹${(order.totalPrice / 1.08).toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="2" style="font-size:14px;color:#777;padding-bottom:12px;">Tax (8%)</td>
        <td style="font-size:14px;color:#777;text-align:right;padding-bottom:12px;">₹${(order.totalPrice - order.totalPrice / 1.08).toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="2" style="font-size:17px;font-weight:bold;color:#1C1C1C;border-top:2px solid #1C1C1C;padding-top:10px;">Total</td>
        <td style="font-size:20px;font-weight:bold;color:#6B3A2A;text-align:right;border-top:2px solid #1C1C1C;padding-top:10px;">₹${order.totalPrice.toFixed(2)}</td>
      </tr>
    </table>

    ${divider}

    <!-- Payment Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5ECD7;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Payment ID</div>
              <div style="color:#1C1C1C;font-size:13px;font-family:monospace;">${order.paymentId || 'N/A'}</div>
            </td>
            <td width="50%" style="text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Payment Status</div>
              <div style="color:#16a34a;font-size:13px;font-weight:bold;">✅ Paid</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0;color:#777;font-size:14px;line-height:1.8;">
      Questions or changes? Call us at <strong style="color:#1C1C1C;">+91 98765 43210</strong> or reply to this email.<br/>
      We look forward to serving you. See you soon! ☕
    </p>
  `

  await sendEmail({
    to: order.customerEmail,
    subject: `✅ Order Confirmed #${shortId} — Brew & Co.`,
    html: emailWrapper(content)
  })
}

// ─── OWNER ORDER NOTIFICATION ─────────────────────────────────────────────────
const sendOwnerOrderEmail = async (order) => {
  const shortId = getShortId(order._id)

  const itemsRows = order.items.map(i => `
    <tr>
      <td style="padding:10px 0;color:#1C1C1C;font-size:15px;border-bottom:1px solid #F0E6D3;">${i.name}</td>
      <td style="padding:10px 0;color:#6B3A2A;text-align:center;font-size:15px;border-bottom:1px solid #F0E6D3;">×${i.quantity}</td>
      <td style="padding:10px 0;color:#1C1C1C;text-align:right;font-size:15px;font-weight:bold;border-bottom:1px solid #F0E6D3;">₹${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join('')

  const specialNote = order.specialInstructions
    ? `<tr><td colspan="2" style="padding-top:12px;"><div style="background:#FFF8E8;border-left:3px solid #D4A96A;padding:10px 14px;border-radius:0 6px 6px 0;color:#6B3A2A;font-size:14px;">📝 <strong>Special Instructions:</strong> ${order.specialInstructions}</div></td></tr>`
    : ''

  const content = `
    <h2 style="margin:0 0 4px;color:#6B3A2A;font-size:26px;font-weight:normal;">🛎️ New Order Received</h2>
    <p style="margin:0 0 28px;color:#777;font-size:15px;">A new order just came in. Details below.</p>

    <!-- Customer + Order Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5ECD7;border-radius:10px;margin-bottom:28px;">
      <tr><td style="padding:24px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom:16px;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order ID</div>
              <div style="color:#1C1C1C;font-size:18px;font-weight:bold;font-family:monospace;letter-spacing:2px;">#${shortId}</div>
            </td>
            <td width="50%" style="padding-bottom:16px;text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Type</div>
              <div>${badge(order.orderType)}</div>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding-bottom:16px;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Customer</div>
              <div style="color:#1C1C1C;font-size:15px;font-weight:bold;">${order.customerName}</div>
            </td>
            <td width="50%" style="padding-bottom:16px;text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Phone</div>
              <div style="color:#1C1C1C;font-size:15px;font-weight:bold;">${order.customerPhone}</div>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding-bottom:16px;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Email</div>
              <div style="color:#1C1C1C;font-size:14px;">${order.customerEmail}</div>
            </td>
            <td width="50%" style="padding-bottom:16px;text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Received At</div>
              <div style="color:#1C1C1C;font-size:14px;">${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </td>
          </tr>
          <tr>
            <td width="50%">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${order.orderType === 'Dine-in' ? 'Visit' : 'Pickup'} Date</div>
              <div style="color:#1C1C1C;font-size:15px;font-weight:bold;">${order.scheduledDate}</div>
            </td>
            <td width="50%" style="text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Time</div>
              <div style="color:#6B3A2A;font-size:15px;font-weight:bold;">${order.scheduledTime}</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${divider}

    <h3 style="margin:0 0 16px;color:#1C1C1C;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Order Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <th style="text-align:left;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;font-weight:normal;">Item</th>
        <th style="text-align:center;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;font-weight:normal;">Qty</th>
        <th style="text-align:right;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;font-weight:normal;">Price</th>
      </tr>
      ${itemsRows}
      ${specialNote}
      <tr>
        <td colspan="2" style="padding-top:16px;font-size:17px;font-weight:bold;color:#1C1C1C;">Total</td>
        <td style="padding-top:16px;font-size:20px;font-weight:bold;color:#6B3A2A;text-align:right;">₹${order.totalPrice.toFixed(2)}</td>
      </tr>
    </table>
  `

  await sendEmail({
    to: process.env.OWNER_EMAIL,
    subject: `🛎️ New Order #${shortId} | ${order.orderType} | ${order.scheduledDate} ${order.scheduledTime} | ₹${order.totalPrice.toFixed(2)}`,
    html: emailWrapper(content)
  })
}

// ─── CUSTOMER RESERVATION CONFIRMATION ────────────────────────────────────────
const sendCustomerReservationEmail = async (reservation) => {
  const content = `
    <h2 style="margin:0 0 4px;color:#6B3A2A;font-size:26px;font-weight:normal;">Your table is booked 🗓️</h2>
    <p style="margin:0 0 28px;color:#777;font-size:15px;">Hi <strong style="color:#1C1C1C;">${reservation.name}</strong>, we're looking forward to having you.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5ECD7;border-radius:10px;margin-bottom:28px;">
      <tr><td style="padding:28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom:20px;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Date</div>
              <div style="color:#1C1C1C;font-size:18px;font-weight:bold;">${new Date(reservation.date).toDateString()}</div>
            </td>
            <td width="50%" style="padding-bottom:20px;text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Time</div>
              <div style="color:#6B3A2A;font-size:18px;font-weight:bold;">${reservation.time}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Party Size</div>
              <div style="color:#1C1C1C;font-size:18px;font-weight:bold;">${reservation.guests} ${reservation.guests === 1 ? 'Guest' : 'Guests'}</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${divider}
    <p style="margin:0 0 8px;color:#777;font-size:14px;line-height:1.8;">
      📍 <strong style="color:#1C1C1C;">123 Café Lane, Mumbai, India</strong><br/>
      📞 <strong style="color:#1C1C1C;">+91 98765 43210</strong>
    </p>
    <p style="margin:16px 0 0;color:#aaa;font-size:13px;">Need to cancel or modify? Please call us at least 2 hours before your booking.</p>
  `

  await sendEmail({
    to: reservation.customerEmail,
    subject: `✅ Reservation Confirmed — ${new Date(reservation.date).toDateString()} at ${reservation.time} | Brew & Co.`,
    html: emailWrapper(content)
  })
}

// ─── OWNER RESERVATION NOTIFICATION ──────────────────────────────────────────
const sendOwnerReservationEmail = async (reservation) => {
  const content = `
    <h2 style="margin:0 0 4px;color:#6B3A2A;font-size:26px;font-weight:normal;">📅 New Reservation</h2>
    <p style="margin:0 0 28px;color:#777;font-size:15px;">A new table booking just came in.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5ECD7;border-radius:10px;">
      <tr><td style="padding:28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom:20px;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Guest Name</div>
              <div style="color:#1C1C1C;font-size:16px;font-weight:bold;">${reservation.name}</div>
            </td>
            <td width="50%" style="padding-bottom:20px;text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Party Size</div>
              <div style="color:#6B3A2A;font-size:16px;font-weight:bold;">${reservation.guests} Guests</div>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding-bottom:20px;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Email</div>
              <div style="color:#1C1C1C;font-size:14px;">${reservation.customerEmail}</div>
            </td>
            <td width="50%" style="padding-bottom:20px;text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Booked At</div>
              <div style="color:#1C1C1C;font-size:14px;">${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </td>
          </tr>
          <tr>
            <td width="50%">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Date</div>
              <div style="color:#1C1C1C;font-size:16px;font-weight:bold;">${new Date(reservation.date).toDateString()}</div>
            </td>
            <td width="50%" style="text-align:right;">
              <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Time</div>
              <div style="color:#6B3A2A;font-size:16px;font-weight:bold;">${reservation.time}</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  `

  await sendEmail({
    to: process.env.OWNER_EMAIL,
    subject: `📅 New Reservation — ${reservation.name} | ${new Date(reservation.date).toDateString()} at ${reservation.time} | ${reservation.guests} Guests`,
    html: emailWrapper(content)
  })
}

module.exports = {
  sendOwnerOrderEmail,
  sendCustomerOrderEmail,
  sendOwnerReservationEmail,
  sendCustomerReservationEmail
}