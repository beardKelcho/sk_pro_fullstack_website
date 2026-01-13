import apiClient from '@/services/api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface BulkDeleteRequest {
  resource: 'equipment' | 'project' | 'task' | 'user' | 'maintenance';
  ids: string[];
}

export interface BulkUpdateStatusRequest {
  resource: 'equipment' | 'project' | 'task' | 'user' | 'maintenance';
  ids: string[];
  status: string;
}

export interface BulkAssignRequest {
  resource: 'task';
  ids: string[];
  assignedTo: string;
}

export interface BulkResponse {
  success: boolean;
  deletedCount?: number;
  updatedCount?: number;
  message: string;
}

export const bulkDelete = async (request: BulkDeleteRequest): Promise<BulkResponse> => {
  const response = await apiClient.delete<BulkResponse>('/bulk/delete', {
    data: request,
  });
  return response.data;
};

export const bulkUpdateStatus = async (request: BulkUpdateStatusRequest): Promise<BulkResponse> => {
  const response = await apiClient.put<BulkResponse>('/bulk/status', request);
  return response.data;
};

export const bulkAssign = async (request: BulkAssignRequest): Promise<BulkResponse> => {
  const response = await apiClient.put<BulkResponse>('/bulk/assign', request);
  return response.data;
};

// React Query Hooks
export const useBulkDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkDelete,
    onSuccess: (_, variables) => {
      // İlgili resource'u invalidate et
      queryClient.invalidateQueries({ queryKey: [variables.resource] });
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkUpdateStatus,
    onSuccess: (_, variables) => {
      // İlgili resource'u invalidate et
      queryClient.invalidateQueries({ queryKey: [variables.resource] });
    },
  });
};

export const useBulkAssign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkAssign,
    onSuccess: (_, variables) => {
      // İlgili resource'u invalidate et
      queryClient.invalidateQueries({ queryKey: [variables.resource] });
    },
  });
};

