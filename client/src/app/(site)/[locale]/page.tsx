'use client';

import HomePage from '@/components/home/HomePage';
import { useLocale } from 'next-intl';

export default function LocalizedHomePage() {
  // Locale provider'ın devrede olduğunu garanti etmek için okunuyor (Home içinde kullanılacak)
  useLocale();
  return <HomePage />;
}

