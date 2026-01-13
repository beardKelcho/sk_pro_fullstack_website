import apiClient from './api/axios';

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundVideo?: string;
  backgroundImage?: string;
  rotatingTexts?: string[];
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface EquipmentCategory {
  title: string;
  items: {
    name: string;
    description: string;
  }[];
  order: number;
}

export interface AboutContent {
  title: string;
  description: string;
  image?: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
}

export interface SocialMedia {
  platform: string;
  url: string;
  icon?: string;
}

export interface FooterContent {
  copyright: string;
  links?: {
    text: string;
    url: string;
  }[];
}

export type SiteContentData = 
  | HeroContent 
  | ServiceItem[] 
  | EquipmentCategory[] 
  | AboutContent 
  | ContactInfo 
  | FooterContent 
  | SocialMedia[] 
  | any;

export interface SiteContent {
  _id?: string;
  id?: string;
  section: 'hero' | 'services' | 'equipment' | 'about' | 'contact' | 'footer' | 'social' | 'projects';
  content: SiteContentData;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getAllContents = async (params?: {
  section?: string;
  isActive?: boolean;
}): Promise<{ contents: SiteContent[]; count: number }> => {
  // Public endpoint kullan (anasayfa için)
  const isPublic = !params || Object.keys(params).length === 0;
  const endpoint = isPublic ? '/site-content/public' : '/site-content';
  const res = await apiClient.get(endpoint, { params });
  return res.data;
};

export const getContentBySection = async (section: string): Promise<SiteContent> => {
  const res = await apiClient.get(`/site-content/public/${section}`);
  return res.data.content || res.data;
};

export const createContent = async (data: Partial<SiteContent>): Promise<SiteContent> => {
  const res = await apiClient.post('/site-content', data);
  return res.data.content || res.data;
};

export const updateContent = async (id: string, data: Partial<SiteContent>): Promise<SiteContent> => {
  const res = await apiClient.put(`/site-content/${id}`, data);
  return res.data.content || res.data;
};

export const updateContentBySection = async (section: string, data: Partial<SiteContent>): Promise<SiteContent> => {
  const res = await apiClient.put(`/site-content/section/${section}`, data);
  return res.data.content || res.data;
};

export const deleteContent = async (id: string): Promise<void> => {
  await apiClient.delete(`/site-content/${id}`);
};

