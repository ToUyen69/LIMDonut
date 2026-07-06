const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const optionalAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const COMPLAINT_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 giờ theo chính sách 2.3/2.4

// Gửi khiếu nại (public, trong vòng 2 giờ kể từ khi đơn "Hoàn thành")
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { orderId, reason, description, photoUrl } = req.body;
    if (!orderId || !reason) {
      return res.status(400).json({ message: 'Thiếu mã đơn hàng hoặc lý do khiếu nại.' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    if (order.status !== 'Hoàn thành') {
      return res.status(400).json({ message: 'Chỉ khiếu nại được đơn đã hoàn thành.' });
    }

    const completedEntry = (order.statusHistory || []).find(h => h.status === 'Hoàn thành');
    if (!completedEntry || !completedEntry.at) {
      return res.status(400).json({ message: 'Không xác định được thời điểm hoàn thành đơn.' });
    }
    if (Date.now() - new Date(completedEntry.at).getTime() > COMPLAINT_WINDOW_MS) {
      return res.status(403).json({ message: 'Đã quá thời hạn khiếu nại (2 giờ).' });
    }

    const complaint = await Complaint.create({
      orderId: order._id,
      orderCode: order.orderId,
      reason,
      description: description || '',
      photoUrl: photoUrl || ''
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

// Danh sách khiếu nại (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Đổi trạng thái khiếu nại (admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Chờ xử lý', 'Đã xử lý'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Không tìm thấy khiếu nại.' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

module.exports = router;
