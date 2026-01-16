import apiClient from './api/axios';
import { useQuery } from '@tanstack/react-query';

export type AnalyticsDashboardResponse = {
  success: boolean;
  range: {
    from: string;
    to: string;
    prevFrom: string;
    prevTo: string;
  };
  comparison: {
    projects: { current: number; previous: number; changePct: number };
    tasksCreated: { current: number; previous: number; changePct: number };
    tasksCompleted: { current: number; previous: number; changePct: number };
  };
  projects: {
    byStatus: Array<{ status: string; count: number }>;
    trendByMonth: Array<{ month: string; count: number }>;
    topClients: Array<{ clientId: string; name?: string; count: number }>;
    avgDurationDays: number;
  };
  tasks: {
    byStatus: Array<{ status: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
    byAssignee: Array<{ userId: string; name?: string; email?: string; count: number }>;
    completedTrendByDay: Array<{ day: string; count: number }>;
    forecastNext7Days: Array<{ day: string; expectedCompleted: number }>;
  };
  equipment: {
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    inUseByProject: Array<{ projectId: string; name?: string; status?: string; count: number }>;
  };
  maintenance: {
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    cost: { total: number; avg: number };
    upcoming14d: number;
  };
};

export const getAnalyticsDashboard = async (params?: { from?: string; to?: string }): Promise<AnalyticsDashboardResponse> => {
  const res = await apiClient.get('/analytics/dashboard', { params });
  return res.data as AnalyticsDashboardResponse;
};

export const useAnalyticsDashboard = (params?: { from?: string; to?: string }) =>
  useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: () => getAnalyticsDashboard(params),
    staleTime: 60_000,
  });

