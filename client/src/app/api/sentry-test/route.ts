import * as Sentry from '@sentry/nextjs';

export async function GET(request: Request) {
  const requiredToken = process.env.SENTRY_TEST_TOKEN;
  const providedToken = request.headers.get('x-skpro-sentry-test-token') || '';

  // Production'da mutlaka token şart (açık endpoint istemiyoruz)
  if (process.env.NODE_ENV === 'production') {
    if (!requiredToken || providedToken !== requiredToken) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Sentry event gönder
  Sentry.captureMessage('SKPRO Sentry Test Event', 'info');
  Sentry.captureException(new Error('SKPRO Sentry Test Error'));

  // flush: Vercel serverless runtime'da event'in çıkmasını hızlandırır
  try {
    const anySentry = Sentry as any;
    if (typeof anySentry.flush === 'function') {
      await anySentry.flush(2000);
    }
  } catch {
    // ignore
  }

  return new Response(JSON.stringify({ success: true, message: 'Sentry test event sent' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

