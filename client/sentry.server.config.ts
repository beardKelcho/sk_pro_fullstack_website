/**
 * Sentry Server Configuration
 * Next.js server-side error tracking için
 */

import * as Sentry from '@sentry/nextjs';

// Sentry'yi sadece production'da ve DSN varsa aktif et
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: process.env.NODE_ENV || 'production',
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    
    // Traces Sample Rate (0.0 - 1.0)
    // Production'da %10 sample rate (performans için)
    tracesSampleRate: 0.1,
    
    // Integrations
    integrations: [
      Sentry.httpIntegration(),
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
        // Validation hatalarını filtrele (çok fazla noise)
        if (
          error.message.includes('ValidationError') ||
          error.message.includes('CastError') ||
          error.message.includes('MongoError')
        ) {
          // Sadece kritik MongoDB hatalarını gönder
          if (error.message.includes('connection') || error.message.includes('timeout')) {
            return event;
          }
          return null;
        }
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      // Validation errors
      'ValidationError',
      'CastError',
      // Non-critical MongoDB errors
      'MongoError',
      'MongoServerError',
    ],
  });
}

export default Sentry;

