import { http } from './http';

export type LoginResponse =
  | { success: true; requires2FA: true; message?: string; email?: string }
  | { success: true; accessToken: string; refreshToken?: string; user?: any }
  | { success: false; message?: string };

export const authApi = {
  login: async (payload: { email: string; password: string }): Promise<LoginResponse> => {
    const res = await http.post('/auth/login', payload);
    return res.data;
  },
  verify2FALogin: async (payload: { email: string; token?: string; backupCode?: string }) => {
    const res = await http.post('/two-factor/verify-login', payload);
    return res.data as { success: boolean; accessToken?: string; refreshToken?: string; user?: any; message?: string };
  },
  logout: async (payload?: { refreshToken?: string }) => {
    const res = await http.post('/auth/logout', payload || {});
    return res.data as { success: boolean; message?: string };
  },
  profile: async () => {
    const res = await http.get('/auth/profile');
    return res.data as { success: boolean; user?: any; message?: string };
  }
};

