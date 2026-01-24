import api from '@/services/api/axios';
import { SiteImage } from '@/services/siteImageService';

// Re-export SiteImage so consumers don't break
export type { SiteImage };

// Localized String Helper
export interface LocalizedString {
  tr: string;
  en: string;
}

// Hero bölümü için
export interface HeroContent {
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  buttonText: LocalizedString;
  buttonLink: string;
  backgroundVideo?: string;
  selectedVideo?: string;
  availableVideos?: Array<{ url: string; filename: string; uploadedAt?: string }>;
  backgroundImage?: string;
  rotatingTexts?: LocalizedString[];
}

// Hizmet bölümü için
export interface ServiceItem {
  title: LocalizedString;
  description: LocalizedString;
  icon: string;
  order: number;
}

// Ekipman kategori bölümü için
export interface EquipmentCategory {
  title: LocalizedString;
  items: {
    name: string;
    description: LocalizedString;
  }[];
  order: number;
}

// Hizmetler ve Ekipmanlar birleşik
export interface ServicesEquipmentContent {
  title: LocalizedString;
  subtitle: LocalizedString;
  services: ServiceItem[];
  equipment: EquipmentCategory[];
  backgroundImage?: string;
  order: number;
}

// Hakkımızda
export interface AboutContent {
  title: LocalizedString;
  description: LocalizedString;
  image?: string;
  stats: {
    label: LocalizedString;
    value: string;
  }[];
}

// İletişim
export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
}

// Sosyal Medya
export interface SocialMedia {
  platform: string;
  url: string;
  icon?: string;
}

// Footer
export interface FooterContent {
  copyright: LocalizedString;
  links?: {
    text: LocalizedString;
    url: string;
  }[];
}

// Ana içerik wrapper
export interface SiteContentData {
  section: string;
  content: HeroContent | ServicesEquipmentContent | AboutContent | ContactInfo | FooterContent | SocialMedia[] | any;
  isActive: boolean;
  order: number;
}

export interface SiteContent {
  _id: string;
  section: string;
  content: any; // Dynamic content based on section
  isActive: boolean;
  order: number;
}

// --- API Calls ---

export const getSiteContent = async (section: string) => {
  const response = await api.get(`/site-content/${section}`);
  return response.data;
};

export const updateSiteContent = async (section: string, data: any) => {
  const response = await api.put(`/site-content/${section}`, data);
  return response.data;
};

export const getAllSiteContents = async () => {
  const response = await api.get('/site-content');
  return response.data;
};
