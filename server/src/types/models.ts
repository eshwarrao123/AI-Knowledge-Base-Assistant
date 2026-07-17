import type { Document, Types } from 'mongoose';

// ─── Message (sub-document) ──────────────────────────────────────────────────

export interface IMessage {
  _id?: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  /** Select: false — not returned in queries unless explicitly requested */
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  /** Instance method — compare a plaintext password against the stored hash */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Document ────────────────────────────────────────────────────────────────

export type SupportedMimeType =
  | 'application/pdf'
  | 'text/plain'
  | 'text/markdown';

export interface IDocumentMetadata {
  pageCount?: number;
  wordCount?: number;
  charCount?: number;
}

export interface IDocument extends Document {
  name: string;
  originalName: string;
  mimeType: SupportedMimeType;
  size: number;
  filePath: string;
  owner: Types.ObjectId;
  extractedText: string;
  metadata: IDocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Conversation ────────────────────────────────────────────────────────────

export interface IConversation extends Document {
  user: Types.ObjectId;
  document: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}
