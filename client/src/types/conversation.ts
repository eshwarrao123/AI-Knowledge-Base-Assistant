export interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationDocument {
  _id: string;
  name: string;
  originalName: string;
  mimeType?: string;
}

export interface Conversation {
  _id: string;
  user: string;
  document: ConversationDocument;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface AskRequest {
  documentId: string;
  question: string;
  conversationId?: string;
}

export interface AskResponse {
  answer: string;
  conversationId: string;
  title: string;
}

export interface ConversationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  documentId?: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
