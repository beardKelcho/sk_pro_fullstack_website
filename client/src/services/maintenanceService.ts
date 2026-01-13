import apiClient from './api/axios';

export interface Maintenance {
  _id?: string;
  id?: string;
  equipment: string;
  type: 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'UPGRADE';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo: string;
  cost?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const getAllMaintenance = async (params?: {
  status?: string;
  type?: string;
  equipment?: string;
  page?: number;
  limit?: number;
}): Promise<{ maintenances: Maintenance[]; total: number; page: number; totalPages: number }> => {
  const res = await apiClient.get('/maintenance', { params });
  return res.data;
};

export const getMaintenanceById = async (id: string): Promise<Maintenance> => {
  const res = await apiClient.get(`/maintenance/${id}`);
  return res.data.maintenance || res.data;
};

export const createMaintenance = async (data: Partial<Maintenance> | any): Promise<Maintenance> => {
  const res = await apiClient.post('/maintenance', data);
  return res.data.maintenance || res.data;
};

export const updateMaintenance = async (id: string, data: Partial<Maintenance> | any): Promise<Maintenance> => {
  const res = await apiClient.put(`/maintenance/${id}`, data);
  return res.data.maintenance || res.data;
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  await apiClient.delete(`/maintenance/${id}`);
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
    'INSPECTION': 'İnceleme',
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