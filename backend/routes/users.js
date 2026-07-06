const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('username email phone stars avatar createdAt active')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.patch('/:id/stars', requireAdmin, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || !reason) return res.status(400).json({ message: 'Thiếu số sao hoặc lý do.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    user.stars = Math.max(0, user.stars + Number(amount));
    user.starsHistory.push({ amount: Number(amount), reason });
    await user.save();
    res.json({ stars: user.stars });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.patch('/:id/toggle-active', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    user.active = user.active === false ? true : false;
    await user.save();
    res.json({ active: user.active });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

module.exports = router;
