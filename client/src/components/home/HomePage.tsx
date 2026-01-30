import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Projects from '@/components/home/Projects';
import About from '@/components/home/About';
import Contact from '@/components/home/Contact';
import { SiteContent } from '@/types/cms';

interface HomePageProps {
    content: SiteContent;
}

export default function HomePage({ content }: HomePageProps) {
    return (
        <MainLayout>
            {/* Hero Section */}
            <Hero content={content.hero || { data: null }} />

            {/* Hizmetler - Kendi API'sini kullanıyor */}
            <Services />

            {/* Projeler - Kendi API'sini kullanıyor */}
            <Projects />

            {/* Hakkımızda - CMS API'sinden kendi verisini çekiyor */}
            <About />

            {/* İletişim - CMS API'sinden kendi verisini çekiyor */}
            <Contact />

            {/* Footer Wrapper Layout tarafından handle ediliyor - CMS API kullanıyor */}
        </MainLayout>
    );
}
