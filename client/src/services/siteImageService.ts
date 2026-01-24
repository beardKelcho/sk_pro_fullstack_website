import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import logger from '@/utils/logger';

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

  // Debug log
  logger.debug('getAllImages çağrılıyor:', { endpoint, params, isPublic });

  try {
    const res = await apiClient.get(endpoint, { params });

    logger.debug('getAllImages response:', {
      status: res.status,
      data: res.data,
      imagesCount: res.data?.images?.length || 0,
    });

    // Backend response formatı: { success: true, count: number, images: [] }
    // Axios response formatı: { data: { success, count, images } }
    const responseData = res.data || {};

    // Response formatını normalize et
    const result = {
      images: responseData.images || [],
      count: responseData.count || responseData.images?.length || 0,
    };

    logger.debug('getAllImages normalized result:', result);

    return result;
  } catch (error: unknown) {
    // Hata durumunda detaylı log
    const axiosError = error as { response?: { data?: unknown; status?: number; statusText?: string; headers?: unknown }; message?: string; config?: { url?: string; method?: string; headers?: unknown } };
    logger.error('getAllImages API hatası:', {
      endpoint,
      params,
      error: axiosError?.response?.data || axiosError?.message,
      status: axiosError?.response?.status,
      statusText: axiosError?.response?.statusText,
      headers: axiosError?.response?.headers,
      config: {
        url: axiosError?.config?.url,
        method: axiosError?.config?.method,
        headers: axiosError?.config?.headers,
      },
    });
    throw error;
  }
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

// Alias for createImage as uploadImage (legacy support)
export const uploadImage = (data: FormData | Partial<SiteImage>) => {
  // If FormData, we might need a different endpoint or handle it here.
  // Assuming backend handles FormData at /site-images endpoint if POST
  // BUT axios call in createImage uses 'data'. 
  // If data is FormData, axios handles content-type.
  return apiClient.post('/site-images', data).then(res => res.data.image || res.data);
};
