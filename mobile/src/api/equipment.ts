import http from './http';

export interface Equipment {
  _id: string;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED';
  location?: string;
  purchaseDate?: string;
  notes?: string;
  responsibleUser?: {
    _id: string;
    name: string;
    email: string;
  };
  currentProject?: {
    _id: string;
    name: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  equipment: Equipment[];
}

export interface SingleEquipmentResponse {
  success: boolean;
  equipment: Equipment;
}

export interface UpdateEquipmentData {
  name?: string;
  status?: Equipment['status'];
  location?: string;
  notes?: string;
}

/**
 * Tüm ekipmanları listele
 */
export const getEquipment = async (params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<EquipmentResponse> => {
  const response = await http.get<EquipmentResponse>('/equipment', { params });
  return response.data;
};

/**
 * Tek bir ekipmanın detaylarını getir
 */
export const getEquipmentById = async (id: string): Promise<SingleEquipmentResponse> => {
  const response = await http.get<SingleEquipmentResponse>(`/equipment/${id}`);
  return response.data;
};

/**
 * Ekipman güncelle
 */
export const updateEquipment = async (id: string, data: UpdateEquipmentData): Promise<SingleEquipmentResponse> => {
  const response = await http.put<SingleEquipmentResponse>(`/equipment/${id}`, data);
  return response.data;
};
