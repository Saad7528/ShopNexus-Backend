import { Notification, INotification } from '../models/Notification';
import { Product } from '../models/Product';
import { Types } from 'mongoose';

export class PriceDropService {
  /**
   * Check for price drops and dispatch in-app notifications
   */
  public static async dispatchPriceDropAlert(params: {
    userId: string;
    productId: string;
    oldPrice: number;
    newPrice: number;
  }): Promise<INotification> {
    const { userId, productId, oldPrice, newPrice } = params;
    const product = await Product.findById(productId);

    const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    const title = `🔥 Price Drop Alert: ${discountPercent}% Off!`;
    const message = `Great news! "${product?.title || 'An item in your wishlist'}" just dropped from $${oldPrice} to $${newPrice}!`;

    const notification = await Notification.create({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      title,
      message,
      type: 'price_drop',
      oldPrice,
      newPrice,
      discountPercent,
      imageUrl: product?.images?.[0],
      linkUrl: `/products/${productId}`,
      isRead: false,
    });

    return notification;
  }

  /**
   * Get user notifications
   */
  public static async getUserNotifications(userId: string) {
    const notifications = await Notification.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });

    return { notifications, unreadCount };
  }

  /**
   * Mark notification as read
   */
  public static async markAsRead(notificationId: string, userId: string) {
    return await Notification.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all user notifications as read
   */
  public static async markAllAsRead(userId: string) {
    return await Notification.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
  }
}
