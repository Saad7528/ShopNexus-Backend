import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  helpfulVotes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved', index: true },
    helpfulVotes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);

