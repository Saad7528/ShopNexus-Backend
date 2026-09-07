import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
} from '../controllers/product.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', requireAuth, createProduct);
router.patch('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);
router.post('/reviews', requireAuth, addProductReview);

export default router;
