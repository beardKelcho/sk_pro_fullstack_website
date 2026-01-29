'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import ErrorBoundary from './ErrorBoundary';

// STATIC TURKISH ERROR MESSAGES
const ERROR_MESSAGES = {
  title: 'Bir Hata Oluştu',
  defaultMessage: 'Üzgünüz, bir şeyler yanlış gitti. Lütfen sayfayı yenileyin veya ana sayfaya dönün.',
  reload: 'Sayfayı Yenile',
  goHome: 'Ana Sayfaya Dön',
  goDashboard: 'Panele Dön'
};

const getSafeHomeHref = (pathname: string) => {
  if (pathname.startsWith('/admin')) return '/admin/dashboard';
  return '/';
};

export default function LocalizedErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ERROR_MESSAGES.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{ERROR_MESSAGES.defaultMessage}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                {ERROR_MESSAGES.reload}
              </button>
              <Link
                href={getSafeHomeHref(typeof window !== 'undefined' ? window.location.pathname : '/')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {(typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) ? ERROR_MESSAGES.goDashboard : ERROR_MESSAGES.goHome}
              </Link>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
