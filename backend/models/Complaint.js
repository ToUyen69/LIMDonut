const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderCode: { type: String, required: true },
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  status: { type: String, enum: ['Chờ xử lý', 'Đã xử lý'], default: 'Chờ xử lý' },
  adminReply: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

complaintSchema.index({ orderId: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
