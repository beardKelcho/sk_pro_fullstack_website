/**
 * Sentry Edge Configuration
 * Next.js Edge runtime için
 */

import * as Sentry from '@sentry/nextjs';

// Sentry'yi sadece production'da ve DSN varsa aktif et
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
  });
}

export default Sentry;

