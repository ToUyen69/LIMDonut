require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const BlogPost = require('../models/BlogPost');

const blogDetailImages = {
  'august-menu': ['blog_august-menu-1.jpg'],
  'khung-gio-hoat-dong': ['blog_khung-giờ-hđ-1.jpg', 'blog_khung-giờ-hđ-2.jpg'],
  'october-menu': ['blog_october-1-menu.jpg'],
  'new-flavor': ['blog_new-flavor-1.jpg'],
  'locket-widget': ['blog_locket-1.jpg'],
  'huong-vi-viet-nam': ['blog_vietnam-1.jpg'],
  'delivery-service': ['blog_delivery-1.jpg'],
  'pride-bite': ['blog_pride-donut-1.jpg'],
  'mochi-don-thu': ['blog_mochi-đón-thu-1.jpg'],
  'its-her-day': ['blog_her-day-1.jpg'],
  'november-menu': ['blog_november-menu-1.jpg'],
  'valentine-series': ['blog_valentine-1.jpg', 'blog_valentine-2.jpg'],
  'april-menu': ['blog_april-menu-1.jpg'],
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Update products: image field -> uploads/filename
  const products = await Product.find({});
  let pCount = 0;
  for (const p of products) {
    if (p.image && !p.image.startsWith('uploads/') && !p.image.startsWith('/uploads/')) {
      p.image = `uploads/${p.image}`;
      await p.save();
      pCount++;
    }
  }
  console.log(`Updated ${pCount} products`);

  // Update blog posts
  const posts = await BlogPost.find({});
  let bCount = 0;
  for (const post of posts) {
    let changed = false;
    if (post.mainImage && !post.mainImage.startsWith('uploads/') && !post.mainImage.startsWith('/uploads/')) {
      post.mainImage = `uploads/${post.mainImage}`;
      changed = true;
    }
    // Add detail images
    const details = blogDetailImages[post.id];
    if (details && (!post.detailImages || post.detailImages.length === 0)) {
      post.detailImages = details.map(d => `uploads/${d}`);
      changed = true;
    }
    if (changed) {
      await post.save();
      bCount++;
    }
  }
  console.log(`Updated ${bCount} blog posts`);

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(e => { console.error(e); process.exit(1); });
