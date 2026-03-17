'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hata loglama
    const logger = require('@/utils/logger').default;
    logger.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#0A1128] to-[#001F54] dark:from-[#050914] dark:to-[#0A1128]">
      {/* Resilient Header/Nav for Cypress */}
      <header className="py-5 px-6">
        <nav role="navigation" className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <Image
              src="/images/sk-logo.png"
              alt="SK Production"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>
          <div className="hidden md:flex space-x-6 text-white/70">
            <span>Projeler</span>
            <span>Hizmetler</span>
            <span>Hakkımızda</span>
          </div>
        </nav>
      </header>

      <main role="main" className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">500</h1>
            <h2 className="text-4xl font-bold text-white mb-4">Bir Hata Oluştu</h2>
            <p className="text-xl text-gray-300 mb-8">
              Üzgünüz, bir şeyler yanlış gitti. Lütfen daha sonra tekrar deneyin.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-8 p-4 bg-red-900/30 rounded-lg text-left">
                <p className="text-red-300 text-sm font-mono">{error.message}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={reset}
              className="bg-[#0066CC] dark:bg-primary-light text-white px-8 py-4 rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-all duration-300 text-lg font-medium shadow-lg"
            >
              Tekrar Dene
            </button>
            <Link
              href="/"
              className="bg-white dark:bg-gray-800 text-[#0066CC] dark:text-primary-light px-8 py-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-lg font-medium shadow-lg"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} SK Production. Tüm hakları saklıdır.</p>
          <div className="flex space-x-4">
            <Link href="/privacy">Gizlilik</Link>
            <Link href="/terms">Şartlar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

