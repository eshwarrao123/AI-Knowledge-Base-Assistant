import type { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const send = (res: Response, status: number, message: string, extra?: object): void => {
  res.status(status).json({ success: false, message, ...extra });
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const error = err as Error & {
    statusCode?: number;
    code?: string | number;
    keyValue?: Record<string, unknown>;
    errors?: Record<string, { message: string }>;
    status?: number;
  };

  // ── Operational AppError ─────────────────────────────────────────────────
  if (error instanceof AppError) {
    send(res, error.statusCode, error.message);
    return;
  }

  // ── Mongoose CastError (invalid ObjectId) ────────────────────────────────
  if (error.name === 'CastError') {
    send(res, 400, 'Invalid ID format');
    return;
  }

  // ── Mongoose ValidationError ─────────────────────────────────────────────
  if (error.name === 'ValidationError' && error.errors) {
    const messages = Object.values(error.errors).map((e) => e.message).join('. ');
    send(res, 400, messages || 'Validation failed');
    return;
  }

  // ── Mongoose Duplicate Key (code 11000) ───────────────────────────────────
  if (error.code === 11000 || error.code === '11000') {
    send(res, 409, 'Resource already exists');
    return;
  }

  // ── JWT ───────────────────────────────────────────────────────────────────
  if (error.name === 'JsonWebTokenError') {
    send(res, 401, 'Invalid token');
    return;
  }
  if (error.name === 'TokenExpiredError') {
    send(res, 401, 'Token expired');
    return;
  }

  // ── OpenAI API errors ─────────────────────────────────────────────────────
  if (error.constructor?.name === 'APIError' || error.status === 429 || error.status === 503) {
    send(res, 503, 'AI service temporarily unavailable');
    return;
  }

  // ── Generic 500 ───────────────────────────────────────────────────────────
  logger.error('Unhandled error:', error.message, error.stack);

  const isDev = process.env.NODE_ENV !== 'production';
  send(res, 500, 'Internal server error', isDev ? { stack: error.stack } : {});
};
