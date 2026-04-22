import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  shopId: Types.ObjectId;
  date: Date;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  topProducts: Array<{ productName: string; quantitySold: number; revenue: number }>;
  lowStockProducts: Array<{ productName: string; quantity: number; sku?: string }>;
  requestedUnavailableItems: Array<{ name: string; requestCount: number }>;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalyticsSnapshot>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    date: { type: Date, required: true },
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    topProducts: [{
      productName: String,
      quantitySold: Number,
      revenue: Number
    }],
    lowStockProducts: [{
      productName: String,
      quantity: Number,
      sku: String
    }],
    requestedUnavailableItems: [{
      name: String,
      requestCount: Number
    }]
  },
  { timestamps: true }
);

AnalyticsSchema.index({ shopId: 1, date: -1 });

export default mongoose.model<IAnalyticsSnapshot>('Analytics', AnalyticsSchema);
