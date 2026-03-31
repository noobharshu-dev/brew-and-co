const mongoose = require('mongoose')
require('dotenv').config()
const MenuItem = require('./models/MenuItem')

const menuItems = [
  // Coffee
  { name: 'Espresso', price: 120, category: 'Coffee', description: 'A bold, concentrated shot of pure coffee essence with a rich crema.', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
  { name: 'Cappuccino', price: 160, category: 'Coffee', description: 'Perfectly balanced espresso with steamed milk and a thick layer of foam.', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400' },
  { name: 'Flat White', price: 170, category: 'Coffee', description: 'Velvety microfoam poured over a double shot of espresso.', image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400' },
  { name: 'Café Latte', price: 180, category: 'Coffee', description: 'Silky steamed milk blended with rich espresso, finished with delicate latte art.', image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400' },
  { name: 'Cold Brew', price: 190, category: 'Coffee', description: 'Slow-steeped for 20 hours for a smooth, naturally sweet iced coffee.', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { name: 'Mocha', price: 200, category: 'Coffee', description: 'Rich espresso meets premium chocolate and steamed milk, topped with cream.', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400' },
  // Desserts
  { name: 'Chocolate Lava Cake', price: 280, category: 'Desserts', description: 'Warm cake with a molten chocolate centre. Served with vanilla ice cream.', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400' },
  { name: 'Cheesecake', price: 260, category: 'Desserts', description: 'Creamy New York style cheesecake with seasonal berry compote.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400' },
  { name: 'Tiramisu', price: 290, category: 'Desserts', description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone.', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
  // Snacks
  { name: 'Avocado Toast', price: 320, category: 'Snacks', description: 'Sourdough with smashed avocado, cherry tomatoes and chilli flakes.', image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400' },
  { name: 'Croissant', price: 140, category: 'Snacks', description: 'Buttery, flaky, freshly baked every morning. Best with our coffee.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
  { name: 'Bruschetta', price: 220, category: 'Snacks', description: 'Toasted sourdough with vine tomatoes, fresh basil and olive oil.', image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' },
]

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')
  await MenuItem.deleteMany()
  console.log('Cleared existing menu items')
  await MenuItem.insertMany(menuItems)
  console.log(`✅ Seeded ${menuItems.length} menu items with INR prices`)
  mongoose.disconnect()
}

seed().catch(console.error)