import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, getUserFriendlyMessage } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';
import { CacheStrategies } from '@/config/queryConfig';

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
  tags?: string[];
  attachments?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export const getAllTasks = async (params?: {
  status?: string;
  priority?: string;
  project?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}): Promise<{ tasks: Task[]; total: number; page: number; totalPages: number }> => {
  try {
    const res = await apiClient.get('/tasks', { params });
    return res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getAllTasks error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const getTaskById = async (id: string): Promise<Task> => {
  try {
    const res = await apiClient.get(`/tasks/${id}`);
    return res.data.task || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getTaskById error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
  try {
    const res = await apiClient.post('/tasks', data);
    return res.data.task || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('createTask error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  try {
    const res = await apiClient.put(`/tasks/${id}`, data);
    return res.data.task || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('updateTask error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/tasks/${id}`);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('deleteTask error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

// React Query Hooks
export const useTasks = (params?: {
  status?: string;
  priority?: string;
  project?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getAllTasks(params),
    ...CacheStrategies.tasks,
  });
};

export const useTaskById = (id: string | null) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id!),
    enabled: !!id,
    ...CacheStrategies.tasks,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}; 