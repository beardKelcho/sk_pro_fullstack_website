/**
 * API Error Handler Utility
 * Standart hata yönetimi için yardımcı fonksiyonlar
 */

import { AxiosError } from 'axios';
import { errorTracker } from './errorTracking';
import logger from './logger';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isAuthError?: boolean;
  originalError?: unknown;
}

/**
 * Axios hatasını standart API hatasına çevirir
 * Network, HTTP ve genel hataları işler
 * @param error - Yakalanan hata (AxiosError veya genel Error)
 * @returns Standart API hatası objesi
 * @example
 * try {
 *   await api.get('/users');
 * } catch (error) {
 *   const apiError = handleApiError(error);
 *   logger.error(apiError.message);
 * }
 */
export const handleApiError = (error: unknown): ApiError => {
  // Axios hatası
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Network hatası (backend'e erişilemiyor)
    if (!axiosError.response) {
      const networkError: ApiError = {
        message: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
        isNetworkError: true,
        originalError: error,
      };
      
      // Error tracking
      errorTracker.logError(
        new Error(networkError.message),
        { type: 'network_error', url: axiosError.config?.url },
        'high'
      );
      
      return networkError;
    }
    
    // HTTP hatası
    const status = axiosError.response.status;
    const responseData = axiosError.response.data;
    const errorMessage = 
      (typeof responseData === 'object' && responseData?.message) ||
      (typeof responseData === 'object' && responseData?.error) ||
      axiosError.message ||
      'Bir hata oluştu';
    
    const apiError: ApiError = {
      message: errorMessage,
      status,
      code: axiosError.code,
      isAuthError: status === 401 || status === 403,
      originalError: error,
    };
    
    // Error tracking (kritik hatalar için)
    if (status >= 500) {
      errorTracker.logError(
        new Error(errorMessage),
        { 
          type: 'server_error', 
          status, 
          url: axiosError.config?.url,
          method: axiosError.config?.method,
        },
        'high'
      );
    } else if (status === 401 || status === 403) {
      errorTracker.logError(
        new Error(errorMessage),
        { 
          type: 'auth_error', 
          status, 
          url: axiosError.config?.url,
        },
        'medium'
      );
    }
    
    return apiError;
  }
  
  // Genel hata
  if (error instanceof Error) {
    const generalError: ApiError = {
      message: error.message || 'Beklenmeyen bir hata oluştu',
      originalError: error,
    };
    
    errorTracker.logError(error, { type: 'general_error' }, 'medium');
    return generalError;
  }
  
  // Bilinmeyen hata tipi
  const unknownError: ApiError = {
    message: 'Beklenmeyen bir hata oluştu',
    originalError: error,
  };
  
  errorTracker.logError(
    new Error('Unknown error type'),
    { type: 'unknown_error', error },
    'medium'
  );
  
  return unknownError;
};

/**
 * Kullanıcı dostu hata mesajı oluşturur
 * Teknik hata mesajlarını kullanıcıya uygun mesajlara çevirir
 * @param error - API hatası objesi
 * @returns Kullanıcı dostu hata mesajı
 * @example
 * const apiError = handleApiError(error);
 * const userMessage = getUserFriendlyMessage(apiError);
 * toast.error(userMessage);
 */
export const getUserFriendlyMessage = (error: ApiError): string => {
  // Network hatası
  if (error.isNetworkError) {
    return 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
  }
  
  // Auth hatası
  if (error.isAuthError) {
    if (error.status === 401) {
      return 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.';
    }
    if (error.status === 403) {
      return 'Bu işlem için yetkiniz bulunmamaktadır.';
    }
  }
  
  // Status koduna göre mesajlar
  switch (error.status) {
    case 400:
      return error.message || 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
    case 404:
      return 'İstenen kaynak bulunamadı.';
    case 409:
      return 'Bu işlem çakışma yaratıyor. Lütfen tekrar deneyin.';
    case 422:
      return error.message || 'Gönderilen veriler geçersiz.';
    case 429:
      return 'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.';
    case 500:
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    case 503:
      return 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    default:
      return error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};

/**
 * Service fonksiyonları için standart error handler wrapper
 * Fonksiyonu try-catch ile sarar ve standart hata yönetimi sağlar
 * @param fn - Sarmalanacak async fonksiyon
 * @param context - Hata bağlamı (opsiyonel, loglama için)
 * @returns Sarmalanmış fonksiyon
 * @template T - Fonksiyon tipi
 * @example
 * const safeGetUsers = withErrorHandling(getUsers, 'UserService');
 * const users = await safeGetUsers();
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const apiError = handleApiError(error);
      const userMessage = getUserFriendlyMessage(apiError);
      
      // Development'ta detaylı log
      if (process.env.NODE_ENV === 'development') {
        logger.error(`[${context || 'API'}] Error:`, {
          message: apiError.message,
          status: apiError.status,
          originalError: apiError.originalError,
        });
      }
      
      // Hata mesajını güncelle ve fırlat
      const enhancedError = new Error(userMessage);
      (enhancedError as any).apiError = apiError;
      throw enhancedError;
    }
  }) as T;
};

