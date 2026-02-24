import logger from '@/utils/logger';
import type { Metadata } from 'next';
import HomePage from '@/components/home/HomePage';
import MaintenancePage from '@/app/maintenance/page';
import React from 'react';
import { HeroContent, AboutContent, ServicesContent, ContactContent, SiteContent } from '@/types/cms';
import StructuredData, { generateLocalBusinessSchema } from '@/components/common/StructuredData';

// Removed force-dynamic to support static export
export const revalidate = 60; // Revalidate at most every 60 seconds (for SSG updates if supported, otherwise just static)

// Fetch site data helper
async function getSiteData() {
  // Fix: Prioritize API URL env vars, CLIENT_URL is usually frontend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sk-pro-backend.onrender.com/api';

  try {
    // 1. Check Maintenance Mode
    const maintenanceRes = await fetch(`${apiUrl}/public/maintenance`);

    // Default to false if fetch fails
    let isMaintenanceMode = false;
    if (maintenanceRes.ok) {
      const maintenanceData = await maintenanceRes.json();
      isMaintenanceMode = maintenanceData.data?.isMaintenanceMode || false;
    }

    if (isMaintenanceMode) {
      return { isMaintenanceMode: true, content: {} };
    }

    // 2. Fetch Site Content
    const contentRes = await fetch(`${apiUrl}/public/site-content`);

    if (!contentRes.ok) {
      logger.error('Failed to fetch site content');
      return { isMaintenanceMode: false, content: {} };
    }

    const responseJson = await contentRes.json();

    // Transform to SiteContent format
    const contentMap: SiteContent = {};

    // Backend'in döndürdüğü format: { success: true, data: { hero: {...}, about: {...} } }
    // VEYA eski format: { data: [{ section: 'hero', data: {...} }] }

    if (responseJson.data) {
      // Yeni format: data obje mi?
      if (!Array.isArray(responseJson.data)) {
        // Direkt obje formatı { hero: {...}, about: {...} }
        const dataObj = responseJson.data;

        if (dataObj.hero) {
          contentMap.hero = { data: dataObj.hero } as any;
        }
        if (dataObj.about) {
          contentMap.about = dataObj.about;
        }
        if (dataObj.services) {
          contentMap.services = dataObj.services;
        }
        if (dataObj.contact) {
          contentMap.contact = dataObj.contact;
        }
      } else {
        // Eski array formatı [{ section: 'hero', data: {...} }]
        const items: any[] = responseJson.data;
        items.forEach((item: any) => {
          const payload = item.data || item.content;
          if (!payload) return;

          if (item.section === 'hero') {
            contentMap.hero = { data: payload } as any;
          }
          else if (item.section === 'about') contentMap.about = payload;
          else if (item.section === 'services' || item.section === 'services-equipment') contentMap.services = payload;
          else if (item.section === 'contact') contentMap.contact = payload;
        });
      }
    }

    logger.info('Processed ContentMap Keys:', Object.keys(contentMap)); // Server loglarında görmek için

    return { isMaintenanceMode: false, content: contentMap };

  } catch (error) {
    logger.error('Error fetching site data:', error);
    return { isMaintenanceMode: false, content: {} };
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
  const { isMaintenanceMode, content } = await getSiteData();

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <>
      <StructuredData data={generateLocalBusinessSchema()} />
      <HomePage content={content as SiteContent} />
    </>
  );
}
