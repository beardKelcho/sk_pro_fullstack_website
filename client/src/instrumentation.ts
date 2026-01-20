import * as Sentry from '@sentry/nextjs';

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('../sentry.server.config'); // Mevcut config dosyasını kullanabiliriz veya içeriğini buraya taşıyabiliriz
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('../sentry.edge.config');
    }
}

export const onRequestError = Sentry.captureRequestError;
