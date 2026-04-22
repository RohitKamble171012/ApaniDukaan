import mongoose, { Document, Schema, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  productId?: Types.ObjectId;
  productName: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  subtotal: number;
}

export interface IOrder extends Document {
  shopId: Types.ObjectId;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    note?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  deliveryType: 'pickup' | 'delivery';
  statusHistory: Array<{ status: OrderStatus; timestamp: Date; note?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: Number,
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'piece' },
  imageUrl: String,
  subtotal: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      note: String
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'online'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending'
    },
    deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String
    }]
  },
  { timestamps: true }
);

OrderSchema.index({ shopId: 1, createdAt: -1 });
OrderSchema.index({ shopId: 1, orderStatus: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
