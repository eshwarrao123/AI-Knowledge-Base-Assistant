import { Schema, model } from 'mongoose';
import type { IConversation, IMessage } from '@/types/models';

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: {
        values: ['user', 'assistant'],
        message: 'Role must be either "user" or "assistant"',
      },
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true, // keep sub-document IDs for easy reference
  },
);

const conversationSchema = new Schema<IConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Conversation must belong to a user'],
      index: true,
    },
    document: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Conversation must be linked to a document'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Conversation title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

// Compound — list a user's recent conversations (sorted by last activity)
conversationSchema.index({ user: 1, updatedAt: -1 });

// Compound — filter all conversations for a specific document by a specific user
conversationSchema.index({ document: 1, user: 1 });

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
