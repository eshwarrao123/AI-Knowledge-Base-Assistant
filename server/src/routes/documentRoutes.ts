import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { param } from 'express-validator';
import { verifyToken } from '@middleware/auth';
import { AppError } from '@middleware/errorHandler';
import { upload } from '@config/upload';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  previewDocument,
} from '@controllers/documentController';

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

const router = Router();

// ─── Multer error wrapper ─────────────────────────────────────────────────────
// Converts MulterError → AppError so the centralized errorHandler formats it.
const handleUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(
        new AppError(
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File size must not exceed 10 MB'
            : err.message,
          400,
        ),
      );
      return;
    }
    if (err instanceof Error) {
      next(err);
      return;
    }
    next();
  });
};

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/', verifyToken, handleUpload, uploadDocument);
router.get('/', verifyToken, getDocuments);
router.get('/:id/preview', verifyToken, validateMongoId, previewDocument);
router.get('/:id', verifyToken, validateMongoId, getDocument);
router.delete('/:id', verifyToken, validateMongoId, deleteDocument);

export default router;
