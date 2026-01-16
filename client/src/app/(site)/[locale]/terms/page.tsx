import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

type Section = { title: string; paragraphs: string[]; list?: string[] };

export async function generateMetadata() {
  const t = await getTranslations('site.terms');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function TermsPage() {
  const tTerms = await getTranslations('site.terms');
  const tLegal = await getTranslations('site.legal');
  const locale = await getLocale().catch(() => 'tr');

  const sections = tTerms.raw('sections') as Section[];
  const lastUpdatedLabel = tLegal('lastUpdated');
  const lastUpdatedValue = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-surface py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-8">{tTerms('title')}</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>{lastUpdatedLabel}:</strong> {lastUpdatedValue}
            </p>

            {sections.map((s, idx) => (
              <section key={`${idx}-${s.title}`} className="mb-8">
                <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">{s.title}</h2>
                {s.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-gray-600 dark:text-gray-300 mb-4">
                    {p}
                  </p>
                ))}
                {s.list?.length ? (
                  <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                    {s.list.map((li, liIdx) => (
                      <li key={liIdx}>{li}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Link href={`/${locale}`} className="text-[#0066CC] dark:text-primary-light hover:underline">
                {tLegal('backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

