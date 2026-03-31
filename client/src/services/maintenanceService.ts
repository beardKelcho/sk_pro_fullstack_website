import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, getUserFriendlyMessage } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';
import { CacheStrategies } from '@/config/queryConfig';

export interface Maintenance {
  _id?: string;
  id?: string;
  equipment: string | { _id?: string; id?: string; name?: string; type?: string; model?: string };
  type: 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'UPGRADE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo: string | { _id?: string; id?: string; name?: string; email?: string; role?: string };
  cost?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  parts?: string[];
  laborHours?: number;
  technician?: string;
}

export const getAllMaintenance = async (params?: {
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
  equipment?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ maintenances: Maintenance[]; total: number; page: number; totalPages: number }> => {
  try {
    const res = await apiClient.get('/maintenance', { params });
    return res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getAllMaintenance error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const getMaintenanceById = async (id: string): Promise<Maintenance> => {
  try {
    const res = await apiClient.get(`/maintenance/${id}`);
    return res.data.maintenance || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getMaintenanceById error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const createMaintenance = async (data: Partial<Maintenance>): Promise<Maintenance> => {
  try {
    const res = await apiClient.post('/maintenance', data);
    return res.data.maintenance || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('createMaintenance error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const updateMaintenance = async (id: string, data: Partial<Maintenance>): Promise<Maintenance> => {
  try {
    const res = await apiClient.put(`/maintenance/${id}`, data);
    return res.data.maintenance || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('updateMaintenance error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/maintenance/${id}`);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('deleteMaintenance error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

// Bakım durumlarını Türkçe olarak göstermek için yardımcı fonksiyonlar
export const getStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    'SCHEDULED': 'Planlandı',
    'IN_PROGRESS': 'Devam Ediyor',
    'COMPLETED': 'Tamamlandı',
    'CANCELLED': 'İptal Edildi'
  };
  return statuses[status] || status;
};

export const getTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'ROUTINE': 'Periyodik Bakım',
    'REPAIR': 'Arıza Bakımı',
    'INSPECTION': 'Kalibrasyon',
    'UPGRADE': 'Güncelleme'
  };
  return types[type] || type;
};

export const getPriorityLabel = (priority: string): string => {
  const priorities: Record<string, string> = {
    'LOW': 'Düşük',
    'MEDIUM': 'Orta',
    'HIGH': 'Yüksek',
    'URGENT': 'Acil'
  };
  return priorities[priority] || priority;
};

export const mapBackendMaintenanceTypeToFrontend = (type: string): string => {
  return getTypeLabel(type);
};

export const mapFrontendMaintenanceTypeToBackend = (type: string): string | undefined => {
  const typeMap: Record<string, string> = {
    'Periyodik Bakım': 'ROUTINE',
    'Arıza Bakımı': 'REPAIR',
    'Kalibrasyon': 'INSPECTION',
    'Güncelleme': 'UPGRADE',
    'Periyodik': 'ROUTINE',
    'Arıza': 'REPAIR',
  };
  return typeMap[type];
};

export const mapBackendMaintenanceStatusToFrontend = (status: string): string => {
  return getStatusLabel(status);
};

export const mapFrontendMaintenanceStatusToBackend = (status: string): string | undefined => {
  const statusMap: Record<string, string> = {
    'Planlandı': 'SCHEDULED',
    'Devam Ediyor': 'IN_PROGRESS',
    'Tamamlandı': 'COMPLETED',
    'İptal Edildi': 'CANCELLED',
  };
  return statusMap[status];
};

export const mapBackendMaintenancePriorityToFrontend = (priority?: string): string => {
  if (!priority) return 'Orta';
  return getPriorityLabel(priority);
};

export const mapFrontendMaintenancePriorityToBackend = (
  priority: string
): Maintenance['priority'] | undefined => {
  const priorityMap: Record<string, NonNullable<Maintenance['priority']>> = {
    'Düşük': 'LOW',
    'Orta': 'MEDIUM',
    'Yüksek': 'HIGH',
    'Acil': 'URGENT',
  };
  return priorityMap[priority];
};

// React Query Hooks
export const useMaintenance = (params?: {
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
  equipment?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['maintenance', params],
    queryFn: () => getAllMaintenance(params),
    ...CacheStrategies.maintenance,
  });
};

export const useMaintenanceById = (id: string | null) => {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => getMaintenanceById(id!),
    enabled: !!id,
    ...CacheStrategies.maintenance,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Maintenance> }) => updateMaintenance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};
