import axios from 'axios';
import { ClientForm } from '@/types/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const clientApi = {
  getAll: () => axios.get(`${API_URL}/clients`),
  getById: (id: string) => axios.get(`${API_URL}/clients/${id}`),
  create: (data: ClientForm) => axios.post(`${API_URL}/clients`, data),
  update: (id: string, data: ClientForm) => axios.put(`${API_URL}/clients/${id}`, data),
  delete: (id: string) => axios.delete(`${API_URL}/clients/${id}`),
  getProjects: (id: string) => axios.get(`${API_URL}/clients/${id}/projects`),
  getTasks: (id: string) => axios.get(`${API_URL}/clients/${id}/tasks`)
}; 