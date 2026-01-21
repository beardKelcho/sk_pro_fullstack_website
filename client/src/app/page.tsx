
import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Projects from '@/components/home/Projects';
import About from '@/components/home/About';
import Contact from '@/components/home/Contact';
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
  return (
    <MainLayout>
      {/* Hero Section - Piksellerin Ötesinde Başlığı ile */}
      <Hero />

      {/* Hizmetler - Yeni 3 Kart Yapısı */}
      <Services />

      {/* Projeler - Slider ve Modal */}
      <Projects />

      {/* Hakkımızda - Dinamik 9+ Yıl Hesaplaması */}
      <About />

      {/* İletişim - Form ve Harita */}
      <Contact />

      {/* Footer Wrapper Layout tarafından (veya MainLayout dışında) handle ediliyor */}
    </MainLayout>
  );
}
