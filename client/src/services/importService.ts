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
export const downloadTemplate = async (type: 'equipment' | 'project'): Promise<Blob> => {
  const response = await apiClient.get(`/import/template/${type}`, {
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

  const response = await apiClient.post<ImportResponse>('/import/equipment', formData, {
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

  const response = await apiClient.post<ImportResponse>('/import/projects', formData, {
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

