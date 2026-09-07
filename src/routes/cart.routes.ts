import { Router } from 'express';
import { getCart, syncCart, addItemToCart, updateCartItem, clearCart } from '../controllers/cart.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', optionalAuth, getCart);
router.post('/sync', optionalAuth, syncCart);
router.post('/items', optionalAuth, addItemToCart);
router.patch('/items', optionalAuth, updateCartItem);
router.delete('/', optionalAuth, clearCart);

export default router;

