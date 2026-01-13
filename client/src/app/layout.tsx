import { Montserrat } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import FooterWrapper from '@/components/layout/FooterWrapper';
import { Providers } from '@/components/providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorProvider } from '@/components/providers/ErrorProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { WebVitals } from '@/components/common/WebVitals';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import Script from 'next/script';

const montserrat = Montserrat({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

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
  metadataBase: new URL('https://skproduction.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/tr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://skproduction.com',
    siteName: 'SK Production',
    title: 'SK Production - Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
    description: 'SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.',
    images: [
      {
        url: '/images/og-image.jpg',
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
    images: ['/images/twitter-image.jpg'],
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
    icon: [
      { url: '/images/sk-logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
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
    <html lang="tr" suppressHydrationWarning>
      <body className={`${montserrat.className} antialiased min-h-screen`}>
        <ErrorBoundary>
          <OfflineIndicator />
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
        <ThemeProvider>
          <ErrorProvider>
            <Providers>
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
            </Providers>
          </ErrorProvider>
        </ThemeProvider>
          <Analytics />
          <SpeedInsights />
          <WebVitals analyticsId={process.env.NEXT_PUBLIC_GA_ID} />
        </ErrorBoundary>
      </body>
    </html>
  );
}
