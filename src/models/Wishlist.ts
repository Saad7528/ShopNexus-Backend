import { Schema, model, Document, Types } from 'mongoose';

export interface IWishlistItem {
  productId: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [WishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);
