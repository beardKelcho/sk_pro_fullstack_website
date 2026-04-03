import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HomePageClient from '@/components/home/HomePageClient';
import { SiteContent } from '@/types/cms';
import type { Service } from '@/components/home/Services';
import type { Project } from '@/components/home/Projects';

interface HomePageProps {
    content: SiteContent;
    services: Service[];
    projects: Project[];
    fallbackMessage?: string | null;
}

export default function HomePage({ content, services, projects, fallbackMessage = null }: HomePageProps) {
    return (
        <MainLayout>
            <HomePageClient
                initialContent={content}
                initialServices={services}
                initialProjects={projects}
                initialFallbackMessage={fallbackMessage}
            />
        </MainLayout>
    );
}
