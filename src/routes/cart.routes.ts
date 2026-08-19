import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, clearCart } from '../controllers/cart.controller';

const router: Router = Router();

router.get('/', getCart);
router.post('/items', addItemToCart);
router.patch('/items', updateCartItem);
router.delete('/', clearCart);

export default router;
