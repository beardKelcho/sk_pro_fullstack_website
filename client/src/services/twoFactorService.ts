import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TwoFactorStatus {
  success: boolean;
  is2FAEnabled: boolean;
  hasBackupCodes: boolean;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  secret: string;
  qrCode: string;
  backupCodes: string[];
  message: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
}

/**
 * 2FA durumunu kontrol et
 */
export const get2FAStatus = async (): Promise<TwoFactorStatus> => {
  const res = await apiClient.get('/two-factor/status');
  return res.data;
};

/**
 * 2FA kurulumunu başlat
 */
export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
  const res = await apiClient.post('/two-factor/setup');
  return res.data;
};

/**
 * 2FA'yı doğrula ve aktif et
 */
export const verify2FA = async (data: { token?: string; backupCode?: string }): Promise<TwoFactorVerifyResponse> => {
  const res = await apiClient.post('/two-factor/verify', data);
  return res.data;
};

/**
 * 2FA'yı devre dışı bırak
 */
export const disable2FA = async (data: { password: string; token?: string; backupCode?: string }): Promise<TwoFactorVerifyResponse> => {
  const res = await apiClient.post('/two-factor/disable', data);
  return res.data;
};

/**
 * Login sırasında 2FA doğrulama
 */
export const verify2FALogin = async (data: { email: string; token?: string; backupCode?: string }): Promise<{ success: boolean; accessToken?: string; user?: any; message?: string }> => {
  const res = await apiClient.post('/two-factor/verify-login', data);
  return res.data;
};

// React Query Hooks
export const use2FAStatus = () => {
  return useQuery({
    queryKey: ['2fa', 'status'],
    queryFn: get2FAStatus,
    staleTime: 1 * 60 * 1000, // 1 dakika
  });
};

export const useSetup2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: setup2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa'] });
    },
  });
};

export const useVerify2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: verify2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa'] });
    },
  });
};

export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: disable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa'] });
    },
  });
};

export const useVerify2FALogin = () => {
  return useMutation({
    mutationFn: verify2FALogin,
  });
};

