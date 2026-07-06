require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const products = require('./products.data.json');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Products already seeded (${existing} documents) — skipping. Xoá collection nếu muốn seed lại.`);
    return process.exit(0);
  }
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
