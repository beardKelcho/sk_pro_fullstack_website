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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isSiteContentResponse = (value: unknown): value is PublicSiteContentResponse =>
  isRecord(value);

// Fetch site data helper
async function getSiteData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  logger.info(`[BUILD-DEBUG] Fetching data from: ${apiUrl}`);

  try {
    // 1. Check Maintenance Mode
    const maintenanceRes = await fetch(`${apiUrl}/public/maintenance`, {
      signal: AbortSignal.timeout(5000) // Build anında çok beklememesi için
    });

    // Default to false if fetch fails
    let isMaintenanceMode = false;
    if (maintenanceRes.ok) {
      const maintenanceData = await maintenanceRes.json();
      isMaintenanceMode = maintenanceData.data?.isMaintenanceMode || false;
    }

    if (isMaintenanceMode) {
      return { isMaintenanceMode: true, content: fallbackContent, services: [], projects: [] };
    }

    // 2. Fetch Site Content, Services, and Projects concurrently
    const [contentRes, servicesRes, projectsRes] = await Promise.all([
      fetch(`${apiUrl}/public/site-content`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
      fetch(`${apiUrl}/services`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
      fetch(`${apiUrl}/showcase-projects`, { signal: AbortSignal.timeout(5000) }).catch(() => null)
    ]);

    // Parse Services & Projects
    let services: Service[] = [];
    let projects: Project[] = [];
    
    if (servicesRes && servicesRes.ok) {
        const servicesData = await servicesRes.json();
        services = Array.isArray(servicesData?.data) ? servicesData.data as Service[] : [];
    }

    if (projectsRes && projectsRes.ok) {
        const projectsData = await projectsRes.json();
        projects = Array.isArray(projectsData?.data) ? projectsData.data as Project[] : [];
    }

    if (!contentRes || !contentRes.ok) {
      logger.error('Failed to fetch site content, using fallback');
      return { isMaintenanceMode: false, content: fallbackContent, services, projects };
    }

    const responseJson = await contentRes.json();

    // Transform to SiteContent format
    const contentMap: SiteContent = { ...fallbackContent }; // Start with fallback

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

    return { isMaintenanceMode: false, content: contentMap, services, projects };

  } catch (error) {
    logger.error('Error fetching site data, returning fallback content:', error);
    return { isMaintenanceMode: false, content: fallbackContent, services: [], projects: [] };
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
  const { isMaintenanceMode, content, services, projects } = await getSiteData();

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <>
      <StructuredData data={generateLocalBusinessSchema()} />
      <HomePage content={content as SiteContent} services={services} projects={projects} />
    </>
  );
}
