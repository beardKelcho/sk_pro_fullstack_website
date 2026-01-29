import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  // Admin rotalarını locale prefixinden muaf tut
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/admin': '/admin'
  }
});

export const config = {
  // Admin rotalarını hariç tut - next-intl bunlara dokunmasın
  matcher: [
    '/((?!api|admin|_next|_vercel|.*\\..*).*)'
  ]
};