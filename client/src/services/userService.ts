import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, getUserFriendlyMessage } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';
import { CacheStrategies } from '@/config/queryConfig';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FIRMA_SAHIBI' | 'PROJE_YONETICISI' | 'DEPO_SORUMLUSU' | 'TEKNISYEN';
  permissions?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
}

export const getAllUsers = async (params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; total: number; page: number; totalPages: number }> => {
  try {
    const res = await apiClient.get('/users', { params });
    return res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getAllUsers error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const getUserById = async (id: string): Promise<User> => {
  try {
    const res = await apiClient.get(`/users/${id}`);
    return res.data.user || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getUserById error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  try {
    const res = await apiClient.post('/users', data);
    return res.data.user || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('createUser error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data.user || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('updateUser error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('deleteUser error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

// Kullanıcı rollerini Türkçe olarak göstermek için yardımcı fonksiyon
export const getRoleLabel = (role: string): string => {
  const roles: Record<string, string> = {
    'ADMIN': 'Admin',
    'FIRMA_SAHIBI': 'Firma Sahibi',
    'PROJE_YONETICISI': 'Proje Yöneticisi',
    'DEPO_SORUMLUSU': 'Depo Sorumlusu',
    'TEKNISYEN': 'Teknisyen'
  };
  return roles[role] || role;
};

// Backend rolünü frontend rolüne çevir
export const mapBackendRoleToFrontend = (backendRole: string): string => {
  const roleMap: Record<string, string> = {
    'ADMIN': 'Admin',
    'FIRMA_SAHIBI': 'Firma Sahibi',
    'PROJE_YONETICISI': 'Proje Yöneticisi',
    'DEPO_SORUMLUSU': 'Depo Sorumlusu',
    'TEKNISYEN': 'Teknisyen'
  };
  return roleMap[backendRole] || backendRole;
};

// Frontend rolünü backend rolüne çevir
export const mapFrontendRoleToBackend = (frontendRole: string): string => {
  const roleMap: Record<string, string> = {
    'Admin': 'ADMIN',
    'Firma Sahibi': 'FIRMA_SAHIBI',
    'Proje Yöneticisi': 'PROJE_YONETICISI',
    'Depo Sorumlusu': 'DEPO_SORUMLUSU',
    'Teknisyen': 'TEKNISYEN'
  };
  return roleMap[frontendRole] || frontendRole;
};

// React Query Hooks
export const useUsers = (params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getAllUsers(params),
    ...CacheStrategies.users,
  });
};

export const useUserById = (id: string | null) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
    ...CacheStrategies.users,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}; 