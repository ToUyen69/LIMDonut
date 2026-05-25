const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Lấy danh sách đơn hàng
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Tạo đơn hàng mới
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi không thể tạo đơn hàng!', error: err.message });
  }
});

module.exports = router;
