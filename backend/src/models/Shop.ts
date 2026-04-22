import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IShopHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface IShop extends Document {
  ownerId: Types.ObjectId;
  shopSlug: string;
  shopName: string;
  shopType: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  hours: {
    monday: IShopHours;
    tuesday: IShopHours;
    wednesday: IShopHours;
    thursday: IShopHours;
    friday: IShopHours;
    saturday: IShopHours;
    sunday: IShopHours;
  };
  paymentSettings: {
    acceptCash: boolean;
    acceptOnline: boolean;
    upiId?: string;
    razorpayAccountId?: string;
  };
  deliverySettings: {
    offersDelivery: boolean;
    offersPickup: boolean;
    deliveryRadius?: number;
    minOrderForDelivery?: number;
    deliveryCharge?: number;
  };
  currency: string;
  isActive: boolean;
  isVisible: boolean;
  qrCodeUrl?: string;
  inventoryFileUrl?: string;
  totalProducts: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShopHoursSchema = new Schema({
  open: { type: String, default: '09:00' },
  close: { type: String, default: '21:00' },
  closed: { type: Boolean, default: false }
}, { _id: false });

const ShopSchema = new Schema<IShop>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shopSlug: { type: String, required: true, unique: true, lowercase: true, index: true },
    shopName: { type: String, required: true },
    shopType: { type: String, required: true },
    tagline: { type: String },
    description: { type: String },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String },
      whatsapp: { type: String }
    },
    socialLinks: {
      instagram: String,
      facebook: String,
      website: String
    },
    hours: {
      monday: { type: ShopHoursSchema, default: {} },
      tuesday: { type: ShopHoursSchema, default: {} },
      wednesday: { type: ShopHoursSchema, default: {} },
      thursday: { type: ShopHoursSchema, default: {} },
      friday: { type: ShopHoursSchema, default: {} },
      saturday: { type: ShopHoursSchema, default: {} },
      sunday: { type: ShopHoursSchema, default: { closed: true } }
    },
    paymentSettings: {
      acceptCash: { type: Boolean, default: true },
      acceptOnline: { type: Boolean, default: false },
      upiId: String,
      razorpayAccountId: String
    },
    deliverySettings: {
      offersDelivery: { type: Boolean, default: false },
      offersPickup: { type: Boolean, default: true },
      deliveryRadius: Number,
      minOrderForDelivery: Number,
      deliveryCharge: { type: Number, default: 0 }
    },
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    qrCodeUrl: String,
    inventoryFileUrl: String,
    totalProducts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IShop>('Shop', ShopSchema);
