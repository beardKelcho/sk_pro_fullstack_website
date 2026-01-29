import axios from 'axios';
import logger from '@/utils/logger';

// Next.js rewrites kullanıyorsak relative path kullan, yoksa tam URL
// Browser'da çalışıyorsa (client-side) relative path kullan (Next.js rewrites devreye girer)
// Server-side'da ise tam URL kullan
const getApiUrl = () => {
  // Rewrites removed, so we MUST use absolute URL everywhere (Client & Server)

  // 1. Production / Staging Environment
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. Production Fallback (Hardcoded to prevent 405 on Vercel)
  if (process.env.NODE_ENV === 'production') {
    return 'https://sk-pro-backend.onrender.com/api';
  }

  // 3. Development Fallback
  return 'http://localhost:5001/api';
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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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

    // 401 Handling - Simplified
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // Return a promise that never resolves to prevent UI errors/crashes
      return new Promise(() => { });
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('403 Forbidden:', error.response.data?.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

