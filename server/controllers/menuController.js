const MenuItem = require('../models/MenuItem');
const { createError } = require('../utils/helpers');

// @desc    Get all menu items
// @route   GET /api/menu
const getAllMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ category: 1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
const createMenuItem = async (req, res, next) => {
  try {
    const { name, price, category } = req.body;

    // Validate required fields
    if (!name || price === undefined || !category) {
      throw createError('Name, price, and category are required', 400);
    }

    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a menu item by ID
// @route   PUT /api/menu/:id
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!item) {
      throw createError('Menu item not found', 404);
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item by ID
// @route   DELETE /api/menu/:id
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      throw createError('Menu item not found', 404);
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
