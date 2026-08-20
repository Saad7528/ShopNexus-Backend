import { Router } from 'express';
import { handleVisualSearch } from '../controllers/visual-search.controller';

const router: Router = Router();

// POST /api/search/visual
router.post('/visual', handleVisualSearch);

export default router;
