import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/locales';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skpro.com.tr';

  const now = new Date();

  const routes: MetadataRoute.Sitemap = locales.flatMap((locale) => {
    const localeBase = `${baseUrl}/${locale}`;

    return [
      {
        url: localeBase,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: locale === defaultLocale ? 1.0 : 0.8,
      },
      {
        url: `${localeBase}/privacy`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
      {
        url: `${localeBase}/terms`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
    ];
  });

  return routes;
} 