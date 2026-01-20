import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './i18n/locales';

const intlMiddleware = createIntlMiddleware({
  locales: [...locales],
  defaultLocale,
  // SEO + sağlıklı yaklaşım: her dil prefix'li olsun (/tr, /en, /fr, /es)
  localePrefix: 'always',
  // Tarayıcı dilini otomatik algılamayı kapat - Herkes varsayılan dile (TR) gitsin
  localeDetection: false,
});

export function middleware(request: NextRequest) {
  // Static dosyalar ve Next.js internal dosyaları için middleware'i bypass et
  const pathname = request.nextUrl.pathname;

  // Static dosyaları, Next.js internal dosyalarını ve asset'leri bypass et
  // Next.js internal hash'leri (6-40 karakterlik hex string'ler) de bypass et
  // Bu hash'ler RSC (React Server Component) payload'ları için kullanılıyor
  // Ayrıca Next.js'in internal route'ları için de kontrol et (695ac79... gibi)
  // Daha geniş pattern: 6-40 karakter arası hex string'ler (Next.js hash'leri genellikle 8-24 karakter)
  const isHexHash = /^\/[0-9a-f]{6,40}$/i.test(pathname);
  const isNextInternal = /^\/[0-9a-f]{6,40}(\.json|\.js|\.map)?$/i.test(pathname);

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/uploads/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|css|js|json|map|webp|avif)$/i) ||
    isHexHash ||
    isNextInternal
  ) {
    // Static dosyalar ve Next.js internal route'ları için doğrudan Next.js'e bırak
    // Bu hash'ler Next.js tarafından internal olarak handle edilmeli
    return NextResponse.next();
  }

  // next-intl routing (admin paneli i18n dışında kalmalı)
  const response = pathname.startsWith('/admin') ? NextResponse.next() : intlMiddleware(request);

  // Content Security Policy - Google Analytics için 'unsafe-eval' gerekli
  // Development modunda daha esnek CSP kullan
  const isDevelopment = process.env.NODE_ENV === 'development';
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001');

  const cspHeader = isDevelopment
    ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://va.vercel-scripts.com http://localhost:*",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: https: blob: ${apiBaseUrl} ${apiBaseUrl}/api http://localhost:*`,
      "font-src 'self' https://fonts.gstatic.com data:",
      `connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com ${apiBaseUrl} http://localhost:* ws://localhost:*`,
      `media-src 'self' ${apiBaseUrl} https: blob: http://localhost:*`,
      "frame-src 'self' https://www.youtube.com https://maps.google.com https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
    : [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: https: blob: ${apiBaseUrl} ${apiBaseUrl}/api`,
      "font-src 'self' https://fonts.gstatic.com data:",
      `connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com ${apiBaseUrl}`,
      `media-src 'self' ${apiBaseUrl} https: blob:`,
      "frame-src 'self' https://www.youtube.com https://maps.google.com https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');

  // Güvenlik başlıklarını ekle
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Cache-Control başlıklarını ayarla
  if (pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Negative lookahead pattern:
     * - Exclude paths starting with api, _next, next, static, favicon.ico
     * - Exclude Next.js internal hash routes (8-32 char hex strings with optional .json/.js)
     * Note: Hex hash patterns are checked in middleware function itself
     * because Next.js matcher doesn't support complex negative lookahead with end anchors
     */
    '/((?!api|_next|next|static|favicon\\.ico|[0-9a-f]{8,32}(?:\\.json|\\.js)?).*)',
  ],
};
