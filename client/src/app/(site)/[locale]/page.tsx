'use client';

import Home from '@/app/page';
import { useLocale } from 'next-intl';

export default function LocalizedHomePage() {
  // Locale provider'ın devrede olduğunu garanti etmek için okunuyor (Home içinde kullanılacak)
  useLocale();
  return <Home />;
}

