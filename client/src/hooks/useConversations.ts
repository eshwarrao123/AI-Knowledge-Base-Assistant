import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as conversationsApi from '@/api/conversations';
import type { AskRequest, ConversationQueryParams } from '@/types/conversation';

const CONV_KEY = 'conversations';

export const useConversations = (params?: ConversationQueryParams) =>
  useQuery({
    queryKey: [CONV_KEY, params],
    queryFn: async () => {
      const { data } = await conversationsApi.getConversations(params);
      return data.data;
    },
  });

export const useConversation = (id: string | null) =>
  useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const { data } = await conversationsApi.getConversation(id!);
      return data.data;
    },
    enabled: !!id,
  });

export const useAskQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: AskRequest) =>
      conversationsApi.askQuestion(req).then((r) => r.data.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      conversationsApi.deleteConversation(id).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
};

export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await conversationsApi.getStats();
      return data.data;
    },
  });
