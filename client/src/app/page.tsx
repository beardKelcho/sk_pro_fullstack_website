import logger from '@/utils/logger';
import type { Metadata } from 'next';
import HomePage from '@/components/home/HomePage';
import MaintenancePage from '@/app/maintenance/page';
import React from 'react';
import { HeroContent, AboutContent, ServicesContent, ContactContent, SiteContent } from '@/types/cms';
import StructuredData, { generateLocalBusinessSchema } from '@/components/common/StructuredData';
import type { Service } from '@/components/home/Services';
import type { Project } from '@/components/home/Projects';

// Removed force-dynamic to support static export
export const revalidate = 60; // Revalidate at most every 60 seconds (for SSG updates if supported, otherwise just static)

import { fallbackContent } from '@/constants/fallbackData';

type PublicSiteContentResponse = {
  hero?: HeroContent;
  about?: AboutContent;
  services?: ServicesContent;
  contact?: ContactContent;
};

type PublicSiteContentItem = {
  section?: string;
  data?: unknown;
  content?: unknown;
};

type SiteDataResult = {
  isMaintenanceMode: boolean;
  content: SiteContent;
  services: Service[];
  projects: Project[];
  fallbackMessage: string | null;
};

const isStaticBuildProcess = process.env.npm_lifecycle_event === 'build';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isSiteContentResponse = (value: unknown): value is PublicSiteContentResponse =>
  isRecord(value);

const createFallbackMessage = (degradedSources: string[]) => {
  if (degradedSources.includes('site-content')) {
    return 'İçerik servisine erişilemediği için site şu anda varsayılan içerikle gösteriliyor.';
  }

  if (degradedSources.length > 0) {
    return 'Bazı canlı veriler geçici olarak alınamadı; sayfa kısmi varsayılan içerikle gösteriliyor.';
  }

  return null;
};

const reportSiteDataIssue = (message: string, detail?: unknown) => {
  if (isStaticBuildProcess) {
    logger.warn(message);
    return;
  }

  logger.error(message, detail);
};

// Fetch site data helper
async function getSiteData(): Promise<SiteDataResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const degradedSources = new Set<string>();

  try {
    let isMaintenanceMode = false;
    try {
      const maintenanceRes = await fetch(`${apiUrl}/public/maintenance`, {
        signal: AbortSignal.timeout(5000)
      });

      if (maintenanceRes.ok) {
        const maintenanceData = await maintenanceRes.json();
        isMaintenanceMode = maintenanceData.data?.isMaintenanceMode || false;
      } else {
        degradedSources.add('maintenance');
        reportSiteDataIssue('Maintenance endpoint unavailable; continuing with content fetch', { status: maintenanceRes.status });
      }
    } catch (maintenanceError) {
      degradedSources.add('maintenance');
      reportSiteDataIssue('Maintenance endpoint request failed', maintenanceError);
    }

    if (isMaintenanceMode) {
      return { isMaintenanceMode: true, content: fallbackContent, services: [], projects: [], fallbackMessage: null };
    }

    const [contentRes, servicesRes, projectsRes] = await Promise.all([
      fetch(`${apiUrl}/public/site-content`, { signal: AbortSignal.timeout(5000) }).catch((error) => {
        degradedSources.add('site-content');
        reportSiteDataIssue('Site content endpoint request failed', error);
        return null;
      }),
      fetch(`${apiUrl}/services`, { signal: AbortSignal.timeout(5000) }).catch((error) => {
        degradedSources.add('services');
        reportSiteDataIssue('Services endpoint request failed', error);
        return null;
      }),
      fetch(`${apiUrl}/showcase-projects`, { signal: AbortSignal.timeout(5000) }).catch((error) => {
        degradedSources.add('showcase-projects');
        reportSiteDataIssue('Showcase projects endpoint request failed', error);
        return null;
      })
    ]);

    let services: Service[] = [];
    let projects: Project[] = [];

    if (servicesRes && servicesRes.ok) {
      const servicesData = await servicesRes.json();
      services = Array.isArray(servicesData?.data) ? servicesData.data as Service[] : [];
    } else if (servicesRes) {
      degradedSources.add('services');
      reportSiteDataIssue('Services endpoint unavailable; using empty fallback', { status: servicesRes.status });
    }

    if (projectsRes && projectsRes.ok) {
      const projectsData = await projectsRes.json();
      projects = Array.isArray(projectsData?.data) ? projectsData.data as Project[] : [];
    } else if (projectsRes) {
      degradedSources.add('showcase-projects');
      reportSiteDataIssue('Showcase projects endpoint unavailable; using empty fallback', { status: projectsRes.status });
    }

    if (!contentRes || !contentRes.ok) {
      if (contentRes) {
        degradedSources.add('site-content');
        reportSiteDataIssue('Site content endpoint unavailable; fallback content will be used', { status: contentRes.status });
      }
      return {
        isMaintenanceMode: false,
        content: fallbackContent,
        services,
        projects,
        fallbackMessage: createFallbackMessage(Array.from(degradedSources)),
      };
    }

    const responseJson = await contentRes.json();
    const contentMap: SiteContent = { ...fallbackContent };

    if (responseJson.data) {
      if (!Array.isArray(responseJson.data)) {
        const dataObj = responseJson.data;
        if (isSiteContentResponse(dataObj) && dataObj.hero) {
          contentMap.hero = { data: dataObj.hero } as SiteContent['hero'];
        }
        if (dataObj.about) contentMap.about = dataObj.about;
        if (dataObj.services) contentMap.services = dataObj.services;
        if (dataObj.contact) contentMap.contact = dataObj.contact;
      } else {
        const items = responseJson.data as PublicSiteContentItem[];
        items.forEach((item) => {
          const payload = item.data || item.content;
          if (!payload) return;

          if (item.section === 'hero') contentMap.hero = { data: payload as HeroContent } as SiteContent['hero'];
          else if (item.section === 'about') contentMap.about = payload;
          else if (item.section === 'services' || item.section === 'services-equipment') contentMap.services = payload;
          else if (item.section === 'contact') contentMap.contact = payload;
        });
      }
    }

    return {
      isMaintenanceMode: false,
      content: contentMap,
      services,
      projects,
      fallbackMessage: createFallbackMessage(Array.from(degradedSources)),
    };

  } catch (error) {
    reportSiteDataIssue('Site data fetch failed, fallback content will be used', error);
    return {
      isMaintenanceMode: false,
      content: fallbackContent,
      services: [],
      projects: [],
      fallbackMessage: createFallbackMessage(['site-content', 'services', 'showcase-projects']),
    };
  }
}

// SEO Metadata Implementation - fetching dynamic validation
export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSiteData();

  // Use dynamic content or defaults
  const title = content?.hero?.title || 'SK Production | Profesyonel Görüntü Çözümleri';
  const description = content?.hero?.description || "Profesyonel görüntü ve medya çözümleri.";

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

export default async function Home() {
  const { isMaintenanceMode, content, services, projects, fallbackMessage } = await getSiteData();

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <>
      <StructuredData data={generateLocalBusinessSchema()} />
      <HomePage
        content={content as SiteContent}
        services={services}
        projects={projects}
        fallbackMessage={fallbackMessage}
      />
    </>
  );
}
