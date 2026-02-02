import apiClient from './api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  result: ImportResult;
}

/**
 * Template dosyası indir
 */
/**
 * Template dosyası indir
 */
export const downloadTemplate = async (type: string): Promise<Blob> => {
  const response = await apiClient.get(`/import/template?type=${type}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Ekipman import
 */
export const importEquipment = async (file: File): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'inventory'); // Backend expects 'inventory' or 'equipment'

  const response = await apiClient.post<ImportResponse>('/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Proje import
 */
export const importProjects = async (file: File): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'projects');

  const response = await apiClient.post<ImportResponse>('/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// React Query Hooks
export const useImportEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useImportProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importProjects,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

