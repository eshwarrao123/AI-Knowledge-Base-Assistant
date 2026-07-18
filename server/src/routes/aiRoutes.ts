import { Router } from 'express';
import { verifyToken } from '@middleware/auth';
import {
  askQuestion,
  getConversations,
  getConversation,
  deleteConversation,
  getStats,
} from '@controllers/aiController';

const router = Router();

router.post('/ask', verifyToken, askQuestion);
router.get('/stats', verifyToken, getStats);
router.get('/conversations', verifyToken, getConversations);
router.get('/conversations/:id', verifyToken, getConversation);
router.delete('/conversations/:id', verifyToken, deleteConversation);

export default router;
