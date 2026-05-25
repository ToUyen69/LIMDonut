const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerInfo: {
    name: String,
    phone: String,
    address: String,
    deliveryTime: String,
    notes: String
  },
  items: [{
    id: Number,
    name: String,
    price: Number,
    quantity: Number,
    options: Object,
    image: String
  }],
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ['Chờ xác nhận', 'Chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
    default: 'Chờ xác nhận'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
