import type { Metadata } from 'next';
import HomePage from '@/components/home/HomePage';
import MaintenancePage from '@/app/maintenance/page';
import React from 'react';
import { HeroContent, AboutContent, ServicesContent, ContactContent, SiteContent } from '@/types/cms';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch site data helper
async function getSiteData() {
  // Fix: Prioritize API URL env vars, CLIENT_URL is usually frontend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sk-pro-backend.onrender.com/api';

  try {
    // 1. Check Maintenance Mode
    const maintenanceRes = await fetch(`${apiUrl}/public/maintenance`, {
      cache: 'no-store'
    });

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
    const contentRes = await fetch(`${apiUrl}/public/site-content`, {
      cache: 'no-store'
    });

    if (!contentRes.ok) {
      console.error('Failed to fetch site content');
      return { isMaintenanceMode: false, content: {} };
    }

    const contentData = await contentRes.json();

    // Transform array to object map
    // Transform array to object map
    const contentMap: SiteContent = {};

    // API genellikle { data: [...] } döner, array kontrolü yap
    const items = Array.isArray(contentData.data) ? contentData.data : (Array.isArray(contentData) ? contentData : []);

    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        // Backend 'data' field'ını kullanıyor, fallback olarak 'content'e bak
        const payload = item.data || item.content;

        if (!payload) return;

        if (item.section === 'hero') {
          // Hero bileşeni { data: ... } yapısı beklediği için sarıyoruz
          contentMap.hero = { data: payload } as any;
        }
        else if (item.section === 'about') {
          contentMap.about = payload as AboutContent;
        }
        else if (item.section === 'services' || item.section === 'services-equipment') {
          contentMap.services = payload as ServicesContent;
        }
        else if (item.section === 'contact') {
          contentMap.contact = payload as ContactContent;
        }
      });
    }

    return { isMaintenanceMode: false, content: contentMap };

  } catch (error) {
    console.error('Error fetching site data:', error);
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

  return <HomePage content={content as SiteContent} />;
}
