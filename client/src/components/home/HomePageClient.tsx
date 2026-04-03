'use client';

import { useEffect, useMemo, useState } from 'react';
import BackgroundVideo from '@/components/layout/BackgroundVideo';
import Hero from '@/components/home/Hero';
import Services, { type Service } from '@/components/home/Services';
import Projects, { type Project } from '@/components/home/Projects';
import About from '@/components/home/About';
import Contact from '@/components/home/Contact';
import FallbackContentNotice from '@/components/home/FallbackContentNotice';
import type { AboutContent, ContactContent, HeroContent, SiteContent } from '@/types/cms';

type PublicSiteContentResponse = {
  hero?: HeroContent;
  about?: AboutContent;
  services?: SiteContent['services'];
  contact?: ContactContent;
};

type PublicSiteContentItem = {
  section?: string;
  data?: unknown;
  content?: unknown;
};

interface HomePageClientProps {
  initialContent: SiteContent;
  initialServices: Service[];
  initialProjects: Project[];
  initialFallbackMessage?: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isSiteContentResponse = (value: unknown): value is PublicSiteContentResponse =>
  isRecord(value);

const unwrapHeroContent = (value: SiteContent['hero']) => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if ('data' in value && value.data && typeof value.data === 'object') {
    return value.data as HeroContent;
  }

  return value as HeroContent;
};

const getPublicApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) {
    return apiUrl.replace(/\/$/, '');
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (backendUrl) {
    return `${backendUrl.replace(/\/$/, '')}/api`;
  }

  return null;
};

const withTimeout = async <T,>(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 6000): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json() as T;
  } finally {
    window.clearTimeout(timeout);
  }
};

const mapCmsServicesToServiceCards = (content: SiteContent): Service[] => {
  const cmsServices = content.services?.services;
  if (!Array.isArray(cmsServices)) {
    return [];
  }

  return cmsServices.map((service, index) => ({
    _id: `fallback-service-${index}`,
    title: service.title,
    category: 'Genel',
    description: service.description,
    icon: service.icon || 'Monitor',
    details: service.description ? [service.description] : [],
    order: index,
    isActive: true,
  }));
};

const mergeSiteContent = (initialContent: SiteContent, payload: unknown): SiteContent => {
  const mergedContent: SiteContent = { ...initialContent };

  if (!isRecord(payload)) {
    return mergedContent;
  }

  if (!Array.isArray(payload)) {
    const dataObj = payload;
    if (isSiteContentResponse(dataObj) && dataObj.hero) {
      mergedContent.hero = { data: dataObj.hero } as SiteContent['hero'];
    }
    if (dataObj.about) mergedContent.about = dataObj.about;
    if (dataObj.services) mergedContent.services = dataObj.services;
    if (dataObj.contact) mergedContent.contact = dataObj.contact;
    return mergedContent;
  }

  (payload as PublicSiteContentItem[]).forEach((item) => {
    const sectionPayload = item.data || item.content;
    if (!sectionPayload) return;

    if (item.section === 'hero') mergedContent.hero = { data: sectionPayload as HeroContent } as SiteContent['hero'];
    else if (item.section === 'about') mergedContent.about = sectionPayload as AboutContent;
    else if (item.section === 'services' || item.section === 'services-equipment') mergedContent.services = sectionPayload as SiteContent['services'];
    else if (item.section === 'contact') mergedContent.contact = sectionPayload as ContactContent;
  });

  return mergedContent;
};

export default function HomePageClient({
  initialContent,
  initialServices,
  initialProjects,
  initialFallbackMessage = null,
}: HomePageClientProps) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(initialFallbackMessage);

  const heroData = unwrapHeroContent(content.hero);
  const videoUrl = heroData?.videoUrl || heroData?.backgroundVideo || undefined;

  const visibleServices = useMemo(() => {
    if (services.length > 0) {
      return services;
    }

    return mapCmsServicesToServiceCards(content);
  }, [content, services]);

  useEffect(() => {
    const apiBaseUrl = getPublicApiBaseUrl();
    const needsRefresh =
      Boolean(initialFallbackMessage) || initialServices.length === 0 || initialProjects.length === 0;

    if (!apiBaseUrl || !needsRefresh) {
      return;
    }

    let isCancelled = false;

    const refreshLiveContent = async () => {
      try {
        const maintenanceData = await withTimeout<{ data?: { isMaintenanceMode?: boolean } }>(
          `${apiBaseUrl}/public/maintenance`
        );

        if (maintenanceData?.data?.isMaintenanceMode) {
          window.location.replace('/maintenance/');
          return;
        }

        const [contentResponse, servicesResponse, projectsResponse] = await Promise.all([
          withTimeout<{ data?: unknown }>(`${apiBaseUrl}/public/site-content`).catch(() => null),
          withTimeout<{ data?: unknown }>(`${apiBaseUrl}/services`).catch(() => null),
          withTimeout<{ data?: unknown }>(`${apiBaseUrl}/showcase-projects`).catch(() => null),
        ]);

        if (isCancelled) {
          return;
        }

        if (contentResponse?.data) {
          setContent((currentContent) => mergeSiteContent(currentContent, contentResponse.data));
          setFallbackMessage(null);
        }

        if (Array.isArray(servicesResponse?.data)) {
          setServices(servicesResponse.data as Service[]);
        }

        if (Array.isArray(projectsResponse?.data)) {
          setProjects(projectsResponse.data as Project[]);
        }
      } catch {
        if (!isCancelled) {
          setFallbackMessage((currentMessage) =>
            currentMessage || 'Canlı içerik şu anda alınamadı; varsayılan içerik gösteriliyor.'
          );
        }
      }
    };

    void refreshLiveContent();

    return () => {
      isCancelled = true;
    };
  }, [initialFallbackMessage, initialProjects.length, initialServices.length]);

  return (
    <>
      <BackgroundVideo videoUrl={videoUrl} />
      <Hero content={content.hero || { data: null }} />
      <Services initialServices={visibleServices} />
      <Projects initialProjects={projects} />
      <About content={content.about} />
      <Contact content={content.contact} />
      {fallbackMessage ? <FallbackContentNotice message={fallbackMessage} /> : null}
    </>
  );
}
