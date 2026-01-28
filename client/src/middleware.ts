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

  // --- 1. STATİK DOSYALARI MUTLAK SERBEST BIRAK (MIME HATASI İÇİN) ---
  // Tarayıcı CSS/JS isterken önüne Login HTML'i çıkmasını engeller.
  // Force deploy: Definitive fix applied
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/uploads/') ||
    pathname.includes('.') || // İstenilen kesin çözüm: Uzantısı olan her dosyayı bypass et
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. ADMIN AUTH KONTROLÜ
  const isAdminPath = pathname.match(/^\/(?:[a-z]{2}\/)?admin/);
  const isLoginPage = pathname.match(/^\/(?:[a-z]{2}\/)?admin\/login/);

  if (isAdminPath && !isLoginPage) {
    const accessToken = request.cookies.get('accessToken');
    const refreshToken = request.cookies.get('refreshToken');

    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Not: User snippet'inde burada 'return NextResponse.next()' vardi, 
  // bu durum CSP headerlarinin eklenmesini engelliyordu. 
  // Bu yüzden akışın aşağıya devam etmesini sağlıyoruz.
  const response = isAdminPath ? NextResponse.next() : intlMiddleware(request);

  // --- 3. GÜVENLİK (CSP) ---
  const apiBaseUrl = 'https://sk-pro-backend.onrender.com';
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: https: blob: res.cloudinary.com ${apiBaseUrl}`,
    `connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com ${apiBaseUrl} *.pusher.com wss://*.pusher.com`,
    `media-src 'self' data: https: blob: res.cloudinary.com ${apiBaseUrl}`,
    "frame-src 'self' https://www.youtube.com https://www.google.com https://vercel.live",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};