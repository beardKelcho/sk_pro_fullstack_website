import apiClient from './api/axios';

export interface SiteImage {
  _id?: string;
  id?: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  category: 'project' | 'gallery' | 'hero' | 'about' | 'other';
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

