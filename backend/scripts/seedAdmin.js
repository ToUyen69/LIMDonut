require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin account already exists — skipping.');
    return process.exit(0);
  }
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
  await User.create({ username: 'admin', email: 'admin@limdonut.com', password: hashed, role: 'admin' });
  console.log('Admin account created (username: admin).');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
