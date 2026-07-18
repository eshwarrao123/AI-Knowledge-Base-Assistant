import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import DocumentModel from '@models/Document';
import Conversation from '@models/Conversation';
import { AppError } from '@middleware/errorHandler';
import { sendSuccess } from '@utils/response';
import { openai } from '@config/openai';
import { buildPrompt } from '@utils/buildPrompt';

// ─── Ask ──────────────────────────────────────────────────────────────────────

export const askQuestion = async (
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

    const { documentId, question, conversationId } = req.body as {
      documentId?: string;
      question?: string;
      conversationId?: string;
    };

    if (!documentId || !question) {
      next(new AppError('documentId and question are required', 400));
      return;
    }

    const document = await DocumentModel.findOne({
      _id: documentId,
      owner: req.user!.userId,
    });
    if (!document) { next(new AppError('Document not found', 404)); return; }
    if (!document.extractedText?.trim()) {
      next(new AppError('No text could be extracted from this document', 400));
      return;
    }

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user!.userId,
        document: documentId,
      });
      if (!conversation) { next(new AppError('Conversation not found', 404)); return; }
    } else {
      conversation = await Conversation.create({
        user: req.user!.userId,
        document: documentId,
        title: question.length > 60 ? question.slice(0, 60) + '…' : question,
        messages: [],
      });
    }

    const history = conversation.messages.slice(-4).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Call OpenAI
    let answer: string;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: buildPrompt(document.extractedText, question, history),
        max_tokens: 1000,
        temperature: 0.3,
      });
      answer = completion.choices[0]?.message?.content ?? 'No response generated.';
    } catch {
      next(new AppError('AI service temporarily unavailable', 503));
      return;
    }

    // Persist messages
    conversation.messages.push(
      { role: 'user', content: question, timestamp: new Date() },
      { role: 'assistant', content: answer, timestamp: new Date() },
    );
    await conversation.save();

    sendSuccess(res, {
      answer,
      conversationId: String(conversation._id),
      title: conversation.title,
    });
  } catch (err) {
    next(err);
  }
};

// ─── List Conversations ───────────────────────────────────────────────────────

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const documentId = typeof req.query.documentId === 'string' ? req.query.documentId : undefined;

    const query: Record<string, unknown> = { user: req.user!.userId };
    if (documentId) query.document = documentId;
    if (search) query.title = { $regex: search, $options: 'i' };

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('document', 'name originalName mimeType')
        .select('-messages'), // skip messages for list view
      Conversation.countDocuments(query),
    ]);

    sendSuccess(res, {
      conversations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Single Conversation ──────────────────────────────────────────────────────

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user!.userId,
    }).populate('document', 'name originalName mimeType');

    if (!conversation) { next(new AppError('Conversation not found', 404)); return; }

    sendSuccess(res, { conversation });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Conversation ──────────────────────────────────────────────────────

export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.userId,
    });

    if (!conversation) { next(new AppError('Conversation not found', 404)); return; }

    sendSuccess(res, { message: 'Conversation deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Stats helper (for dashboard) ────────────────────────────────────────────

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const [docCount, convCount] = await Promise.all([
      DocumentModel.countDocuments({ owner: userId }),
      Conversation.countDocuments({ user: userId }),
    ]);
    sendSuccess(res, { documents: docCount, conversations: convCount });
  } catch (err) {
    next(err);
  }
};
