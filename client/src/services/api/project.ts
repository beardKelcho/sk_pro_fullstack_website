import axios from 'axios';
import { ProjectForm } from '@/types/project';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const projectApi = {
  getAll: () => axios.get(`${API_URL}/projects`),
  getById: (id: string) => axios.get(`${API_URL}/projects/${id}`),
  create: (data: ProjectForm) => axios.post(`${API_URL}/projects`, data),
  update: (id: string, data: ProjectForm) => axios.put(`${API_URL}/projects/${id}`, data),
  delete: (id: string) => axios.delete(`${API_URL}/projects/${id}`),
  getTasks: (id: string) => axios.get(`${API_URL}/projects/${id}/tasks`),
  getTeam: (id: string) => axios.get(`${API_URL}/projects/${id}/team`),
  getEquipment: (id: string) => axios.get(`${API_URL}/projects/${id}/equipment`)
}; 