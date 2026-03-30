import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import BackgroundVideo from '@/components/layout/BackgroundVideo';
import Hero from '@/components/home/Hero';
import Services, { type Service } from '@/components/home/Services';
import Projects, { type Project } from '@/components/home/Projects';
import About from '@/components/home/About';
import Contact from '@/components/home/Contact';
import { HeroContent, SiteContent } from '@/types/cms';

type HeroContentInput = HeroContent | { data?: HeroContent | null } | null | undefined;

const unwrapHeroContent = (value: HeroContentInput): HeroContent | undefined => {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    if (value && typeof value === 'object' && 'data' in value) {
        return value.data || undefined;
    }

    return value as HeroContent;
};

interface HomePageProps {
    content: SiteContent;
    services: Service[];
    projects: Project[];
}

export default function HomePage({ content, services, projects }: HomePageProps) {
    const heroData = unwrapHeroContent(content.hero as HeroContentInput);
    const videoUrl = heroData?.videoUrl || heroData?.backgroundVideo || undefined;

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
