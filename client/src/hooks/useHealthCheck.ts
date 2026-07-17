import { useQuery } from '@tanstack/react-query';
import api from '@api/axios';
import type { ApiResponse } from '@types/index';

interface HealthCheck {
  status: string;
  timestamp: string;
}

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<HealthCheck>>('/health');
      return data;
    },
  });
};
