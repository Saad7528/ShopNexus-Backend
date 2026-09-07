import { Router } from 'express';
import { recordHeartbeat, getLiveSessions } from '../controllers/telemetry.controller';

const router: Router = Router();

// Public heartbeat ping from storefront
router.post('/heartbeat', recordHeartbeat);

// Live sessions fetch for admin telemetry
router.get('/live-sessions', getLiveSessions);

export default router;
