import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import User from '@models/User';
import { AppError } from '@middleware/errorHandler';
import { sendSuccess } from '@utils/response';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

const userPayload = (id: Types.ObjectId | string, name: string, email: string) => ({
  id: String(id),
  name,
  email,
});

// ─── Controllers ─────────────────────────────────────────────────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new AppError(String(errors.array()[0].msg), 400));
      return;
    }

    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const existing = await User.findOne({ email });
    if (existing) {
      next(new AppError('Email already registered', 409));
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(String(user._id));

    sendSuccess(
      res,
      { token, user: userPayload(user._id as Types.ObjectId, user.name, user.email) },
      'Account created successfully',
      201,
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new AppError(String(errors.array()[0].msg), 400));
      return;
    }

    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      next(new AppError('Invalid credentials', 401));
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      next(new AppError('Invalid credentials', 401));
      return;
    }

    const token = generateToken(String(user._id));

    sendSuccess(res, {
      token,
      user: userPayload(user._id as Types.ObjectId, user.name, user.email),
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    sendSuccess(res, {
      user: userPayload(user._id as Types.ObjectId, user.name, user.email),
    });
  } catch (err) {
    next(err);
  }
};
