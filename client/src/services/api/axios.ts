import axios from 'axios';

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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
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
    if (typeof window !== 'undefined') {
      // Önce localStorage'dan, yoksa sessionStorage'dan token al
      let token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (token) {
        // Token'ı temizle (boşluk, yeni satır, vs. kaldır)
        token = token.trim();
        
        // Token formatını kontrol et (JWT formatı: 3 bölüm, nokta ile ayrılmış)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          // Development modunda detaylı log
          if (process.env.NODE_ENV === 'development') {
            console.error('Invalid token format detected in interceptor:', {
              parts: tokenParts.length,
              tokenLength: token.length,
              firstChars: token.substring(0, 20),
              lastChars: token.substring(token.length - 20),
              url: config.url
            });
          }
          // Geçersiz token'ı temizle ama sadece gerçekten geçersizse
          // Eğer token çok kısa veya formatı tamamen yanlışsa temizle
          if (token.length < 20 || tokenParts.length === 0) {
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');
            token = null;
          } else {
            // Format biraz farklı olabilir ama token var, yine de kullanmayı dene
            // (bazı edge case'ler için)
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
          
          // Development modunda token'ın header'a eklendiğini doğrula
          if (process.env.NODE_ENV === 'development' && config.url?.includes('/profile')) {
            console.log('Request interceptor: Token added to header');
            console.log('Token parts count:', tokenParts.length);
            console.log('Token length:', token.length);
            console.log('Token (first 30 chars):', token.substring(0, 30) + '...');
            console.log('Token (last 10 chars):', '...' + token.substring(token.length - 10));
            console.log('Authorization header (first 50 chars):', config.headers.Authorization?.substring(0, 50) + '...');
          }
        }
      } else {
        // Development modunda token yoksa uyar
        if (process.env.NODE_ENV === 'development' && config.url?.includes('/profile')) {
          console.warn('Request interceptor: No token found in storage');
        }
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
            console.log('Geçersiz token tespit edildi, tüm token\'lar temizlendi');
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
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
              return `${backendUrl}/api/auth/refresh-token`;
            })();
        const response = await axios.post(refreshUrl, {}, {
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
      } catch (refreshError: any) {
        // Refresh token başarısız, logout yap
        if (typeof window !== 'undefined') {
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
          console.warn('403 Forbidden hatası:', {
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
          // Toast yüklenemezse console'a yaz
          console.error('403 Forbidden:', errorMessage);
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

