export interface DocumentMetadata {
  pageCount?: number;
  wordCount?: number;
  charCount?: number;
}

export interface Document {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  owner: string;
  extractedText?: string;
  metadata?: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DocumentPreview {
  content: string;
  mimeType: string;
  originalName: string;
}

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
