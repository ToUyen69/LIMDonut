const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const optionalAuth = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Bỏ ký tự lạ trong tên gốc để tránh path traversal / tên file hỏng
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Chỉ chấp nhận ảnh JPEG/PNG/WebP.'));
    }
    cb(null, true);
  }
});

// Upload 1 ảnh (khách vãng lai cũng dùng được — ảnh khiếu nại)
router.post('/', optionalAuth, (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Ảnh vượt quá 5MB.' : (err.message || 'Upload thất bại.');
      return res.status(400).json({ message: msg });
    }
    if (!req.file) return res.status(400).json({ message: 'Thiếu file ảnh (field "photo").' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
