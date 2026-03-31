export const fetchMenuItems = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("API Error fetching menu items:", error);
    throw error;
  }
};

export const placeOrder = async (cartItems, totalPrice, customerEmail, customerName, orderType, customerPhone, scheduledDate, scheduledTime, specialInstructions) => {
  try {
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
        customerEmail,
        customerName,
        customerPhone,
        orderType,
        scheduledDate,
        scheduledTime,
        specialInstructions
      })
    });
    if (!res.ok) throw new Error('Order failed');
    return await res.json();
  } catch (error) {
    console.error("API Error placing order:", error);
    throw error;
  }
};

export const makeReservation = async (formData) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        customerEmail: formData.email,
        date: formData.date,
        time: formData.time,
        guests: formData.guests
      })
    });
    if (!res.ok) throw new Error('Reservation failed');
    return await res.json();
  } catch (error) {
    console.error("API Error making reservation:", error);
    throw error;
  }
};