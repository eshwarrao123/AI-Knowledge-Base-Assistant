import { Router } from 'express';
import { body, query, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '@middleware/auth';
import { AppError } from '@middleware/errorHandler';
import {
  askQuestion,
  getConversations,
  getConversation,
  deleteConversation,
  getStats,
} from '@controllers/aiController';

const router = Router();

// ─── /ask rate limiter: 10 req/min per IP ────────────────────────────────────
const askLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.userId ?? req.ip ?? 'unknown',
  handler: (_req, _res, next) => {
    next(new AppError('Too many requests. Please slow down.', 429));
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// ─── Validators ───────────────────────────────────────────────────────────────
const validateAsk = [
  body('documentId').isMongoId().withMessage('documentId must be a valid MongoDB ID'),
  body('question')
    .trim()
    .notEmpty().withMessage('question is required')
    .isLength({ min: 1, max: 500 }).withMessage('question must be between 1 and 500 characters'),
  body('conversationId')
    .optional()
    .isMongoId().withMessage('conversationId must be a valid MongoDB ID'),
];

const validateConvQuery = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt().withMessage('limit must be 1–50'),
];

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post('/ask', verifyToken, askLimiter, validateAsk, askQuestion);
router.get('/stats', verifyToken, getStats);
router.get('/conversations', verifyToken, validateConvQuery, getConversations);
router.get('/conversations/:id', verifyToken, validateMongoId, getConversation);
router.delete('/conversations/:id', verifyToken, validateMongoId, deleteConversation);

export default router;
