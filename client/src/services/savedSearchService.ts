import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SavedSearch {
  _id: string;
  name: string;
  userId: string;
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance' | 'All';
  filters: {
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistory {
  _id: string;
  userId: string;
  query: string;
  resource?: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance' | 'All';
  resultCount: number;
  createdAt: string;
}

/**
 * Kaydedilmiş aramaları getir
 */
export const getSavedSearches = async (resource?: string): Promise<{ success: boolean; savedSearches: SavedSearch[] }> => {
  const params = resource ? { resource } : {};
  const res = await apiClient.get('/search/saved', { params });
  return res.data;
};

/**
 * Yeni kaydedilmiş arama oluştur
 */
export const createSavedSearch = async (data: {
  name: string;
  resource: string;
  filters: any;
}): Promise<{ success: boolean; savedSearch: SavedSearch }> => {
  const res = await apiClient.post('/search/saved', data);
  return res.data;
};

/**
 * Kaydedilmiş aramayı sil
 */
export const deleteSavedSearch = async (id: string): Promise<{ success: boolean; message: string }> => {
  const res = await apiClient.delete(`/search/saved/${id}`);
  return res.data;
};

/**
 * Arama geçmişini getir
 */
export const getSearchHistory = async (limit: number = 20): Promise<{ success: boolean; history: SearchHistory[] }> => {
  const res = await apiClient.get('/search/history', { params: { limit } });
  return res.data;
};

/**
 * Arama geçmişini temizle
 */
export const clearSearchHistory = async (): Promise<{ success: boolean; message: string }> => {
  const res = await apiClient.delete('/search/history');
  return res.data;
};

// React Query Hooks
export const useSavedSearches = (resource?: string) => {
  return useQuery({
    queryKey: ['saved-searches', resource],
    queryFn: () => getSavedSearches(resource),
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
};

export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSavedSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
};

export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSavedSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
};

export const useSearchHistory = (limit: number = 20) => {
  return useQuery({
    queryKey: ['search-history', limit],
    queryFn: () => getSearchHistory(limit),
    staleTime: 1 * 60 * 1000, // 1 dakika
  });
};

export const useClearSearchHistory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clearSearchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });
};

