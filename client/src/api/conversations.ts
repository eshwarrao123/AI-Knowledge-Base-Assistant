import api from '@/api/axios';
import type { ApiResponse } from '@/types/index';
import type {
  AskRequest,
  AskResponse,
  Conversation,
  ConversationListResponse,
  ConversationQueryParams,
} from '@/types/conversation';

export const askQuestion = (data: AskRequest) =>
  api.post<ApiResponse<AskResponse>>('/ask', data);

export const getConversations = (params?: ConversationQueryParams) =>
  api.get<ApiResponse<ConversationListResponse>>('/conversations', { params });

export const getConversation = (id: string) =>
  api.get<ApiResponse<{ conversation: Conversation }>>(`/conversations/${id}`);

export const deleteConversation = (id: string) =>
  api.delete<ApiResponse<{ message: string }>>(`/conversations/${id}`);

export const getStats = () =>
  api.get<ApiResponse<{ documents: number; conversations: number }>>('/stats');
