import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, getUserFriendlyMessage } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';
import { CacheStrategies } from '@/config/queryConfig';

export interface Customer {
  _id?: string;
  id?: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  status?: 'Active' | 'Inactive' | string;
  notes?: string;
  taxNumber?: string;
  contacts?: {
    name: string;
    phone: string;
    email: string;
    role: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export const getAllCustomers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ clients: Customer[]; total: number; page: number; totalPages: number }> => {
  try {
    const res = await apiClient.get('/clients', { params });
    return res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getAllCustomers error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  try {
    const res = await apiClient.get(`/clients/${id}`);
    return res.data.client || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getCustomerById error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  try {
    const res = await apiClient.post('/clients', data);
    return res.data.client || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('createCustomer error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  try {
    const res = await apiClient.put(`/clients/${id}`, data);
    return res.data.client || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('updateCustomer error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/clients/${id}`);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('deleteCustomer error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

// Müşteri durumlarını Türkçe olarak göstermek için yardımcı fonksiyon
export const getStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    'Aktif': 'Aktif',
    'Pasif': 'Pasif'
  };
  return statuses[status] || status;
};

// Sektör listesi
export const industries = [
  'Teknoloji',
  'Finans',
  'Üretim',
  'Perakende',
  'Sağlık',
  'Eğitim',
  'Medya',
  'Turizm',
  'İnşaat',
  'Enerji',
  'Lojistik',
  'Diğer'
] as const;

// Şehir listesi
export const cities = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Mersin',
  'Diyarbakır',
  'Kayseri',
  'Eskişehir',
  'Samsun',
  'Denizli',
  'Şanlıurfa'
] as const;

// React Query Hooks
export const useCustomers = (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getAllCustomers(params),
    ...CacheStrategies.customers,
  });
};

export const useCustomerById = (id: string | null) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id!),
    enabled: !!id,
    ...CacheStrategies.customers,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}; 