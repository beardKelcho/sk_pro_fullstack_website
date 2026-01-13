import apiClient from './api/axios';

export interface DashboardStats {
  equipment: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    total: number;
    open: number;
    completed: number;
  };
  clients: {
    total: number;
    active: number;
  };
}

export interface UpcomingMaintenance {
  _id: string;
  equipment: {
    name: string;
    type: string;
    model: string;
  };
  scheduledDate: string;
  assignedTo: {
    name: string;
    email: string;
  };
}

export interface UpcomingProject {
  _id: string;
  name: string;
  startDate: string;
  location: string;
  client: {
    name: string;
    email: string;
  };
}

export const getDashboardStats = async (): Promise<{
  stats: DashboardStats;
  upcomingMaintenances: UpcomingMaintenance[];
  upcomingProjects: UpcomingProject[];
}> => {
  const res = await apiClient.get('/dashboard/stats');
  return res.data;
};

