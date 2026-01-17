import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStorage } from './tokenStorage';
import { authApi } from '../api/auth';

type AuthState = {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  user: any | null;
};

type AuthContextValue = AuthState & {
  signIn: (payload: { email: string; password: string }) => Promise<{ requires2FA: boolean; email?: string }>;
  verify2FA: (payload: { email: string; token?: string; backupCode?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isBootstrapping: true,
    isAuthenticated: false,
    user: null
  });

  const bootstrap = async () => {
    try {
      const access = await tokenStorage.getAccessToken();
      const refresh = await tokenStorage.getRefreshToken();
      if (access && refresh) {
        setState((s) => ({ ...s, isAuthenticated: true }));
        await refreshUser();
      } else {
        setState((s) => ({ ...s, isAuthenticated: false, user: null }));
      }
    } finally {
      setState((s) => ({ ...s, isBootstrapping: false }));
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.profile();
      if (res.success && res.user) {
        setState((s) => ({ ...s, user: res.user }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn: AuthContextValue['signIn'] = async ({ email, password }) => {
    const res = await authApi.login({ email, password });

    if (res && (res as any).success && (res as any).requires2FA) {
      return { requires2FA: true, email: (res as any).email };
    }

    if (!res || !(res as any).success || !(res as any).accessToken || !(res as any).refreshToken) {
      const msg = (res as any)?.message || 'Giriş başarısız';
      throw new Error(msg);
    }

    await tokenStorage.setTokens({ accessToken: (res as any).accessToken, refreshToken: (res as any).refreshToken });
    setState((s) => ({ ...s, isAuthenticated: true }));
    await refreshUser();
    return { requires2FA: false };
  };

  const verify2FA: AuthContextValue['verify2FA'] = async ({ email, token, backupCode }) => {
    const res = await authApi.verify2FALogin({ email, token, backupCode });
    if (!res.success || !res.accessToken || !res.refreshToken) {
      throw new Error(res.message || '2FA doğrulama başarısız');
    }
    await tokenStorage.setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setState((s) => ({ ...s, isAuthenticated: true }));
    await refreshUser();
  };

  const signOut: AuthContextValue['signOut'] = async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      await authApi.logout({ refreshToken: refreshToken || undefined });
    } catch {
      // ignore
    } finally {
      await tokenStorage.clear();
      setState({ isBootstrapping: false, isAuthenticated: false, user: null });
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      verify2FA,
      signOut,
      refreshUser
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

