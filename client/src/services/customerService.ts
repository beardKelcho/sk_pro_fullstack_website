import apiClient from './api/axios';

export interface Customer {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const getAllCustomers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ clients: Customer[]; total: number; page: number; totalPages: number }> => {
  const res = await apiClient.get('/clients', { params });
  return res.data;
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  const res = await apiClient.get(`/clients/${id}`);
  return res.data.client || res.data;
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  const res = await apiClient.post('/clients', data);
  return res.data.client || res.data;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  const res = await apiClient.put(`/clients/${id}`, data);
  return res.data.client || res.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await apiClient.delete(`/clients/${id}`);
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