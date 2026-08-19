import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import couponRoutes from './coupon.routes';
import adminRoutes from './admin.routes';
import vendorRoutes from './vendor.routes';
import orderRoutes from './order.routes';
import wishlistRoutes from './wishlist.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);
router.use('/vendors', vendorRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
