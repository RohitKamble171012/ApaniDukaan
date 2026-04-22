import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  shopId: Types.ObjectId;
  productName: string;
  category: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
  availability: boolean;
  isFromExcel: boolean;
  excelRowIndex?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    productName: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    brand: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'piece' },
    sku: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    tags: [{ type: String }],
    availability: { type: Boolean, default: true },
    isFromExcel: { type: Boolean, default: false },
    excelRowIndex: { type: Number }
  },
  { timestamps: true }
);

ProductSchema.index({ shopId: 1, sku: 1 });
ProductSchema.index({ shopId: 1, productName: 'text', category: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
