/**
 * Dashboard Service
 * Dashboard istatistikleri ve grafik verilerini yönetir
 * 
 * @module services/dashboardService
 * @description Dashboard sayfası için gerekli verileri API'den çeker ve React Query ile cache'ler
 */

import apiClient from './api/axios';
import { useQuery } from '@tanstack/react-query';
import { CacheStrategies, QueryKeys } from '@/config/queryConfig';

/**
 * Dashboard istatistikleri interface'i
 * @interface DashboardStats
 */
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

/**
 * Dashboard istatistiklerini API'den çeker
 * Ekipman, proje, görev ve müşteri sayılarını ve yaklaşan bakım/projeleri getirir
 * 
 * @returns Dashboard istatistikleri ve yaklaşan bakım/projeler
 * @throws {Error} API hatası durumunda
 * 
 * @example
 * ```typescript
 * const stats = await getDashboardStats();
 * console.log(stats.stats.equipment.total); // Toplam ekipman sayısı
 * ```
 */
export const getDashboardStats = async (): Promise<{
  stats: DashboardStats;
  upcomingMaintenances: UpcomingMaintenance[];
  upcomingProjects: UpcomingProject[];
}> => {
  const res = await apiClient.get('/dashboard/stats');
  return res.data;
};

export interface ChartData {
  activityData: Array<{
    date: string;
    projects: number;
    tasks: number;
    equipment: number;
  }>;
  equipmentStatus: Array<{ name: string; value: number }>;
  projectStatus: Array<{ name: string; value: number }>;
  taskStatus: Array<{ name: string; value: number }>;
  taskCompletionTrend: Array<{
    date: string;
    completed: number;
  }>;
  taskCompletion?: Array<{
    date: string;
    completed: number;
    total?: number;
  }>;
  monthlyActivity?: Array<{
    date: string;
    count: number;
  }>;
  equipmentUsage: {
    available: string;
    inUse: string;
    maintenance: string;
    damaged: string;
  };
}

/**
 * Dashboard grafik verilerini API'den çeker
 * Belirtilen periyot için aktivite, durum ve kullanım grafiklerini getirir
 * 
 * @param period - Grafik periyodu (gün cinsinden, varsayılan: 30)
 * @returns Grafik verileri (aktivite, durum, tamamlanma trendi, kullanım)
 * @throws {Error} API hatası durumunda
 * 
 * @example
 * ```typescript
 * const charts = await getDashboardCharts(7); // Son 7 gün
 * console.log(charts.equipmentStatus); // Ekipman durum grafiği
 * ```
 */
export const getDashboardCharts = async (period: number = 30): Promise<ChartData> => {
  const res = await apiClient.get(`/dashboard/charts?period=${period}`);
  return res.data.charts;
};

/**
 * React Query hook - Dashboard istatistiklerini getirir
 * 5 dakika cache süresi ile verileri cache'ler
 * 
 * @returns React Query hook sonucu (data, isLoading, error)
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useDashboardStats();
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * return <Dashboard stats={data.stats} />;
 * ```
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: QueryKeys.dashboard.stats,
    queryFn: getDashboardStats,
    ...CacheStrategies.dashboard,
  });
};

/**
 * React Query hook - Dashboard grafik verilerini getirir
 * 5 dakika cache süresi ile verileri cache'ler
 * 
 * @param period - Grafik periyodu (gün cinsinden, varsayılan: 30)
 * @returns React Query hook sonucu (data, isLoading, error)
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useDashboardCharts(7);
 * if (isLoading) return <Loading />;
 * return <Charts data={data} />;
 * ```
 */
export const useDashboardCharts = (period: number = 30) => {
  return useQuery({
    queryKey: QueryKeys.dashboard.charts(period),
    queryFn: () => getDashboardCharts(period),
    ...CacheStrategies.dashboard,
  });
};

