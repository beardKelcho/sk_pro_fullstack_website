import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale, type AppLocale } from '@/i18n/locales';
import type { Metadata } from 'next';

const ogLocaleByAppLocale: Record<AppLocale, string> = {
  tr: 'tr_TR',
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isLocale(locale) ? locale : 'tr';

  const t = await getTranslations({ locale: safeLocale, namespace: 'site.meta' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skproduction.com';

  return {
    title: {
      default: t('title'),
      template: `%s | ${t('brand')}`,
    },
    description: t('description'),
    alternates: {
      canonical: `/${safeLocale}`,
      languages: {
        tr: `${baseUrl}/tr`,
        en: `${baseUrl}/en`,
        fr: `${baseUrl}/fr`,
        es: `${baseUrl}/es`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${safeLocale}`,
      siteName: t('brand'),
      locale: ogLocaleByAppLocale[safeLocale],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function SiteLocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: AppLocale = isLocale(locale) ? locale : 'tr';

  setRequestLocale(safeLocale);
  return children;
}

