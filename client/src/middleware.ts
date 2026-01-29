import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr'
});

export const config = {
  // api, _next ve uzantısı olan dosyalara (css, js, mp4) dokunma
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};