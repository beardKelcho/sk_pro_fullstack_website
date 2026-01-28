import axios from 'axios';
import logger from '@/utils/logger';

// Next.js rewrites kullanıyorsak relative path kullan, yoksa tam URL
// Browser'da çalışıyorsa (client-side) relative path kullan (Next.js rewrites devreye girer)
// Server-side'da ise tam URL kullan
const getApiUrl = () => {
  // Client-side'da (browser) relative path kullan - Next.js rewrites devreye girer
  if (typeof window !== 'undefined') {
    return '/api';
  }
  // Server-side'da (SSR) tam URL kullan
  // NEXT_PUBLIC_BACKEND_URL veya NEXT_PUBLIC_API_URL kullan
  // Trailing slash'leri temizle (http://api.com/ -> http://api.com)
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
    .replace(/\/api$/, '') // Sonda /api varsa kaldır
    .replace(/\/$/, '');   // Sonda / varsa kaldır

  return `${backendUrl}/api`;
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

// ... (Request interceptor remains same)

// Response interceptor - Token yenileme ve hata yönetimi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

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

    // 401 Handling...
    // 401 Handling (User Requested Snippet)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        });
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden - Toast kaldırıldı (UI handle etmeli)
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('403 Forbidden:', error.response.data?.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

