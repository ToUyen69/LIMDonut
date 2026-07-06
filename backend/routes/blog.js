const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ id: req.params.id });
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    if (!req.body.title) return res.status(400).json({ message: 'Thiếu tiêu đề.' });
    if (!req.body.id) {
      req.body.id = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const post = await BlogPost.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'ID bài viết đã tồn tại.' });
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;
    const post = await BlogPost.findOneAndUpdate({ id: req.params.id }, update, { new: true });
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findOneAndDelete({ id: req.params.id });
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    res.json({ message: 'Đã xoá bài viết.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

module.exports = router;
