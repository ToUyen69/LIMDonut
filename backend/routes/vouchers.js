const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * Kiểm tra voucher + tính số tiền giảm. Trả về { valid, discount, voucher } hoặc { valid: false, message }.
 * Dùng chung cho route validate và orders.js (server-side, không tin client).
 */
async function validateVoucher(code, orderTotal) {
  if (!code || !code.trim()) return { valid: false, message: 'Thiếu mã giảm giá.' };
  const voucher = await Voucher.findOne({ code: code.trim().toUpperCase() });
  if (!voucher) return { valid: false, message: 'Mã giảm giá không tồn tại.' };
  if (!voucher.active) return { valid: false, message: 'Mã giảm giá đã bị khoá.' };
  if (voucher.expiresAt && voucher.expiresAt < new Date()) return { valid: false, message: 'Mã giảm giá đã hết hạn.' };
  if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng.' };
  const total = parseInt(orderTotal) || 0;
  if (total < voucher.minOrderValue) {
    return { valid: false, message: `Đơn tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ mới dùng được mã này.` };
  }
  let discount = voucher.type === 'percent'
    ? Math.floor(total * voucher.value / 100)
    : voucher.value;
  if (voucher.maxDiscount !== null) discount = Math.min(discount, voucher.maxDiscount);
  discount = Math.min(discount, total);
  return { valid: true, discount, voucher };
}

// Kiểm tra mã (public) — trả số tiền giảm tính sẵn
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const result = await validateVoucher(code, orderTotal);
    if (!result.valid) return res.status(400).json({ message: result.message });
    res.json({
      code: result.voucher.code,
      type: result.voucher.type,
      value: result.voucher.value,
      discount: result.discount
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

// Danh sách voucher (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    res.json(await Voucher.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Tạo voucher (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { code, type, value } = req.body;
    if (!code || !type || value === undefined) {
      return res.status(400).json({ message: 'Thiếu code/type/value.' });
    }
    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Mã voucher đã tồn tại.' });
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

// Toggle active / cập nhật voucher (admin)
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher.' });
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

module.exports = router;
module.exports.validateVoucher = validateVoucher;
