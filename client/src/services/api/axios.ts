import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - Token'ı header'a ekle
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Önce localStorage'dan, yoksa sessionStorage'dan token al
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
    const originalRequest = error.config;

    // Network hatası (backend çökmüş olabilir)
    if (!error.response) {
      // Backend'e erişilemiyor, graceful degradation
      console.warn('Backend\'e erişilemiyor. Offline mod aktif.');
      
      // Sadece kritik olmayan istekler için retry yap
      if (originalRequest && !originalRequest._retry && originalRequest.method !== 'get') {
        originalRequest._retry = true;
        // 2 saniye bekle ve tekrar dene
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          return await apiClient(originalRequest);
        } catch (retryError) {
          // Retry başarısız, hata döndür
        }
      }
      
      // Network hatası için özel hata mesajı
      return Promise.reject({
        ...error,
        message: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
        isNetworkError: true,
      });
    }

    // 401 hatası ve token yenileme denenmemişse
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token ile yeni access token al
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
          timeout: 5000,
        });

        const { accessToken } = response.data;
        
        if (accessToken) {
          // Token'ı aynı yerde sakla (localStorage veya sessionStorage)
          const existingToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          if (localStorage.getItem('accessToken')) {
            localStorage.setItem('accessToken', accessToken);
          } else {
            sessionStorage.setItem('accessToken', accessToken);
          }
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token başarısız, logout yap
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('user');
          window.location.href = '/admin';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

