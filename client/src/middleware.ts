import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './i18n/locales';

const intlMiddleware = createIntlMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
});

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --- 1. ADIM: KRİTİK DOSYALARI MUTLAK BYPASS ET ---
  // MIME hatasını önlemek için CSS, JS ve resimleri hiçbir kontrole sokmadan serbest bırakıyoruz.
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/uploads/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // --- 2. ADIM: ADMIN AUTH KONTROLÜ ---
  // Hem /admin hem de /tr/admin gibi yolları yakalayan esnek kontrol.
  const isAdminPath = pathname.match(/^\/(?:[a-z]{2}\/)?admin/);
  const isLoginPage = pathname.match(/^\/(?:[a-z]{2}\/)?admin\/login/);

  if (isAdminPath && !isLoginPage) {
    const accessToken = request.cookies.get('accessToken');
    const refreshToken = request.cookies.get('refreshToken');

    // Tokenlar yoksa login sayfasına yönlendir. Çerezler tarayıcıda varsa sistem seni içeri alacaktır.
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- 3. ADIM: DİL YÖNLENDİRMESİ ---
  const response = isAdminPath ? NextResponse.next() : intlMiddleware(request);

  // --- 4. ADIM: SENİN ÖZEL GÜVENLİK (CSP) AYARLARIN ---
  const isDevelopment = process.env.NODE_ENV === 'development';
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001');

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://va.vercel-scripts.com ${isDevelopment ? 'http://localhost:*' : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: https: blob: ${apiBaseUrl}`,
    "font-src 'self' https://fonts.gstatic.com data:",
    `connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com ${apiBaseUrl} ${isDevelopment ? 'ws://localhost:*' : ''}`,
    "frame-src 'self' https://www.youtube.com https://www.google.com https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].filter(Boolean).join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};