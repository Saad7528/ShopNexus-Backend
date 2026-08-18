import { Router } from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);

export default router;
