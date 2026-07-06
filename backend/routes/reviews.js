const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const optionalAuth = require('../middleware/auth');

// Tổng hợp rating trung bình + số review thật của 1 sản phẩm
async function computeSummary(productId) {
  const result = await Review.aggregate([
    { $match: { productId: parseInt(productId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (!result.length) return { avgRating: 0, count: 0 };
  return { avgRating: Math.round(result[0].avg * 10) / 10, count: result[0].count };
}

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { productId, rating, comment, userName } = req.body;
    if (!productId || !rating || !comment || !comment.trim()) {
      return res.status(400).json({ message: 'Thiếu thông tin đánh giá!' });
    }
    const review = new Review({
      productId,
      rating,
      comment,
      userId: req.userId || null,
      userName: req.userId ? (await require('../models/User').findById(req.userId).select('username')).username : (userName || 'Khách'),
    });
    await review.save();

    // Đồng bộ rating/số review hiển thị trên Product theo dữ liệu review thật
    try {
      const summary = await computeSummary(productId);
      if (summary.count > 0) {
        await Product.updateOne(
          { id: parseInt(productId) },
          { rating: Math.round(summary.avgRating), reviews: String(summary.count) }
        );
      }
    } catch (e) { /* không chặn tạo review nếu đồng bộ lỗi */ }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

// Tóm tắt rating thật: { avgRating, count }
router.get('/:productId/summary', async (req, res) => {
  try {
    res.json(await computeSummary(req.params.productId));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

module.exports = router;
