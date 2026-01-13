import apiClient from './api/axios';

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
  [key: string]: any;
}

export const getAllUsers = async (params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; total: number; page: number; totalPages: number }> => {
  const res = await apiClient.get('/users', { params });
  return res.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await apiClient.get(`/users/${id}`);
  return res.data.user || res.data;
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  const res = await apiClient.post('/users', data);
  return res.data.user || res.data;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const res = await apiClient.put(`/users/${id}`, data);
  return res.data.user || res.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
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