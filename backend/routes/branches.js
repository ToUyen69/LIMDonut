const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) return res.status(404).json({ message: 'Không tìm thấy chi nhánh.' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Không tìm thấy chi nhánh.' });
    res.json({ message: 'Đã xoá chi nhánh.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

module.exports = router;
