import './globals.css';
import './fonts.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorProvider } from '@/components/providers/ErrorProvider';
import { Analytics } from '@vercel/analytics/react';
import LocalizedErrorBoundary from '@/components/common/LocalizedErrorBoundary';
import GlobalClientShell from '@/components/layout/GlobalClientShell';
import Script from 'next/script';

const siteVerification: NonNullable<Metadata['verification']> = {};

if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()) {
  siteVerification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim();
}

if (process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION?.trim()) {
  siteVerification.yandex = process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION.trim();
}

export const metadata: Metadata = {
  title: {
    default: 'SK Production - Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
    template: '%s | SK Production',
  },
  description: 'SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz. Analog Way Aquilon, Dataton Watchpax ve daha fazlası.',
  keywords: ['görüntü rejisi', 'medya server', 'etkinlik teknolojileri', 'Analog Way', 'Dataton Watchpax', 'SK Production'],
  authors: [{ name: 'SK Production' }],
  creator: 'SK Production',
  publisher: 'SK Production',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://skpro.com.tr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://skpro.com.tr',
    siteName: 'SK Production',
    title: 'SK Production - Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
    description: 'SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.',
    images: [
      {
        url: '/images/sk-logo.png',
        width: 1200,
        height: 630,
        alt: 'SK Production',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SK Production - Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
    description: 'SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.',
    images: ['/images/sk-logo.png'],
    creator: '@skproduction',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: Object.keys(siteVerification).length > 0 ? siteVerification : undefined,
  icons: {
    icon: '/images/sk-logo.png',
    shortcut: '/images/sk-logo.png',
    apple: '/images/sk-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning dir="ltr" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="SK Production" />
        <link rel="apple-touch-icon" href="/images/sk-logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var isNative = typeof window !== 'undefined' && (window.Capacitor || (window.navigator && window.navigator.userAgent.includes('Electron')));
                var isRoot = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '';
                if (isNative && isRoot) {
                  // Next.js redirect mekanizmasına bırakmadan DİREKT olarak login sayfasına fırlat
                  window.location.replace('/admin/login');
                }
              })();
            `
          }}
        />
      </head>
      <body className={`font-sans antialiased min-h-screen bg-black`} suppressHydrationWarning>
        <LocalizedErrorBoundary>
          {process.env.NEXT_PUBLIC_GA_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="gtag-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `}
              </Script>
            </>
          )}
          <Providers>
            <ErrorProvider>
              <div className="relative z-10">
                {children}
                <GlobalClientShell analyticsId={process.env.NEXT_PUBLIC_GA_ID} />
              </div>
            </ErrorProvider>
          </Providers>
          <Analytics />
        </LocalizedErrorBoundary>
      </body>
    </html>
  );
}
