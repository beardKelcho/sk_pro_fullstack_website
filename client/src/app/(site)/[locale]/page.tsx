
import HomePage from '@/components/home/HomePage';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  // const t = await getTranslations({ locale, namespace: 'site.meta' });
  const title = 'Piksellerin Ötesinde, Kesintisiz Görüntü Yönetimi | SK Production';
  const description = "2017'den beri sektörün en karmaşık projelerinde 'teknik beyin' olarak yer alıyoruz. Görüntü yönetimi, medya server çözümleri ve uzman ekip.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default function LocalizedHomePage() {
  return <HomePage />;
}
