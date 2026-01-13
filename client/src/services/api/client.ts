import apiClient from './axios';
import { ClientForm } from '@/types/client';

export const clientApi = {
  getAll: () => apiClient.get('/clients'),
  getById: (id: string) => apiClient.get(`/clients/${id}`),
  create: (data: ClientForm) => apiClient.post('/clients', data),
  update: (id: string, data: ClientForm) => apiClient.put(`/clients/${id}`, data),
  delete: (id: string) => apiClient.delete(`/clients/${id}`),
  getProjects: (id: string) => apiClient.get(`/clients/${id}/projects`),
  getTasks: (id: string) => apiClient.get(`/clients/${id}/tasks`)
}; 