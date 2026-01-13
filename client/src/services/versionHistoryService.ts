import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VersionHistory {
  _id: string;
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance';
  resourceId: string;
  version: number;
  data: any;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  changedBy: {
    _id: string;
    name: string;
    email: string;
  };
  changedAt: string;
  comment?: string;
  isRolledBack: boolean;
  createdAt: string;
}

export interface VersionHistoryResponse {
  success: boolean;
  versions: VersionHistory[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Resource'un versiyon geçmişini getir
 */
export const getResourceVersionHistory = async (
  resource: string,
  resourceId: string,
  page: number = 1,
  limit: number = 50
): Promise<VersionHistoryResponse> => {
  const res = await apiClient.get(`/version-history/${resource}/${resourceId}`, {
    params: { page, limit },
  });
  return res.data;
};

/**
 * Belirli bir versiyonu getir
 */
export const getVersionById = async (id: string): Promise<{ success: boolean; version: VersionHistory }> => {
  const res = await apiClient.get(`/version-history/version/${id}`);
  return res.data;
};

/**
 * Belirli bir versiyona rollback yap
 */
export const rollbackToVersion = async (
  resource: string,
  resourceId: string,
  version: number
): Promise<{ success: boolean; message: string }> => {
  const res = await apiClient.post(`/version-history/${resource}/${resourceId}/rollback/${version}`);
  return res.data;
};

// React Query Hooks
export const useVersionHistory = (
  resource: string | null,
  resourceId: string | null,
  page: number = 1,
  limit: number = 50
) => {
  return useQuery({
    queryKey: ['version-history', resource, resourceId, page, limit],
    queryFn: () => getResourceVersionHistory(resource!, resourceId!, page, limit),
    enabled: !!resource && !!resourceId,
    staleTime: 1 * 60 * 1000, // 1 dakika
  });
};

export const useVersionById = (id: string | null) => {
  return useQuery({
    queryKey: ['version', id],
    queryFn: () => getVersionById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useRollbackVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ resource, resourceId, version }: { resource: string; resourceId: string; version: number }) =>
      rollbackToVersion(resource, resourceId, version),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['version-history', variables.resource, variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: [variables.resource.toLowerCase(), variables.resourceId] });
    },
  });
};

