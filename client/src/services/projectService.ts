import apiClient from './api/axios';

export interface Project {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  location?: string;
  client: string;
  team?: string[];
  equipment?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const getAllProjects = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ projects: Project[]; total: number; page: number; totalPages: number }> => {
  const res = await apiClient.get('/projects', { params });
  return res.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const res = await apiClient.get(`/projects/${id}`);
  return res.data.project || res.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
  const res = await apiClient.post('/projects', data);
  return res.data.project || res.data;
};

export const updateProject = async (id: string, data: Partial<Project> | any): Promise<Project> => {
  const res = await apiClient.put(`/projects/${id}`, data);
  return res.data.project || res.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
}; 