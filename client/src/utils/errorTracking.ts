'use client';

import * as Sentry from '@sentry/nextjs';
import { trackUserBehavior } from './analytics';

interface ErrorDetails {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

// Hata izleme fonksiyonu
export function trackError(error: Error | string, details?: ErrorDetails) {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Sentry'ye gönder
  Sentry.withScope((scope) => {
    if (details?.context) {
      Object.entries(details.context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (details?.level) {
      scope.setLevel(details.level);
    }

    Sentry.captureException(error, {
      level: details?.level || 'error',
    });
  });

  // Google Analytics'e gönder
  trackUserBehavior.trackError(
    details?.level || 'error',
    `${errorMessage}${errorStack ? `\n${errorStack}` : ''}`
  );
}

// React hata sınırı işleyicisi
export function handleErrorBoundary(error: Error, errorInfo: React.ErrorInfo) {
  trackError(error, {
    message: error.message,
    context: {
      componentStack: errorInfo.componentStack,
    },
    level: 'error',
  });
}

// API hatalarını izleme
export function trackApiError(error: any, endpoint: string, method: string) {
  trackError(error, {
    message: error.message || error.response?.data?.message || 'API error',
    context: {
      endpoint,
      method,
      status: error.status,
      response: error.response,
    },
    level: 'error',
  });
}

// Form hatalarını izleme
export function trackFormError(error: any, formId: string, field?: string) {
  trackError(error, {
    message: error.message || 'Form validation error',
    context: {
      formId,
      field,
      formData: error.formData,
    },
    level: 'warning',
  });
}

// Ağ hatalarını izleme
export function trackNetworkError(error: any, url: string, method: string) {
  trackError(error, {
    message: error.message || 'Network error',
    context: {
      url,
      method,
      status: error.status,
      response: error.response,
    },
    level: 'error',
  });
}

// Global hata yakalayıcı
export function setupGlobalErrorHandling() {
  // Yakalanmamış hataları yakala
  window.addEventListener('error', (event) => {
    trackError(event.error, {
      message: event.error?.message || event.message || 'Unhandled error',
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      level: 'fatal',
    });
  });

  // Yakalanmamış promise redlerini yakala
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    trackError(reason, {
      message: reason.message || 'Unhandled promise rejection',
      context: {
        type: 'unhandledrejection',
      },
      level: 'fatal',
    });
  });
}

// Performans izleme
export function trackPerformance(metric: string, value: number, context?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${metric}: ${value}ms`,
    data: context,
    level: 'info',
  });
}

// Kullanıcı davranışı izleme
export function trackUserAction(action: string, context?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'user',
    message: action,
    data: context,
    level: 'info',
  });
}

// Sayfa yükleme performansı izleme
export function trackPageLoad(performance: Performance) {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    trackPerformance('pageLoad', navigation.loadEventEnd - navigation.startTime, {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
      firstInputDelay: performance.getEntriesByName('first-input-delay')[0]?.duration,
      cumulativeLayoutShift: (performance.getEntriesByName('cumulative-layout-shift')[0] as any)?.value,
    });
  }
}

// Kaynak yükleme performansı izleme
export function trackResourceLoad(performance: Performance) {
  performance.getEntriesByType('resource').forEach((resource) => {
    const resourceTiming = resource as PerformanceResourceTiming;
    trackPerformance('resourceLoad', resourceTiming.duration, {
      name: resourceTiming.name,
      initiatorType: resourceTiming.initiatorType,
      size: resourceTiming.transferSize,
    });
  });
} 