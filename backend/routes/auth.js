const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ĐĂNG KÝ
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra xem user đã tồn tại chưa
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email đã được sử dụng!' });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user theo username
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Tên đăng nhập không đúng!' });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng!' });

    // Tạo JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// QUÊN MẬT KHẨU / ĐỔI MẬT KHẨU
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // Tìm user theo username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập không đúng!' });
    }

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

module.exports = router;
