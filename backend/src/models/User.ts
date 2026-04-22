import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  shopId?: Types.ObjectId;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    photoURL: { type: String },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    onboardingComplete: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
