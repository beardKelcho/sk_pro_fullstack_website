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
            {content.hero && <Hero content={content.hero} />}

            {/* Hizmetler */}
            {content.services && <Services content={content.services} />}

            {/* Projeler - Kendi API'sini kullanıyor */}
            <Projects />

            {/* Hakkımızda */}
            {content.about && <About content={content.about} />}

            {/* İletişim */}
            {content.contact && <Contact content={content.contact} />}

            {/* Footer Wrapper Layout tarafından handle ediliyor */}
        </MainLayout>
    );
}
