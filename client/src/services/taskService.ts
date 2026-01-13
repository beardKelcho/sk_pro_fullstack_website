import apiClient from './api/axios';

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  project?: string;
  assignedTo: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const getAllTasks = async (params?: {
  status?: string;
  priority?: string;
  project?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}): Promise<{ tasks: Task[]; total: number; page: number; totalPages: number }> => {
  const res = await apiClient.get('/tasks', { params });
  return res.data;
};

export const getTaskById = async (id: string): Promise<Task> => {
  const res = await apiClient.get(`/tasks/${id}`);
  return res.data.task || res.data;
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
  const res = await apiClient.post('/tasks', data);
  return res.data.task || res.data;
};

export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  const res = await apiClient.put(`/tasks/${id}`, data);
  return res.data.task || res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
}; 