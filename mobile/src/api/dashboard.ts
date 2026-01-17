import http from './http';

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
    _id: string;
    name: string;
    type: string;
    model?: string;
  };
  scheduledDate: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface UpcomingProject {
  _id: string;
  name: string;
  startDate: string;
  client?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface DashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
  upcomingMaintenances: UpcomingMaintenance[];
  upcomingProjects: UpcomingProject[];
}

export interface ChartData {
  date: string;
  projects: number;
  tasks: number;
  equipment: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
}

export interface DashboardChartsResponse {
  success: boolean;
  charts: {
    activityData: ChartData[];
    equipmentStatus: StatusDistribution[];
    projectStatus: StatusDistribution[];
    taskStatus: StatusDistribution[];
    taskCompletionTrend: Array<{ date: string; completed: number }>;
    monthlyActivity: Array<{ date: string; count: number }>;
    equipmentUsage: {
      available: string;
      inUse: string;
      maintenance: string;
      damaged: string;
    };
  };
}

/**
 * Dashboard istatistiklerini getir
 */
export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await http.get<DashboardStatsResponse>('/dashboard/stats');
  return response.data;
};

/**
 * Dashboard grafik verilerini getir
 */
export const getDashboardCharts = async (period: number = 30): Promise<DashboardChartsResponse> => {
  const response = await http.get<DashboardChartsResponse>('/dashboard/charts', {
    params: { period },
  });
  return response.data;
};
