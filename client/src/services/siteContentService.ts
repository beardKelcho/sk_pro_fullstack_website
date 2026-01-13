import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundVideo?: string; // Seçili video URL'i (backward compatibility için)
  selectedVideo?: string; // Aktif olarak gösterilen video URL'i
  availableVideos?: Array<{ url: string; filename: string; uploadedAt?: string }>; // Video havuzu
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
    image?: string; // Ekipman görseli
  }[];
  order: number;
  image?: string; // Kategori görseli
}

export interface ServicesEquipmentContent {
  title: string;
  subtitle: string;
  services: ServiceItem[];
  equipment: EquipmentCategory[];
  backgroundImage?: string;
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
  | ServicesEquipmentContent
  | AboutContent 
  | ContactInfo 
  | FooterContent 
  | SocialMedia[] 
  | any;

export interface SiteContent {
  _id?: string;
  id?: string;
  section: 'hero' | 'services' | 'equipment' | 'services-equipment' | 'about' | 'contact' | 'footer' | 'social' | 'projects';
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

// React Query Hooks
export const useSiteContents = (params?: {
  section?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['site-contents', params],
    queryFn: () => getAllContents(params),
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
};

export const useSiteContentBySection = (section: string | null) => {
  return useQuery({
    queryKey: ['site-content', 'section', section],
    queryFn: () => getContentBySection(section!),
    enabled: !!section,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSiteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-contents'] });
    },
  });
};

export const useUpdateSiteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SiteContent> }) => updateContent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-content', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['site-contents'] });
    },
  });
};

export const useUpdateSiteContentBySection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ section, data }: { section: string; data: Partial<SiteContent> }) => 
      updateContentBySection(section, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-content', 'section', variables.section] });
      queryClient.invalidateQueries({ queryKey: ['site-contents'] });
    },
  });
};

export const useDeleteSiteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-contents'] });
    },
  });
};

