const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Coffee', 'Desserts', 'Snacks']
    },
    image: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
