import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import couponRoutes from './coupon.routes';
import adminRoutes from './admin.routes';
import vendorRoutes from './vendor.routes';
import orderRoutes from './order.routes';
import wishlistRoutes from './wishlist.routes';
import chatbotRoutes from './chatbot.routes';
import visualSearchRoutes from './visual-search.routes';
import recommendationRoutes from './recommendation.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Core Features
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);
router.use('/vendors', vendorRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);

// Advanced AI & Notification Ecosystem (Features 9, 10, 11, 12)
router.use('/ai', chatbotRoutes);
router.use('/search', visualSearchRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/notifications', notificationRoutes);

export default router;
