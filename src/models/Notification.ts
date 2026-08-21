import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType = 'price_drop' | 'stock_alert' | 'order_update' | 'promo';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  productId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  oldPrice?: number;
  newPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['price_drop', 'stock_alert', 'order_update', 'promo'],
      default: 'promo',
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    oldPrice: Number,
    newPrice: Number,
    discountPercent: Number,
    imageUrl: String,
    linkUrl: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification>('Notification', notificationSchema);
