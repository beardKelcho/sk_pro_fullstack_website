/**
 * Two Factor Service Testleri
 */

import * as twoFactorService from '@/services/twoFactorService';
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

describe('Two Factor Service Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get2FAStatus', () => {
    it('2FA durumunu başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          success: true,
          is2FAEnabled: false,
          hasBackupCodes: false,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await twoFactorService.get2FAStatus();

      expect(apiClient.get).toHaveBeenCalledWith('/two-factor/status');
      expect(result.success).toBe(true);
      expect(result.is2FAEnabled).toBe(false);
    });

    it('hata durumunda exception fırlatmalı', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(twoFactorService.get2FAStatus()).rejects.toThrow('Network error');
    });
  });

  describe('setup2FA', () => {
    it('2FA kurulumunu başarıyla başlatmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          secret: 'test-secret',
          qrCode: 'data:image/png;base64,test',
          backupCodes: ['code1', 'code2'],
          message: '2FA setup başarılı',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await twoFactorService.setup2FA();

      expect(apiClient.post).toHaveBeenCalledWith('/two-factor/setup');
      expect(result.success).toBe(true);
      expect(result.secret).toBe('test-secret');
      expect(result.backupCodes).toHaveLength(2);
    });
  });

  describe('verify2FA', () => {
    it('2FA token ile doğrulama yapmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '2FA doğrulandı',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await twoFactorService.verify2FA({ token: '123456' });

      expect(apiClient.post).toHaveBeenCalledWith('/two-factor/verify', { token: '123456' });
      expect(result.success).toBe(true);
    });

    it('backup code ile doğrulama yapmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Backup code ile doğrulandı',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await twoFactorService.verify2FA({ backupCode: 'backup123' });

      expect(apiClient.post).toHaveBeenCalledWith('/two-factor/verify', { backupCode: 'backup123' });
      expect(result.success).toBe(true);
    });
  });

  describe('disable2FA', () => {
    it('2FA\'yı başarıyla devre dışı bırakmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '2FA devre dışı bırakıldı',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await twoFactorService.disable2FA({ password: 'password123' });

      expect(apiClient.post).toHaveBeenCalledWith('/two-factor/disable', { password: 'password123' });
      expect(result.success).toBe(true);
    });
  });

  describe('React Query Hooks', () => {
    it('use2FAStatus hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          is2FAEnabled: true,
          hasBackupCodes: true,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => twoFactorService.use2FAStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.is2FAEnabled).toBe(true);
    });

    it('useSetup2FA hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          success: true,
          secret: 'test-secret',
          qrCode: 'data:image/png;base64,test',
          backupCodes: ['code1'],
          message: 'Setup başarılı',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => twoFactorService.useSetup2FA(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});

