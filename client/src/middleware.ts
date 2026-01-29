import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr'
});

export const config = {
  // Sadece sayfa rotalarında çalış; api, _next, static dosyalar, resimler ve favicon'a KARIŞMA
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};