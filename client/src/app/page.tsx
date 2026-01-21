import type { Metadata } from 'next';
import HomePage from '@/components/home/HomePage';
import React from 'react';

// SEO Metadata Implementation
export async function generateMetadata(): Promise<Metadata> {
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

export default function Home() {
  return <HomePage />;
}
