import { Schema, model } from 'mongoose';
import type { IDocument, SupportedMimeType } from '@/types/models';

const SUPPORTED_MIME_TYPES: SupportedMimeType[] = [
  'application/pdf',
  'text/plain',
  'text/markdown',
];

const documentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: {
        values: SUPPORTED_MIME_TYPES,
        message: '"{VALUE}" is not a supported file type',
      },
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be at least 1 byte'],
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Document owner is required'],
      index: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    metadata: {
      pageCount: { type: Number },
      wordCount: { type: Number },
      charCount: { type: Number },
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

// Compound — list a user's documents sorted by upload time (most recent first)
documentSchema.index({ owner: 1, createdAt: -1 });

// Text index — full-text search on document names
documentSchema.index({ name: 'text' });

const DocumentModel = model<IDocument>('Document', documentSchema);

export default DocumentModel;
