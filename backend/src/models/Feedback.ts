import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeedback extends Document {
  shopId: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  type: 'feedback' | 'item_request';
  message?: string;
  rating?: number;
  requestedItems?: Array<{ name: string; quantity?: string; note?: string }>;
  status: 'new' | 'reviewed' | 'converted';
  reviewedAt?: Date;
  convertedToProducts?: Types.ObjectId[];
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    customerName: String,
    customerPhone: String,
    type: { type: String, enum: ['feedback', 'item_request'], required: true },
    message: String,
    rating: { type: Number, min: 1, max: 5 },
    requestedItems: [{
      name: String,
      quantity: String,
      note: String
    }],
    status: { type: String, enum: ['new', 'reviewed', 'converted'], default: 'new' },
    reviewedAt: Date,
    convertedToProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
