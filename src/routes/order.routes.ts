import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { createOrder, getMyOrders, getOrderById, trackOrderPublic } from '../controllers/order.controller';

const router = Router();

// Public Real-time Tracking Route (No login required)
router.get('/track/:trackingNumber', trackOrderPublic);

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

export default router;
