import apiClient from '@/services/api/axios';
import { useQuery } from '@tanstack/react-query';

export interface AuditLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE';
  resource: 'Equipment' | 'Project' | 'Task' | 'User' | 'Client' | 'Maintenance' | 'SiteImage' | 'SiteContent' | 'QRCode' | 'Notification' | 'System';
  resourceId: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    method?: string;
    endpoint?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface AuditLogFilters {
  user?: string;
  resource?: string;
  resourceId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  success: boolean;
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLogResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.user) params.append('user', filters.user);
  if (filters?.resource) params.append('resource', filters.resource);
  if (filters?.resourceId) params.append('resourceId', filters.resourceId);
  if (filters?.action) params.append('action', filters.action);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const response = await apiClient.get<AuditLogResponse>(`/audit-logs?${params.toString()}`);
  return response.data;
};

export const getResourceAuditHistory = async (
  resource: string,
  resourceId: string,
  page: number = 1,
  limit: number = 50
): Promise<AuditLogResponse> => {
  const response = await apiClient.get<AuditLogResponse>(
    `/audit-logs/${resource}/${resourceId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

// React Query Hooks
export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogs(filters),
    staleTime: 1 * 60 * 1000, // 1 dakika (loglar sık değişir)
  });
};

export const useResourceAuditHistory = (
  resource: string | null,
  resourceId: string | null,
  page: number = 1,
  limit: number = 50
) => {
  return useQuery({
    queryKey: ['audit-logs', resource, resourceId, page, limit],
    queryFn: () => getResourceAuditHistory(resource!, resourceId!, page, limit),
    enabled: !!resource && !!resourceId,
    staleTime: 1 * 60 * 1000,
  });
};

