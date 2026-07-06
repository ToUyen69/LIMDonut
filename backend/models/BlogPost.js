const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  mainImage: { type: String, default: '' },
  detailImages: [{ type: String }],
  content: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
