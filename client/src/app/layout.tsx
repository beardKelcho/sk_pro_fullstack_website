import { Montserrat } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/layout/Footer';

const montserrat = Montserrat({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SK Production | Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
  description: 'SK Production, kurumsal etkinlikler için profesyonel görüntü rejisi ve medya server çözümleri sunan uzman bir ekiptir. Analog Way Aquilon, Dataton Watchpax ve Resolume Arena 7 ile hizmetinizdeyiz.',
  keywords: 'görüntü rejisi, medya server, Analog Way Aquilon, Dataton Watchpax, Resolume Arena 7, kurumsal etkinlik, konser görüntü rejisi, LED ekran yönetimi',
  authors: [{ name: 'SK Production' }],
  creator: 'SK Production',
  publisher: 'SK Production',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://skproduction.com',
    siteName: 'SK Production',
    title: 'SK Production | Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
    description: 'SK Production, kurumsal etkinlikler için profesyonel görüntü rejisi ve medya server çözümleri sunan uzman bir ekiptir. Analog Way Aquilon, Dataton Watchpax ve Resolume Arena 7 ile hizmetinizdeyiz.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SK Production - Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SK Production | Profesyonel Görüntü Rejisi ve Medya Server Çözümleri',
    description: 'SK Production, kurumsal etkinlikler için profesyonel görüntü rejisi ve medya server çözümleri sunan uzman bir ekiptir.',
    images: ['/images/og-image.jpg'],
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
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://skproduction.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${montserrat.className} antialiased min-h-screen`}>
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
