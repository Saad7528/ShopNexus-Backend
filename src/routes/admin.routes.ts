import { Router } from 'express';
import { getAdminMetrics } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/metrics', requireAuth, requireRole(['admin']), getAdminMetrics);

export default router;
