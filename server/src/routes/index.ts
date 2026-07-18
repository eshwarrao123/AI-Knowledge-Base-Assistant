import { Router, type Request, type Response } from 'express';
import { sendSuccess } from '@utils/response';
import authRoutes from '@routes/authRoutes';
import documentRoutes from '@routes/documentRoutes';
import aiRoutes from '@routes/aiRoutes';

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, { timestamp: new Date().toISOString() }, 'OK');
});

// ─── Feature Routers ──────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/', aiRoutes);

// Future routers:
// import conversationRoutes from '@routes/conversationRoutes';
// router.use('/conversations', conversationRoutes);

export { router as apiRouter };
