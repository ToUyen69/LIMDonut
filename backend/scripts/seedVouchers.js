require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Voucher = require('../models/Voucher');

const VOUCHERS = [
  // Giảm 10% cho đơn đầu, tối đa 50k
  { code: 'WELCOME10', type: 'percent', value: 10, minOrderValue: 0, maxDiscount: 50000 },
  // Giảm cố định 20k (tương đương phí ship trong 5km), đơn từ 100k
  { code: 'FREESHIP', type: 'amount', value: 20000, minOrderValue: 100000 },
  // Giảm 15% cho đơn tiệc từ 500k, tối đa 150k
  { code: 'PARTY15', type: 'percent', value: 15, minOrderValue: 500000, maxDiscount: 150000 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const v of VOUCHERS) {
    const existing = await Voucher.findOne({ code: v.code });
    if (existing) {
      console.log(`${v.code} đã tồn tại — bỏ qua.`);
      continue;
    }
    await Voucher.create(v);
    console.log(`Đã tạo voucher ${v.code}.`);
  }
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
