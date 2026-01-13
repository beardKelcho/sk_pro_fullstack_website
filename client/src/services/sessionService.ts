import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Session {
  _id: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

export interface SessionsResponse {
  success: boolean;
  sessions: Session[];
}

/**
 * Aktif oturumları getir
 */
export const getActiveSessions = async (): Promise<SessionsResponse> => {
  const res = await apiClient.get('/sessions');
  return res.data;
};

/**
 * Belirli bir oturumu sonlandır
 */
export const terminateSession = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
  const res = await apiClient.delete(`/sessions/${sessionId}`);
  return res.data;
};

/**
 * Tüm diğer oturumları sonlandır
 */
export const terminateAllOtherSessions = async (): Promise<{ success: boolean; message: string; terminatedCount: number }> => {
  const res = await apiClient.delete('/sessions/all/others');
  return res.data;
};

// React Query Hooks
export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: getActiveSessions,
    staleTime: 30 * 1000, // 30 saniye
  });
};

export const useTerminateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: terminateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useTerminateAllOtherSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: terminateAllOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

