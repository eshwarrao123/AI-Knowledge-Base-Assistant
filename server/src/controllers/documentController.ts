import type { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import type { Types } from 'mongoose';
import DocumentModel from '@models/Document';
import { AppError } from '@middleware/errorHandler';
import { sendSuccess } from '@utils/response';
import { extractText } from '@utils/extractText';
import type { SupportedMimeType } from '@/types/models';

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      next(new AppError('No file uploaded', 400));
      return;
    }

    const { path: filePath, originalname, mimetype, size, filename } = req.file;

    // Normalise MIME type: browsers may send .md as text/plain or octet-stream
    const ext = path.extname(originalname).toLowerCase();
    const normalisedMime: SupportedMimeType =
      ext === '.md' ? 'text/markdown' : (mimetype as SupportedMimeType);

    const { text, metadata } = await extractText(filePath, normalisedMime);

    const document = await DocumentModel.create({
      name: filename,
      originalName: originalname,
      mimeType: normalisedMime,
      size,
      filePath,
      owner: req.user!.userId,
      extractedText: text,
      metadata,
    });

    sendSuccess(res, { document }, 'Document uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─── List ─────────────────────────────────────────────────────────────────────

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const query: Record<string, unknown> = { owner: req.user!.userId };

    if (search) {
      // Use regex for broad compatibility (text index requires MongoDB Atlas or manual setup)
      query.originalName = { $regex: search, $options: 'i' };
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-extractedText'), // exclude large field from list view
      DocumentModel.countDocuments(query),
    ]);

    sendSuccess(res, {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Single ───────────────────────────────────────────────────────────────────

export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const document = await DocumentModel.findOne({
      _id: req.params.id,
      owner: req.user!.userId,
    });

    if (!document) {
      next(new AppError('Document not found', 404));
      return;
    }

    sendSuccess(res, { document });
  } catch (err) {
    next(err);
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const document = await DocumentModel.findOne({
      _id: req.params.id,
      owner: req.user!.userId,
    });

    if (!document) {
      next(new AppError('Document not found', 404));
      return;
    }

    // Delete file from disk (ignore if already missing)
    try {
      await fs.unlink(document.filePath);
    } catch {
      // File may have been removed manually — not a fatal error
    }

    await DocumentModel.deleteOne({ _id: (document._id as Types.ObjectId) });

    sendSuccess(res, { message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Preview ──────────────────────────────────────────────────────────────────

export const previewDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const document = await DocumentModel.findOne({
      _id: req.params.id,
      owner: req.user!.userId,
    });

    if (!document) {
      next(new AppError('Document not found', 404));
      return;
    }

    let content = document.extractedText;

    // For txt/md, re-read the file to ensure latest content
    if (document.mimeType !== 'application/pdf') {
      try {
        content = await fs.readFile(document.filePath, 'utf-8');
      } catch {
        // Fall back to stored extractedText
      }
    }

    sendSuccess(res, {
      content,
      mimeType: document.mimeType,
      originalName: document.originalName,
    });
  } catch (err) {
    next(err);
  }
};
