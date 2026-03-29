import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import logger from '../utils/logger';

// Sentry'e gönderilmemesi gereken header isimleri (küçük harf)
const SENSITIVE_HEADERS = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-access-token',
    'x-refresh-token',
    'set-cookie',
];

export const initSentry = () => {
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            integrations: [
                nodeProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0,
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate: 1.0,

            environment: process.env.NODE_ENV || 'development',

            // Kişisel veri (PII) gönderimi kapalı
            sendDefaultPii: false,

            beforeSend(event) {
                // Hassas request header'larını temizle
                if (event.request?.headers) {
                    for (const header of SENSITIVE_HEADERS) {
                        delete event.request.headers[header];
                    }
                }
                // Request body'deki şifre alanlarını temizle
                if (event.request?.data && typeof event.request.data === 'object') {
                    const data = event.request.data as Record<string, unknown>;
                    for (const field of ['password', 'newPassword', 'currentPassword', 'token', 'refreshToken']) {
                        if (field in data) data[field] = '[Filtered]';
                    }
                }
                return event;
            },
        });

        logger.info('✅ Sentry initialized successfully');
    } else {
        logger.warn('⚠️  Sentry DSN not found, skipping initialization');
    }
};
