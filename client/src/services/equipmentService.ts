import apiClient from './api/axios';

export interface Equipment {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED';
  location?: string;
  notes?: string;
  responsibleUser?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const getAllEquipment = async (params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ equipment: Equipment[]; total: number; page: number; totalPages: number }> => {
  const res = await apiClient.get('/equipment', { params });
  return res.data;
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const res = await apiClient.get(`/equipment/${id}`);
  return res.data.equipment || res.data;
};

export const createEquipment = async (data: Partial<Equipment> | any): Promise<Equipment> => {
  const res = await apiClient.post('/equipment', data);
  return res.data.equipment || res.data;
};

export const updateEquipment = async (id: string, data: Partial<Equipment> | any): Promise<Equipment> => {
  const res = await apiClient.put(`/equipment/${id}`, data);
  return res.data.equipment || res.data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  await apiClient.delete(`/equipment/${id}`);
}; 