const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const optionalAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const { computeOrderTotals, classifyOrderServer } = require('../utils/pricing');
const { validateVoucher } = require('./vouchers');
const Voucher = require('../models/Voucher');

const VALID_TRANSITIONS = {
  'Đã đặt':        ['Đã xác nhận'],
  'Đã xác nhận':   ['Đang chuẩn bị'],
  'Đang chuẩn bị': ['Đã đóng gói'],
  'Đã đóng gói':   ['Đang giao', 'Sẵn sàng lấy'],
  'Đang giao':     ['Hoàn thành'],
  'Sẵn sàng lấy':  ['Hoàn thành'],
};

const EXCEPTION_STATUSES = ['Thanh toán thất bại', 'Giao thất bại', 'Không tới lấy', 'Đã hủy', 'Đã hoàn tiền'];
const TERMINAL_STATUSES = ['Hoàn thành', ...EXCEPTION_STATUSES];

router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    if (req.query.mine === 'true') {
      if (!req.userId) return res.status(401).json({ message: 'Vui lòng đăng nhập để xem đơn hàng.' });
      const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
      return res.json(orders);
    }
    if (req.query.all === 'true') {
      return requireAdmin(req, res, async () => {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
      });
    }
    return res.status(400).json({ message: 'Thiếu tham số truy vấn.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.get('/lookup', async (req, res) => {
  try {
    const { phone, name } = req.query;
    if (!phone || !name) return res.status(400).json({ message: 'Vui lòng cung cấp tên và số điện thoại.' });
    const orders = await Order.find({
      'customerInfo.phone': phone,
      'customerInfo.name': { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.userId) data.userId = req.userId;

    // Validate input
    if (!data.customerInfo || !data.customerInfo.name || !data.customerInfo.name.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập tên người nhận.' });
    }
    if (!data.customerInfo.phone || !/^\d{10}$/.test(data.customerInfo.phone)) {
      return res.status(400).json({ message: 'Số điện thoại phải gồm đúng 10 chữ số.' });
    }

    const isCustomParty = data.orderType === 'custom';

    if (!isCustomParty) {
      if (!Array.isArray(data.items) || data.items.length === 0) {
        return res.status(400).json({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm.' });
      }

      // Server-side price verification
      const computedTotal = computeOrderTotals(data.items, data.shippingFee || 0);
      const starsToUse = parseInt(data.starsToUse) || 0;
      // Giảm giá giới thiệu: tối đa 15% tạm tính, không cho client gửi số tuỳ ý
      const referralDiscount = Math.min(parseInt(data.referralDiscount) || 0, Math.floor(computedTotal * 0.15));
      data.referralDiscount = referralDiscount;

      // Voucher: validate lại phía server, không tin số tiền giảm client gửi.
      // Tính trên tạm tính hàng (không gồm phí ship) — cùng cơ sở với client
      let voucherDiscount = 0;
      if (data.voucherCode) {
        const goodsSubtotal = computedTotal - (parseInt(data.shippingFee) || 0);
        const vr = await validateVoucher(data.voucherCode, goodsSubtotal);
        if (!vr.valid) return res.status(400).json({ message: vr.message });
        voucherDiscount = vr.discount;
        data.voucherCode = vr.voucher.code;
        data.voucherDiscount = voucherDiscount;
      }

      const tolerance = starsToUse + 1;
      if (Math.abs(computedTotal - starsToUse - referralDiscount - voucherDiscount - data.totalAmount) > tolerance) {
        return res.status(400).json({ message: 'Giá trị đơn không khớp, vui lòng thử lại.' });
      }
    } else {
      if (!data.totalAmount || data.totalAmount <= 0) {
        return res.status(400).json({ message: 'Giá trị đơn Custom Party không hợp lệ.' });
      }
    }

    // Server recalculates deposit
    const cls = classifyOrderServer(data.totalAmount, isCustomParty);
    data.orderType = cls.orderType;
    data.depositPercent = cls.depositPercent;
    data.depositAmount = cls.depositAmount;
    data.remainingAmount = cls.remainingAmount;

    if (!data.statusHistory) {
      data.statusHistory = [{ status: data.status || 'Đã đặt', at: new Date() }];
    }

    const starsToUse = parseInt(data.starsToUse) || 0;
    delete data.starsToUse;

    if (starsToUse > 0 && req.userId) {
      const user = await User.findById(req.userId);
      if (!user || (user.stars || 0) < starsToUse) {
        return res.status(400).json({ message: 'Không đủ Lịm Star.' });
      }
      const maxStars = Math.floor(data.totalAmount * 0.3);
      const actualStars = Math.min(starsToUse, maxStars);
      user.stars -= actualStars;
      user.starsHistory.push({ amount: -actualStars, reason: `Dùng Star cho đơn ${data.orderId}`, at: new Date() });
      await user.save();
      data.starsUsed = actualStars;
    }

    // Retry up to 3 times on duplicate orderId
    let newOrder;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          data.orderId = 'DH-' + Math.floor(1000000 + Math.random() * 9000000);
        }
        newOrder = new Order(data);
        await newOrder.save();
        break;
      } catch (saveErr) {
        if (saveErr.code === 11000 && attempt < 2) continue;
        throw saveErr;
      }
    }

    // Tăng lượt dùng voucher sau khi đơn tạo thành công
    if (data.voucherCode) {
      try {
        await Voucher.updateOne({ code: data.voucherCode }, { $inc: { usedCount: 1 } });
      } catch (e) { /* non-blocking */ }
    }

    // Trừ tồn kho thật + cộng số đã bán cho từng món (không áp dụng cho Custom Party)
    if (!isCustomParty) {
      try {
        for (const item of data.items) {
          // item.id có dạng "12_{...options}" — lấy id số ở đầu
          const productId = parseInt(String(item.id).split('_')[0], 10);
          const qty = parseInt(item.quantity) || 0;
          if (!productId || qty <= 0) continue;
          const product = await Product.findOne({ id: productId });
          if (product) {
            product.stock = Math.max(0, (product.stock || 0) - qty);
            product.sold = (product.sold || 0) + qty;
            await product.save();
          }
        }
      } catch (e) { /* không chặn tạo đơn nếu cập nhật kho lỗi */ }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Lỗi không thể tạo đơn hàng!', error: err.message });
  }
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

    const { newStatus, evidencePhotoUrl } = req.body;
    if (!newStatus) return res.status(400).json({ message: 'Thiếu trạng thái mới.' });

    const current = order.status;
    if (TERMINAL_STATUSES.includes(current)) {
      return res.status(400).json({ message: `Đơn đã ở trạng thái cuối "${current}", không thể chuyển tiếp.` });
    }

    const isException = EXCEPTION_STATUSES.includes(newStatus);
    const allowed = VALID_TRANSITIONS[current] || [];

    if (!isException && !allowed.includes(newStatus)) {
      return res.status(400).json({ message: `Không thể chuyển từ "${current}" sang "${newStatus}".` });
    }

    if (newStatus === 'Đã đóng gói' && !evidencePhotoUrl) {
      return res.status(400).json({ message: 'Cần chụp ảnh bằng chứng trước khi đóng gói.' });
    }

    order.status = newStatus;
    if (evidencePhotoUrl) order.evidencePhotoUrl = evidencePhotoUrl;
    order.statusHistory.push({ status: newStatus, at: new Date() });
    await order.save();

    // Award stars on completion
    if (newStatus === 'Hoàn thành' && order.userId) {
      try {
        const baseStars = Math.round(order.totalAmount / 1000) * 100;
        const user = await User.findById(order.userId);
        if (user) {
          // Tháng sinh nhật x3 (ưu tiên, không cộng dồn với x2 đơn custom)
          const isBirthdayMonth = user.birthday && new Date(user.birthday).getMonth() === new Date().getMonth();
          let starAmount = baseStars;
          let reason = `Đơn ${order.orderId} hoàn thành`;
          if (isBirthdayMonth) {
            starAmount = baseStars * 3;
            reason += ' (x3 tháng sinh nhật)';
          } else if (order.orderType === 'custom') {
            starAmount = baseStars * 2;
          }
          user.stars = (user.stars || 0) + starAmount;
          user.starsHistory.push({ amount: starAmount, reason, at: new Date() });
          await user.save();
        }
      } catch (e) { /* non-blocking */ }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

router.patch('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

    if (order.orderType === 'custom') {
      if (!order.cancelDeadline || new Date() >= new Date(order.cancelDeadline)) {
        return res.status(403).json({ message: 'Đã quá mốc khóa, không thể hủy.' });
      }
    } else {
      if (order.status !== 'Đã đặt') {
        return res.status(403).json({ message: 'Đơn đã được xác nhận, không thể tự hủy.' });
      }
    }

    order.status = 'Đã hủy';
    order.statusHistory.push({ status: 'Đã hủy', at: new Date() });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

module.exports = router;
