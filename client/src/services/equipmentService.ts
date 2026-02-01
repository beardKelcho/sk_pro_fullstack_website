import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, getUserFriendlyMessage } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';
import { CacheStrategies } from '@/config/queryConfig';

export interface Equipment {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED' | 'RETIRED';
  location?: string;
  notes?: string;
  responsibleUser?: string;
  qrCodeId?: string;
  qrCodeValue?: string;
  specs?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  warrantyExpiry?: string;
  images?: string[];
  documents?: string[];
}

export interface CreateEquipmentWithQRCodeResponse {
  success: boolean;
  equipment: Equipment;
  qrCode?: any;
  qrImage?: string | null;
}

export const getAllEquipment = async (params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ equipment: Equipment[]; total: number; page: number; totalPages: number }> => {
  try {
    // Backend inventory API expects 'category' not 'type' if that's what we mean
    const queryParams: any = { ...params };
    if (queryParams.type) {
      queryParams.category = queryParams.type;
      delete queryParams.type;
    }
    const res = await apiClient.get('/inventory/items', { params: queryParams });
    return {
      equipment: res.data.data, // Backend returns { data: [], pagination: ... }
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      totalPages: res.data.pagination.pages
    };
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getAllEquipment error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  try {
    const res = await apiClient.get(`/inventory/items/${id}`);
    return res.data.data || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getEquipmentById error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const createEquipment = async (data: Partial<Equipment>): Promise<Equipment> => {
  try {
    const res = await apiClient.post('/inventory/items', data);
    return res.data.data || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('createEquipment error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const createEquipmentWithQRCode = async (data: Partial<Equipment>): Promise<CreateEquipmentWithQRCodeResponse> => {
  try {
    const res = await apiClient.post('/inventory/items', data);
    // Backend inventory create might not return QR code details immediately in same structure
    // But for now let's pipe it.
    return res.data as CreateEquipmentWithQRCodeResponse;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('createEquipmentWithQRCode error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const updateEquipment = async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
  try {
    const res = await apiClient.put(`/inventory/items/${id}`, data);
    return res.data.data || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('updateEquipment error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/inventory/items/${id}`);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('deleteEquipment error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

// React Query Hooks
export const useEquipment = (params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['equipment', params],
    queryFn: () => getAllEquipment(params),
    ...CacheStrategies.equipment,
  });
};

export const useEquipmentById = (id: string | null) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => getEquipmentById(id!),
    enabled: !!id,
    ...CacheStrategies.equipment,
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) => updateEquipment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}; 