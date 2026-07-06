const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const requireAdmin = require('../middleware/requireAdmin');
const { contactLimiter } = require('../middleware/rateLimiters');

router.post('/', contactLimiter, async (req, res) => {
  try {
    const { fullName, email, phone, branch, subject, message } = req.body;
    if (!fullName || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và nội dung.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Email không đúng định dạng.' });
    }
    const msg = await ContactMessage.create({ fullName, email, phone, branch, subject, message });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Chưa xử lý', 'Đã xử lý'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Không tìm thấy tin nhắn.' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

module.exports = router;
