import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getWishlist, toggleWishlistItem } from '../controllers/wishlist.controller';

const router = Router();

router.get('/', requireAuth, getWishlist);
router.post('/toggle', requireAuth, toggleWishlistItem);

export default router;
