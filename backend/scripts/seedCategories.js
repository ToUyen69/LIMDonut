require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  { name: 'Món mới', icon: 'bi-stars', order: 1 },
  { name: 'Bất ngờ Lịm', icon: 'bi-gift', order: 2 },
  { name: 'Cà phê & Cacao', icon: 'bi-cup-hot', order: 3 },
  { name: 'Trà & Quả', icon: 'bi-cup-straw', order: 4 },
  { name: 'Nguyên Bản', icon: 'bi-circle', order: 5 },
  { name: 'Mặn', icon: 'bi-egg-fried', order: 6 },
  { name: 'Combo', icon: 'bi-box2-heart', order: 7 },
  { name: 'Mochi', icon: 'bi-droplet', order: 8 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const cat of categories) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true });
  }
  console.log('Seeded', categories.length, 'categories');
  await mongoose.connection.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
