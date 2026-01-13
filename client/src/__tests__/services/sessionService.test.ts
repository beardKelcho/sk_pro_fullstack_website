/**
 * Session Service Testleri
 */

import * as sessionService from '@/services/sessionService';
import apiClient from '@/services/api/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

jest.mock('@/services/api/axios');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Session Service Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveSessions', () => {
    it('aktif oturumları başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          success: true,
          sessions: [
            {
              _id: 'session1',
              deviceInfo: {
                userAgent: 'Mozilla/5.0',
                ipAddress: '192.168.1.1',
                browser: 'Chrome',
                os: 'Windows',
              },
              lastActivity: '2026-01-08T10:00:00Z',
              createdAt: '2026-01-08T09:00:00Z',
              expiresAt: '2026-01-08T12:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sessionService.getActiveSessions();

      expect(apiClient.get).toHaveBeenCalledWith('/sessions');
      expect(result.success).toBe(true);
      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0]._id).toBe('session1');
    });

    it('hata durumunda exception fırlatmalı', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(sessionService.getActiveSessions()).rejects.toThrow('Network error');
    });
  });

  describe('terminateSession', () => {
    it('belirli bir oturumu başarıyla sonlandırmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Oturum sonlandırıldı',
        },
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sessionService.terminateSession('session1');

      expect(apiClient.delete).toHaveBeenCalledWith('/sessions/session1');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Oturum sonlandırıldı');
    });
  });

  describe('terminateAllOtherSessions', () => {
    it('tüm diğer oturumları başarıyla sonlandırmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Tüm diğer oturumlar sonlandırıldı',
          terminatedCount: 3,
        },
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sessionService.terminateAllOtherSessions();

      expect(apiClient.delete).toHaveBeenCalledWith('/sessions/all/others');
      expect(result.success).toBe(true);
      expect(result.terminatedCount).toBe(3);
    });
  });

  describe('React Query Hooks', () => {
    it('useActiveSessions hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          sessions: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => sessionService.useActiveSessions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.success).toBe(true);
    });

    it('useTerminateSession hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Oturum sonlandırıldı',
        },
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => sessionService.useTerminateSession(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('session1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});

