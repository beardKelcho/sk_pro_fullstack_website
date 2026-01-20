import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import logger from '../utils/logger';

export const initSentry = () => {
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            integrations: [
                nodeProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0, //  Capture 100% of the transactions
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate: 1.0,

            environment: process.env.NODE_ENV || 'development',

            beforeSend(event) {
                // Hassas verileri filtrele
                if (event.request?.headers) {
                    delete event.request.headers['authorization'];
                    delete event.request.headers['cookie'];
                }
                return event;
            },
        });

        logger.info('✅ Sentry initialized successfully');
    } else {
        logger.warn('⚠️  Sentry DSN not found, skipping initialization');
    }
};
