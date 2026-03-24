import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import BackgroundVideo from '@/components/layout/BackgroundVideo';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Projects from '@/components/home/Projects';
import About from '@/components/home/About';
import Contact from '@/components/home/Contact';
import { SiteContent } from '@/types/cms';

interface HomePageProps {
    content: SiteContent;
    services: any[];
    projects: any[];
}

export default function HomePage({ content, services, projects }: HomePageProps) {
    const videoUrl = content.hero?.videoUrl || content.hero?.backgroundVideo || undefined;

    return (
        <MainLayout>
            <BackgroundVideo videoUrl={videoUrl} />

            {/* Hero Section */}
            <Hero content={content.hero || { data: null }} />

            {/* Hizmetler - Server-side verisi kullanıyor */}
            <Services initialServices={services} />

            {/* Projeler - Server-side verisi kullanıyor */}
            <Projects initialProjects={projects} />

            {/* Hakkımızda - Server-side verisi kullanıyor */}
            <About content={content.about} />

            {/* İletişim - Server-side verisi kullanıyor */}
            <Contact content={content.contact} />

            {/* Footer Wrapper Layout tarafından handle ediliyor - CMS API kullanıyor */}
        </MainLayout>
    );
}
