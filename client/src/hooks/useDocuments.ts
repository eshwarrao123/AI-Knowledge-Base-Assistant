import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as documentsApi from '@/api/documents';
import type { DocumentQueryParams } from '@/types/document';

const DOCUMENTS_KEY = 'documents';

export const useDocuments = (params?: DocumentQueryParams) =>
  useQuery({
    queryKey: [DOCUMENTS_KEY, params],
    queryFn: async () => {
      const { data } = await documentsApi.getDocuments(params);
      return data.data;
    },
  });

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      documentsApi.uploadDocument(file).then((r) => r.data.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      documentsApi.deleteDocument(id).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
    },
  });
};

export const usePreviewDocument = (id: string | null) =>
  useQuery({
    queryKey: ['document-preview', id],
    queryFn: async () => {
      const { data } = await documentsApi.previewDocument(id!);
      return data.data;
    },
    enabled: !!id,
  });
