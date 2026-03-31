import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import BackgroundVideo from '@/components/layout/BackgroundVideo';
import Hero from '@/components/home/Hero';
import Services, { type Service } from '@/components/home/Services';
import Projects, { type Project } from '@/components/home/Projects';
import About from '@/components/home/About';
import Contact from '@/components/home/Contact';
import FallbackContentNotice from '@/components/home/FallbackContentNotice';
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
    fallbackMessage?: string | null;
}

export default function HomePage({ content, services, projects, fallbackMessage = null }: HomePageProps) {
    const heroData = unwrapHeroContent(content.hero as HeroContentInput);
    const videoUrl = heroData?.videoUrl || heroData?.backgroundVideo || undefined;

    return (
        <MainLayout>
            <BackgroundVideo videoUrl={videoUrl} />

            {/* Hero Section */}
            <Hero content={content.hero || { data: null }} />

            <Services initialServices={services} />

            <Projects initialProjects={projects} />

            <About content={content.about} />

            <Contact content={content.contact} />

            {fallbackMessage ? <FallbackContentNotice message={fallbackMessage} /> : null}
        </MainLayout>
    );
}
