import http from './http';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  project?: {
    _id: string;
    name: string;
    status: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  tasks: Task[];
}

export interface TaskResponse {
  success: boolean;
  task: Task;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string;
  completedDate?: string;
}

/**
 * Tüm görevleri listele
 */
export const getTasks = async (params?: {
  status?: string;
  priority?: string;
  project?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<TasksResponse> => {
  const response = await http.get<TasksResponse>('/tasks', { params });
  return response.data;
};

/**
 * Tek bir görevin detaylarını getir
 */
export const getTaskById = async (id: string): Promise<TaskResponse> => {
  const response = await http.get<TaskResponse>(`/tasks/${id}`);
  return response.data;
};

/**
 * Görev güncelle
 */
export const updateTask = async (id: string, data: UpdateTaskData): Promise<TaskResponse> => {
  const response = await http.put<TaskResponse>(`/tasks/${id}`, data);
  return response.data;
};
