import axios, { InternalAxiosRequestConfig } from 'axios';
import logger from '@/utils/logger';
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  updateStoredTokens,
} from '@/utils/authStorage';

// Next.js rewrites kullanıyorsak relative path kullan, yoksa tam URL
// Browser'da çalışıyorsa (client-side) relative path kullan (Next.js rewrites devreye girer)
// Server-side'da ise tam URL kullan
const getApiUrl = () => {
  // Rewrites removed, so we MUST use absolute URL everywhere (Client & Server)

  // 1. Production / Staging Environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    return apiUrl;
};

const API_URL = getApiUrl();

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// Request interceptor - Cookie + Bearer fallback desteği
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getStoredAccessToken();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Token yenileme ve hata yönetimi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // Network hatası handling...
    if (!error.response) {
      // ... (Keep existing network error logic)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        // Log warning but don't crash
      }
      return Promise.reject({
        ...error,
        message: 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.',
        isNetworkError: true,
      });
    }

    // 401 Handling - Cookie bloklansa bile bearer refresh ile toparla
    if (error.response?.status === 401) {
      const requestUrl = originalRequest?.url || '';
      const isAuthLoginRequest = requestUrl.includes('/auth/login');
      const isProfileRequest = requestUrl.includes('/auth/profile');
      const isRefreshRequest = requestUrl.includes('/auth/refresh-token');
      const storedRefreshToken = getStoredRefreshToken();

      if (
        originalRequest &&
        !originalRequest._retry &&
        !isAuthLoginRequest &&
        !isRefreshRequest &&
        storedRefreshToken
      ) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await apiClient.post('/auth/refresh-token', {
            refreshToken: storedRefreshToken,
          });

          const nextAccessToken = refreshResponse.data?.accessToken;
          const nextRefreshToken = refreshResponse.data?.refreshToken;

          if (nextAccessToken) {
            updateStoredTokens({
              accessToken: nextAccessToken,
              refreshToken: nextRefreshToken,
            });
            originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Token refresh failed, falling back to login redirect.', refreshError);
          }
        }
      }

      if (typeof window !== 'undefined') {
        const isMonitoringPage = window.location.pathname.includes('/admin/monitoring');
        const normalizedPathname = window.location.pathname.replace(/\/$/, '') || '';
        const isLoginPage = normalizedPathname.includes('/admin/login') || normalizedPathname === '/admin';

        // Login sayfasındaki profile probe'u doğal olarak 401 dönebilir
        if (isLoginPage && isProfileRequest) {
          return Promise.reject(error);
        }

        // Monitoring ve login sayfalarında isek kullanıcıyı tekrar login'e fırlatmıyoruz
        if (!isMonitoringPage && !isLoginPage) {
          clearStoredAuth();
          window.location.replace('/admin/login');
        }
      }
      return Promise.reject(error);
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        logger.warn('403 Forbidden:', error.response.data?.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
