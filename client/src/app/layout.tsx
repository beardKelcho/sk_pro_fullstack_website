import { Montserrat } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import FooterWrapper from '@/components/layout/FooterWrapper';
import { Providers } from '@/components/providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorProvider } from '@/components/providers/ErrorProvider';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from '@/components/common/WebVitals';
import LocalizedErrorBoundary from '@/components/common/LocalizedErrorBoundary';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import CommandPalette from '@/components/common/CommandPalette';
import AdminShortcut from '@/components/admin/AdminShortcut';
import Script from 'next/script';
import { errorTracker } from '@/utils/errorTracking';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

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
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
  },
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
  // Global error handlers (sadece client-side)
  if (typeof window !== 'undefined') {
    errorTracker.logError = errorTracker.logError.bind(errorTracker);
  }

  return (
    <html lang="tr" suppressHydrationWarning dir="ltr">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="SK Production" />
        <link rel="apple-touch-icon" href="/images/sk-logo.png" />
      </head>
      <body className={`${montserrat.className} antialiased min-h-screen transition-colors duration-300`} suppressHydrationWarning>
        <LocalizedErrorBoundary>
          <OfflineIndicator />
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
              <CommandPalette />
              <AdminShortcut />
              {children}
              <FooterWrapper />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </ErrorProvider>
          </Providers>
          <Analytics />
          {process.env.NEXT_PUBLIC_GA_ID && (
            <WebVitals analyticsId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </LocalizedErrorBoundary>
      </body>
    </html>
  );
}
