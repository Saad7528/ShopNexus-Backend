import { Router } from 'express';
import { getFrequentlyBought, getPersonalized } from '../controllers/recommendation.controller';

const router: Router = Router();

// GET /api/recommendations/frequently-bought/:productId
router.get('/frequently-bought/:productId', getFrequentlyBought);

// GET /api/recommendations/personalized
router.get('/personalized', getPersonalized);

export default router;
