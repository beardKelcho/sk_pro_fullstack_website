import logger from '@/utils/logger';
/**
 * Error Tracking Utility
 * Production'da hataları loglamak ve izlemek için
 * Sentry entegrasyonu ile birlikte çalışır
 */

// Sentry import (conditional - sadece production'da yüklenecek)
let Sentry: typeof import('@sentry/nextjs') | null = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    Sentry = require('@sentry/nextjs');
  } catch {
    // Sentry yoksa devam et
  }
}

interface ErrorInfo {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class ErrorTracker {
  private isProduction: boolean;
  private apiEndpoint: string;
  private sentryEnabled: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.apiEndpoint = process.env.NEXT_PUBLIC_API_URL || '/api';
    this.sentryEnabled = !!(
      this.isProduction &&
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_SENTRY_DSN &&
      Sentry
    );
  }

  /**
   * Hata loglar ve Sentry'ye gönderir (production'da)
   * @param error - Hata objesi veya mesajı
   * @param context - Ek bağlam bilgileri
   * @param severity - Hata önem seviyesi (low, medium, high, critical)
   * @example
   * errorTracker.logError(new Error('Something went wrong'), { userId: '123' }, 'high')
   */
  logError(error: Error | string, context?: Record<string, any>, severity: ErrorInfo['severity'] = 'medium') {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      severity,
      context,
    };

    // Development'ta konsola yazdır (logger zaten console.error kullanıyor)
    if (!this.isProduction) {
      // logger kullanmıyoruz çünkü bu zaten error tracking utility'si
      // Sentry'ye göndermeden önce development'ta görmek için console kullanıyoruz
      // eslint-disable-next-line no-console
      logger.error('Error logged:', errorInfo);
    }

    // Sentry'ye gönder (production'da ve DSN varsa)
    if (this.sentryEnabled && Sentry) {
      try {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        
        // Severity'yi Sentry formatına çevir
        const sentryLevel = this.mapSeverityToSentryLevel(severity);
        
        // Sentry'ye gönder
        Sentry.captureException(errorObj, {
          level: sentryLevel,
          tags: {
            severity,
            ...(context?.tags || {}),
          },
          extra: {
            ...context,
            url: errorInfo.url,
            userAgent: errorInfo.userAgent,
            timestamp: errorInfo.timestamp,
          },
          contexts: {
            custom: {
              ...context,
            },
          },
        });
      } catch (sentryError) {
        // Sentry hatası olursa sessizce devam et
        if (!this.isProduction) {
          logger.warn('Sentry error capture failed:', sentryError);
        }
      }
    }

    // Production'da backend'e gönder (fallback)
    if (this.isProduction && typeof window !== 'undefined') {
      this.sendToBackend(errorInfo).catch((err) => {
        // Backend hatası olursa sessizce devam et
        if (!this.isProduction) {
          // eslint-disable-next-line no-console
          logger.error('Failed to send error to backend:', err);
        }
      });
    }
  }

  /**
   * Severity'yi Sentry level formatına çevirir
   * @param severity - Hata önem seviyesi
   * @returns Sentry log level
   * @private
   */
  private mapSeverityToSentryLevel(severity?: ErrorInfo['severity']): 'fatal' | 'error' | 'warning' | 'info' | 'debug' {
    switch (severity) {
      case 'critical':
        return 'fatal';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Backend'e hata gönderir (fallback mekanizması)
   * Şimdilik localStorage'a kaydeder, backend endpoint eklenebilir
   * @param errorInfo - Gönderilecek hata bilgisi
   * @private
   */
  private async sendToBackend(errorInfo: ErrorInfo) {
    try {
      // Backend'de error logging endpoint'i varsa kullan
      // Şimdilik sadece localStorage'a kaydet (backend endpoint eklenebilir)
      const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errors.push(errorInfo);
      
      // Son 50 hatayı sakla
      if (errors.length > 50) {
        errors.shift();
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(errors));
    } catch (error) {
      // eslint-disable-next-line no-console
      logger.error('Error tracking failed:', error);
    }
  }

  /**
   * React Error Boundary için hata yakalar
   * @param error - Yakalanan hata
   * @param errorInfo - React error info (componentStack vb.)
   * @example
   * errorTracker.captureException(error, errorInfo)
   */
  captureException(error: Error, errorInfo?: React.ErrorInfo) {
    // Sentry'ye gönder (production'da)
    if (this.sentryEnabled && Sentry) {
      try {
        Sentry.captureException(error, {
          level: 'error',
          tags: {
            errorBoundary: true,
          },
          extra: {
            componentStack: errorInfo?.componentStack,
          },
          contexts: {
            react: {
              componentStack: errorInfo?.componentStack,
            },
          },
        });
      } catch (sentryError) {
        // Sentry hatası olursa sessizce devam et
        if (!this.isProduction) {
          // eslint-disable-next-line no-console
          logger.warn('Sentry error capture failed:', sentryError);
        }
      }
    }
    
    // Local tracking
    this.logError(error, {
      componentStack: errorInfo?.componentStack,
      errorBoundary: true,
    }, 'high');
  }

  /**
   * Unhandled promise rejection yakalar
   * @param reason - Promise rejection nedeni
   * @example
   * errorTracker.captureUnhandledRejection(error)
   */
  captureUnhandledRejection(reason: any) {
    const error = reason instanceof Error 
      ? reason 
      : new Error(String(reason));
    
    // Sentry'ye gönder (production'da)
    if (this.sentryEnabled && Sentry) {
      try {
        Sentry.captureException(error, {
          level: 'error',
          tags: {
            unhandledRejection: true,
          },
          extra: {
            reason: String(reason),
          },
        });
      } catch (sentryError) {
        // Sentry hatası olursa sessizce devam et
        if (!this.isProduction) {
          // eslint-disable-next-line no-console
          logger.warn('Sentry error capture failed:', sentryError);
        }
      }
    }
    
    // Local tracking
    this.logError(error, {
      unhandledRejection: true,
      reason: String(reason),
    }, 'high');
  }

  /**
   * Hata loglarını temizler (localStorage'dan)
   */
  clearLogs() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('errorLogs');
    }
  }

  /**
   * Hata loglarını getirir (localStorage'dan)
   * @returns Hata logları dizisi
   */
  getLogs(): ErrorInfo[] {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('errorLogs') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

/**
 * API hatalarını track etmek için yardımcı fonksiyon
 * @param error - Hata objesi
 * @param endpoint - API endpoint'i
 * @param method - HTTP method
 */
export const trackApiError = (error: any, endpoint: string, method: string) => {
  errorTracker.logError(
    error instanceof Error ? error : new Error(String(error)),
    {
      endpoint,
      method,
      type: 'api_error',
    },
    'medium'
  );
};

/**
 * Genel hata tracking fonksiyonu
 * @param error - Hata objesi veya mesajı
 * @param context - Ek bağlam bilgileri
 */
export const trackError = (error: Error | string, context?: Record<string, any>) => {
  errorTracker.logError(error, context, 'medium');
};

// Global error handlers
if (typeof window !== 'undefined') {
  // Unhandled errors
  window.addEventListener('error', (event) => {
    errorTracker.logError(
      event.error || new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      'high'
    );
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.captureUnhandledRejection(event.reason);
  });
}
