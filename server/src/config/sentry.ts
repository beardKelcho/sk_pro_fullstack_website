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

const SENSITIVE_QUERY_PARAMS = ['code', 'token', 'refreshToken', 'state', 'session_state'];

const parseSampleRate = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};

const sanitizeUrl = (rawUrl: string) => {
    try {
        const url = new URL(rawUrl);
        for (const key of SENSITIVE_QUERY_PARAMS) {
            if (url.searchParams.has(key)) {
                url.searchParams.set(key, '[Filtered]');
            }
        }
        return url.toString();
    } catch {
        return rawUrl;
    }
};

export const initSentry = () => {
    if (process.env.SENTRY_DSN) {
        const isProduction = process.env.NODE_ENV === 'production';
        const tracesSampleRate = parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, isProduction ? 0.15 : 1.0);
        const profilesSampleRate = parseSampleRate(process.env.SENTRY_PROFILES_SAMPLE_RATE, isProduction ? 0.0 : 1.0);

        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            integrations: [
                nodeProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate,
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate,

            environment: process.env.NODE_ENV || 'development',

            // Kişisel veri (PII) gönderimi kapalı
            sendDefaultPii: false,

            beforeSend(event) {
                if (event.request?.url) {
                    event.request.url = sanitizeUrl(event.request.url);
                }
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
