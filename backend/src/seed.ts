/**
 * Seed script — run after setting up .env
 * Usage: npx ts-node src/seed.ts
 *
 * This creates a sample shopkeeper, shop, and products for demo purposes.
 * It does NOT create a Firebase user — do that manually then update DEMO_FIREBASE_UID below.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User';
import Shop from './models/Shop';
import Product from './models/Product';

const DEMO_FIREBASE_UID = 'REPLACE_WITH_YOUR_FIREBASE_UID';
const DEMO_EMAIL = 'demo@smartshop.com';

const sampleProducts = [
  { productName: 'Basmati Rice 1kg', category: 'Groceries', brand: 'India Gate', price: 120, discountPrice: 110, quantity: 50, unit: 'kg', sku: 'GRC001', tags: ['rice', 'staple'], availability: true },
  { productName: 'Sunflower Oil 1L', category: 'Groceries', brand: 'Fortune', price: 160, discountPrice: 150, quantity: 30, unit: 'liter', sku: 'GRC002', tags: ['oil', 'cooking'], availability: true },
  { productName: 'Toor Dal 500g', category: 'Groceries', brand: 'Tata Sampann', price: 90, quantity: 40, unit: 'packet', sku: 'GRC003', tags: ['dal', 'pulses'], availability: true },
  { productName: 'Colgate Toothpaste 200g', category: 'Personal Care', brand: 'Colgate', price: 80, discountPrice: 72, quantity: 25, unit: 'piece', sku: 'PC001', tags: ['toothpaste', 'oral'], availability: true },
  { productName: 'Dove Soap 100g', category: 'Personal Care', brand: 'Dove', price: 55, quantity: 60, unit: 'piece', sku: 'PC002', tags: ['soap', 'bathing'], availability: true },
  { productName: 'Head & Shoulders Shampoo 180ml', category: 'Personal Care', brand: 'Head & Shoulders', price: 185, discountPrice: 170, quantity: 20, unit: 'bottle', sku: 'PC003', tags: ['shampoo', 'hair'], availability: true },
  { productName: 'Amul Butter 100g', category: 'Dairy', brand: 'Amul', price: 55, quantity: 15, unit: 'piece', sku: 'DRY001', tags: ['butter', 'dairy'], availability: true },
  { productName: 'Maggi Noodles 70g', category: 'Snacks', brand: 'Nestle', price: 14, quantity: 100, unit: 'packet', sku: 'SNK001', tags: ['noodles', 'instant'], availability: true },
  { productName: 'Lay\'s Chips Classic 26g', category: 'Snacks', brand: 'Lays', price: 20, quantity: 50, unit: 'packet', sku: 'SNK002', tags: ['chips', 'snacks'], availability: true },
  { productName: 'Bournvita 500g', category: 'Beverages', brand: 'Cadbury', price: 260, discountPrice: 240, quantity: 12, unit: 'piece', sku: 'BEV001', tags: ['health drink', 'chocolate'], availability: true },
  { productName: 'Surf Excel 1kg', category: 'Household', brand: 'HUL', price: 140, quantity: 8, unit: 'kg', sku: 'HH001', tags: ['detergent', 'washing'], availability: true },
  { productName: 'Harpic Toilet Cleaner 500ml', category: 'Household', brand: 'Harpic', price: 99, quantity: 5, unit: 'bottle', sku: 'HH002', tags: ['cleaner', 'toilet'], availability: true },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Create or find user
  let user = await User.findOne({ firebaseUid: DEMO_FIREBASE_UID });
  if (!user) {
    user = await User.create({
      firebaseUid: DEMO_FIREBASE_UID,
      email: DEMO_EMAIL,
      displayName: 'Demo Shopkeeper',
      onboardingComplete: false
    });
    console.log('✅ User created');
  }

  // Create shop
  let shop = await Shop.findOne({ ownerId: user._id });
  if (!shop) {
    shop = await Shop.create({
      ownerId: user._id,
      shopSlug: 'sharma-general-store',
      shopName: 'Sharma General Store',
      shopType: 'General Store',
      tagline: 'Everything you need, daily',
      description: 'Your neighbourhood general store with all daily essentials at the best prices.',
      address: { street: '12, Gandhi Market, Near Bus Stand', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
      contact: { phone: '9876543210', email: 'sharma@example.com', whatsapp: '9876543210' },
      paymentSettings: { acceptCash: true, acceptOnline: false },
      deliverySettings: { offersPickup: true, offersDelivery: false },
      currency: 'INR',
      isActive: true,
      isVisible: true
    });
    console.log(`✅ Shop created: /shop/sharma-general-store`);

    user.shopId = shop._id as any;
    user.onboardingComplete = true;
    await user.save();
  }

  // Create products
  const existing = await Product.countDocuments({ shopId: shop._id });
  if (existing === 0) {
    await Product.insertMany(sampleProducts.map(p => ({ ...p, shopId: shop!._id })));
    await Shop.findByIdAndUpdate(shop._id, { totalProducts: sampleProducts.length });
    console.log(`✅ ${sampleProducts.length} products created`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Shop URL: http://localhost:3000/shop/sharma-general-store`);
  console.log(`   Dashboard: http://localhost:3000/dashboard`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
