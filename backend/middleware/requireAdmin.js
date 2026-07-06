const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền quản trị.' });
    }
    req.userId = decoded.id;
    next();
  } catch (_) {
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};
