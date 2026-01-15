'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats, getDashboardCharts, ChartData } from '@/services/dashboardService';
import logger from '@/utils/logger';
import type { Widget } from '@/services/widgetService';
import StatCardWidget from '@/components/admin/widgets/StatCardWidget';
import DonutChartWidget from '@/components/admin/widgets/DonutChartWidget';
import PieChartWidget from '@/components/admin/widgets/PieChartWidget';
import LineChartWidget from '@/components/admin/widgets/LineChartWidget';
import BarChartWidget from '@/components/admin/widgets/BarChartWidget';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    equipment: { total: 0, available: 0, inUse: 0, maintenance: 0 },
    projects: { total: 0, active: 0, completed: 0 },
    tasks: { total: 0, open: 0, completed: 0 },
    clients: { total: 0, active: 0 }
  });
  const [upcomingProjects, setUpcomingProjects] = useState<any[]>([]);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<any[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const statsData = await getDashboardStats();
        setStats(statsData.stats);
        setUpcomingProjects(statsData.upcomingProjects || []);
        setUpcomingMaintenances(statsData.upcomingMaintenances || []);

        // Charts verisini ayrı bir request olarak lazy load et (non-blocking)
        getDashboardCharts(7)
          .then((chartsData) => setCharts(chartsData))
          .catch((error) => logger.error('Charts verisi yüklenirken hata:', error));
      } catch (error) {
        logger.error('Dashboard verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  const dashboardStats = { stats, upcomingProjects, upcomingMaintenances };
  const chartData = charts
    ? {
        equipmentStatus: charts.equipmentStatus || [],
        projectStatus: charts.projectStatus || [],
        taskCompletion: (charts as any).taskCompletion || (charts as any).taskCompletionTrend || [],
        monthlyActivity: (charts as any).monthlyActivity || (charts as any).activityData || [],
        activityData: (charts as any).activityData || [],
      }
    : undefined;

  const makeWidget = (w: Pick<Widget, 'type' | 'title' | 'settings'>): Widget => ({
    userId: 'system',
    type: w.type,
    title: w.title,
    settings: w.settings,
    isVisible: true,
    order: 0,
    position: { x: 0, y: 0, w: 4, h: 4 },
  });

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            SK Production yönetim paneline hoş geldiniz
          </p>
        </div>
      </div>

      {/* 1) En üst: Yaklaşan Etkinlikler + Yaklaşan Bakımlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yaklaşan Etkinlikler */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Yaklaşan Etkinlikler</h2>
            <Link href="/admin/projects">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Tümünü Gör
              </span>
            </Link>
          </div>
          <div className="p-4">
            {upcomingProjects.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingProjects.map((project) => (
                  <div key={project._id || project.id} className="py-3 flex items-start">
                    <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2 bg-blue-500"></div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-white">{project.name}</h3>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="mr-2">{formatDate(project.startDate)}</span>
                        <span>•</span>
                        <span className="ml-2">{project.location || 'Konum belirtilmemiş'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                Yaklaşan proje bulunmuyor
              </p>
            )}
          </div>
        </div>
        
        {/* Yaklaşan Bakımlar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Yaklaşan Bakımlar</h2>
            <Link href="/admin/equipment/maintenance">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Tümünü Gör
              </span>
            </Link>
          </div>
          <div className="p-4">
            {upcomingMaintenances.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingMaintenances.map((item) => (
                  <div key={item._id || item.id} className="py-3 flex items-start">
                    <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2 bg-yellow-500"></div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                        {item.equipment?.name || 'Ekipman bilgisi yok'}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Bakım Tarihi: {formatDate(item.scheduledDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                Yaklaşan bakım bulunmuyor
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2) Altında: Toplam Ekipman + Aktif Projeler + Açık Görevler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardWidget
          widget={makeWidget({ type: 'STAT_CARD', title: 'Toplam Ekipman', settings: { statType: 'equipment_total' } })}
          dashboardStats={dashboardStats}
          isEditable={false}
        />
        <StatCardWidget
          widget={makeWidget({ type: 'STAT_CARD', title: 'Aktif Projeler', settings: { statType: 'projects_active' } })}
          dashboardStats={dashboardStats}
          isEditable={false}
        />
        <StatCardWidget
          widget={makeWidget({ type: 'STAT_CARD', title: 'Açık Görevler', settings: { statType: 'tasks_open' } })}
          dashboardStats={dashboardStats}
          isEditable={false}
        />
      </div>

      {/* 3) Altında: Proje Durum Dağılımı + Müşteriler */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-h-[380px]">
          <DonutChartWidget
            widget={makeWidget({ type: 'DONUT_CHART', title: 'Proje Durum Dağılımı', settings: { chartType: 'project_status' } })}
            chartData={chartData}
            isEditable={false}
          />
        </div>
        <div className="min-h-[190px]">
          <StatCardWidget
            widget={makeWidget({ type: 'STAT_CARD', title: 'Müşteriler', settings: { statType: 'clients_total' } })}
            dashboardStats={dashboardStats}
            isEditable={false}
          />
        </div>
      </div>

      {/* 4) Altında: Ekipman Durum Dağılımı */}
      <div className="min-h-[380px]">
        <PieChartWidget
          widget={makeWidget({ type: 'PIE_CHART', title: 'Ekipman Durum Dağılımı', settings: { chartType: 'equipment_status' } })}
          chartData={chartData}
          isEditable={false}
        />
      </div>

      {/* 5) Altında: Görev Tamamlanma Trendi */}
      <div className="min-h-[380px]">
        <LineChartWidget
          widget={makeWidget({ type: 'LINE_CHART', title: 'Görev Tamamlanma Trendi', settings: { chartType: 'task_completion' } })}
          chartData={chartData}
          isEditable={false}
        />
      </div>

      {/* 6) Altında: Aylık Aktivite */}
      <div className="min-h-[380px]">
        <BarChartWidget
          widget={makeWidget({ type: 'BAR_CHART', title: 'Aylık Aktivite', settings: { chartType: 'monthly_activity' } })}
          chartData={chartData}
          isEditable={false}
        />
      </div>
    </div>
  );
}
