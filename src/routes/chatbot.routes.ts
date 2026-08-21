import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatbot.controller';

const router: Router = Router();

// POST /api/ai/chat
router.post('/chat', handleChatMessage);

export default router;
