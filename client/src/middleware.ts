import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr'
});

export default function middleware(req: any) {
  const pathname = req.nextUrl.pathname;

  // Admin paneline dokunma - locale prefix ekleme
  if (pathname.startsWith('/admin')) {
    return;
  }

  // Diğer rotalar için i18n middleware'ini çalıştır
  return intlMiddleware(req);
}

export const config = {
  // api, _next, static dosyalar ve admin'e dokunma
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};