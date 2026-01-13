import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SiteImage {
  _id?: string;
  id?: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  category: 'project' | 'gallery' | 'hero' | 'about' | 'video' | 'other';
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getAllImages = async (params?: {
  category?: string;
  isActive?: boolean;
}): Promise<{ images: SiteImage[]; count: number }> => {
  // Public endpoint kullan (anasayfa için)
  const isPublic = !params || Object.keys(params).length === 0;
  const endpoint = isPublic ? '/site-images/public' : '/site-images';
  const res = await apiClient.get(endpoint, { params });
  return res.data;
};

export const getImageById = async (id: string): Promise<SiteImage> => {
  const res = await apiClient.get(`/site-images/${id}`);
  return res.data.image || res.data;
};

export const createImage = async (data: Partial<SiteImage>): Promise<SiteImage> => {
  const res = await apiClient.post('/site-images', data);
  return res.data.image || res.data;
};

export const updateImage = async (id: string, data: Partial<SiteImage>): Promise<SiteImage> => {
  const res = await apiClient.put(`/site-images/${id}`, data);
  return res.data.image || res.data;
};

export const deleteImage = async (id: string): Promise<void> => {
  await apiClient.delete(`/site-images/${id}`);
};

export const deleteMultipleImages = async (ids: string[]): Promise<{ deletedCount: number }> => {
  const res = await apiClient.delete('/site-images/bulk/delete', { data: { ids } });
  return res.data;
};

export const updateImageOrder = async (images: { id: string; order: number }[]): Promise<void> => {
  await apiClient.put('/site-images/order/update', { images });
};

// React Query Hooks
export const useSiteImages = (params?: {
  category?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['site-images', params],
    queryFn: () => getAllImages(params),
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
};

export const useSiteImageById = (id: string | null) => {
  return useQuery({
    queryKey: ['site-image', id],
    queryFn: () => getImageById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSiteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
    },
  });
};

export const useUpdateSiteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SiteImage> }) => updateImage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-image', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
    },
  });
};

export const useDeleteSiteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
    },
  });
};

export const useDeleteMultipleSiteImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMultipleImages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
    },
  });
};

export const useUpdateImageOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateImageOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
    },
  });
};

