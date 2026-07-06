const jwt = require('jsonwebtoken');

module.exports = function optionalAuth(req, res, next) {
  req.userId = null;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch (_) {}
  }
  next();
};
