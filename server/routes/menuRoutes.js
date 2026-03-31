const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('/', getAllMenuItems);

// Protected (require x-admin-key header)
router.post('/', authMiddleware, createMenuItem);
router.put('/:id', authMiddleware, updateMenuItem);
router.delete('/:id', authMiddleware, deleteMenuItem);

module.exports = router;
