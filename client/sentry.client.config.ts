/**
 * Sentry Client Configuration
 * Next.js client-side error tracking için
 */

import * as Sentry from '@sentry/nextjs';

// Sentry'yi sadece production'da ve DSN varsa aktif et
// Sentry'yi sadece production'da, DSN varsa ve client-side'da aktif et
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProduction = process.env.NODE_ENV === 'production';
const isBrowser = typeof window !== 'undefined';

if (isProduction && SENTRY_DSN && isBrowser) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV || 'production',

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Traces Sample Rate (0.0 - 1.0)
    // Production'da %10 sample rate (performans için)
    tracesSampleRate: 0.1,

    // Session Replay (opsiyonel - daha fazla veri)
    replaysSessionSampleRate: 0.1, // %10 of sessions
    replaysOnErrorSampleRate: 1.0, // %100 of sessions with errors

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        // Session Replay ayarları
        maskAllText: true, // Hassas verileri maskele
        blockAllMedia: true, // Medya içeriğini engelle
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Before Send - Hataları filtrele
    beforeSend(event, hint) {
      // Development hatalarını gönderme
      if (!isProduction) {
        return null;
      }

      // Belirli hataları filtrele
      const error = hint.originalException;
      if (error instanceof Error) {
        // Network hatalarını filtrele (çok fazla noise)
        if (
          error.message.includes('NetworkError') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network request failed')
        ) {
          return null;
        }

        // Chrome extension hatalarını filtrele
        if (error.message.includes('chrome-extension://')) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extension errors
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      'fb_xd_fragment',
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      'conduitPage',
      // Network errors (zaten beforeSend'de filtreleniyor)
      'NetworkError',
      'Failed to fetch',
      // ResizeObserver errors - bazı tarayıcılarda bilinen bir sorun, ignore ediliyor
      'ResizeObserver loop limit exceeded',
      'ReferenceError: self is not defined', // Explicitly ignore widespread mostly harmless error if it leaks to runtime
    ],

    // Deny URLs (bu URL'lerden gelen hataları gönderme)
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],
  });
}

export default Sentry;

