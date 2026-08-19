import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { createOrder, getMyOrders, getOrderById } from '../controllers/order.controller';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);

export default router;
