const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1, name: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Danh mục đã tồn tại.' });
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    res.json({ message: 'Đã xoá danh mục.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

module.exports = router;
