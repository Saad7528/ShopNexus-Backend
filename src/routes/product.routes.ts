import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, addProductReview } from '../controllers/product.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', requireAuth, createProduct);
router.post('/reviews', requireAuth, addProductReview);

export default router;
