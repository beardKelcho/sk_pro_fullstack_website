import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, getUserFriendlyMessage } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';
import { CacheStrategies } from '@/config/queryConfig';

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
  budget?: number;
  notes?: string;
}

export const getAllProjects = async (params?: {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ projects: Project[]; total: number; page: number; totalPages: number }> => {
  try {
    const res = await apiClient.get('/projects', { params });
    return res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getAllProjects error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data.project || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('getProjectById error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
  try {
    const res = await apiClient.post('/projects', data);
    return res.data.project || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('createProject error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
  try {
    const res = await apiClient.put(`/projects/${id}`, data);
    return res.data.project || res.data;
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('updateProject error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/projects/${id}`);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('deleteProject error:', apiError);
    throw new Error(getUserFriendlyMessage(apiError));
  }
};

// React Query Hooks
export const useProjects = (params?: {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getAllProjects(params),
    ...CacheStrategies.projects,
  });
};

export const useProjectById = (id: string | null) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
    ...CacheStrategies.projects,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(id, data),
    onSuccess: (_: Project, variables: { id: string; data: Partial<Project> }) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}; 