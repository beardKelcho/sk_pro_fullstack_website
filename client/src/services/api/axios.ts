import axios from 'axios';
import logger from '@/utils/logger';

// Next.js rewrites kullanıyorsak relative path kullan, yoksa tam URL
// Browser'da çalışıyorsa (client-side) relative path kullan (Next.js rewrites devreye girer)
// Server-side'da ise tam URL kullan
const getApiUrl = () => {
  // Client-side'da (browser) relative path kullan - Next.js rewrites devreye girer
  // Bu sayede farklı bilgisayarlardan erişim sorunsuz çalışır
  if (typeof window !== 'undefined') {
    return '/api';
  }
  // Server-side'da (SSR) tam URL kullan - NEXT_PUBLIC_BACKEND_URL kullan (rewrites için)
  // Eğer NEXT_PUBLIC_BACKEND_URL yoksa, NEXT_PUBLIC_API_URL kullan
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001');
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
  timeout: 30000, // 30 saniye timeout (resim yükleme için daha uzun)
});

// Request interceptor - Token'ı header'a ekle
apiClient.interceptors.request.use(
  (config) => {
    // Client-side'da localStorage kontrolü kaldırıldı (Cookie kullanılıyor)
    // Ancak backward compatibility için varsa ekleyebiliriz veya tamamen kaldırabiliriz.
    // Cookie-based auth'da header'a gerek yok, browser otomatik gönderir.

    // Sadece development'ta logla
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // logger.debug('Request sending...', { url: config.url });
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
      // Sadece gerçek network hatalarında logla (ECONNREFUSED, ETIMEDOUT, vb.)
      // Axios cancel veya diğer geçici hatalarda loglama yapma
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        const logger = require('@/utils/logger').default;
        logger.warn('Backend\'e erişilemiyor. Offline mod aktif.', { code: error.code, url: originalRequest?.url });
      }

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

      // Invalid signature veya token hatası varsa direkt temizle
      const errorMessage = error.response?.data?.message || '';
      const errorName = error.response?.data?.name || '';
      const isInvalidToken = errorMessage.includes('invalid') ||
        errorMessage.includes('signature') ||
        errorMessage.includes('token') ||
        errorMessage.includes('Yetkilendirme başarısız') ||
        errorMessage.includes('Geçersiz token') ||
        errorName === 'JsonWebTokenError' ||
        errorName === 'TokenExpiredError';

      if (isInvalidToken) {
        // Geçersiz token, direkt temizle ve login'e yönlendir
        if (typeof window !== 'undefined') {
          // Tüm token'ları ve auth verilerini temizle
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('token');

          // Development modunda log
          if (process.env.NODE_ENV === 'development') {
            logger.info('Geçersiz token tespit edildi, tüm token\'lar temizlendi');
          }

          // Sadece admin sayfalarındaysa yönlendir
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
            window.location.href = '/admin';
          }
        }
        return Promise.reject(error);
      }

      try {
        // Refresh token ile yeni access token al
        // Client-side'da relative path kullan (Next.js rewrites proxy eder)
        // Server-side'da tam URL kullan
        const refreshUrl = typeof window !== 'undefined'
          ? '/api/auth/refresh-token'
          : (() => {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001');
            return `${backendUrl}/api/auth/refresh-token`;
          })();
        // Refresh request - Cookie automatically sent
        const response = await axios.post(refreshUrl, {}, {
          withCredentials: true,
          timeout: 10000,
        });

        // 200 OK döndüyse cookie set edilmiştir
        if (response.status === 200) {
          // Retry original request
          return apiClient(originalRequest);
        }
      } catch (refreshError: unknown) {
        // Refresh token başarısız
        // Network hatası veya timeout ise, kullanıcıyı hemen logout etme
        // Sadece 401 (Unauthorized) veya 403 (Forbidden) hatası ise logout yap
        const error = refreshError as { response?: { status?: number }; code?: string };
        const isAuthError = error?.response?.status === 401 || error?.response?.status === 403;
        const isNetworkError = !error?.response || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK';

        if (typeof window !== 'undefined') {
          if (isAuthError) {
            // Gerçek auth hatası - logout yap
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
            // Header'ı anında güncellemek için custom event dispatch et
            window.dispatchEvent(new CustomEvent('auth:logout'));
            // Sadece admin sayfalarındaysa yönlendir
            if (window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin';
            }
          } else if (isNetworkError) {
            // Network hatası - kullanıcıya bilgi ver ama logout etme
            if (process.env.NODE_ENV === 'development') {
              logger.warn('Token refresh network hatası, kullanıcı logout edilmedi:', refreshError);
            }
            // Orijinal hatayı reject et, böylece çağıran kod hatayı handle edebilir
          }
        }
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden hatası - Yetkisiz işlem denemesi
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        const errorMessage = error.response?.data?.message || 'Bu işlem için yetkiniz bulunmamaktadır';

        // Development modunda log
        if (process.env.NODE_ENV === 'development') {
          logger.warn('403 Forbidden hatası:', {
            message: errorMessage,
            url: originalRequest?.url,
            method: originalRequest?.method,
            pathname: window.location.pathname
          });
        }

        // Toast mesajı göster (forbidden sayfasına yönlendirme yapma)
        // Dinamik import kullanarak toast'ı yükle (SSR uyumluluğu için)
        import('react-toastify').then(({ toast }) => {
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }).catch(() => {
          // Toast yüklenemezse logger'a yaz
          logger.error('403 Forbidden:', errorMessage);
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

