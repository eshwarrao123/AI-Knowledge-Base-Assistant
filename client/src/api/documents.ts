import api from '@/api/axios';
import type { ApiResponse } from '@/types/index';
import type {
  Document,
  DocumentListResponse,
  DocumentPreview,
  DocumentQueryParams,
} from '@/types/document';

export const uploadDocument = (file: File): Promise<import('axios').AxiosResponse<ApiResponse<{ document: Document }>>> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<ApiResponse<{ document: Document }>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDocuments = (
  params?: DocumentQueryParams,
): Promise<import('axios').AxiosResponse<ApiResponse<DocumentListResponse>>> =>
  api.get<ApiResponse<DocumentListResponse>>('/documents', { params });

export const getDocument = (
  id: string,
): Promise<import('axios').AxiosResponse<ApiResponse<{ document: Document }>>> =>
  api.get<ApiResponse<{ document: Document }>>(`/documents/${id}`);

export const deleteDocument = (
  id: string,
): Promise<import('axios').AxiosResponse<ApiResponse<{ message: string }>>> =>
  api.delete<ApiResponse<{ message: string }>>(`/documents/${id}`);

export const previewDocument = (
  id: string,
): Promise<import('axios').AxiosResponse<ApiResponse<DocumentPreview>>> =>
  api.get<ApiResponse<DocumentPreview>>(`/documents/${id}/preview`);
