import apiClient from './axios';
import { ProjectForm } from '@/types/project';

export const projectApi = {
  getAll: () => apiClient.get('/projects'),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: ProjectForm) => apiClient.post('/projects', data),
  update: (id: string, data: ProjectForm) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
  getTasks: (id: string) => apiClient.get(`/projects/${id}/tasks`),
  getTeam: (id: string) => apiClient.get(`/projects/${id}/team`),
  getEquipment: (id: string) => apiClient.get(`/projects/${id}/equipment`)
}; 