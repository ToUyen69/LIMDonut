const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: 'avata.jpeg' },
  stars: { type: Number, default: 0 },
  favorites: [{ type: Number }],
  birthday: { type: Date, default: null },
  birthdayUpdateCount: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  active: { type: Boolean, default: true },
  resetOtp: { type: String, default: null },
  resetOtpExpiry: { type: Date, default: null },
  starsHistory: [{
    amount: Number,
    reason: String,
    at: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
