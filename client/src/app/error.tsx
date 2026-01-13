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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0A1128] to-[#001F54] dark:from-[#050914] dark:to-[#0A1128] px-4">
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
        
        <div className="mt-12">
          <Image
            src="/images/sk-logo.png"
            alt="SK Production Logo"
            width={120}
            height={40}
            className="mx-auto opacity-50"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}

