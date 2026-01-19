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
import { getAllProjects } from '@/services/projectService';
import { checkApiHealth } from '@/utils/apiHealthCheck';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false); // Dashboard özelleştirme modu
  const [stats, setStats] = useState({
    equipment: { total: 0, available: 0, inUse: 0, maintenance: 0 },
    projects: { total: 0, active: 0, completed: 0 },
    tasks: { total: 0, open: 0, completed: 0 },
    clients: { total: 0, active: 0 }
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<any[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Önce API'nin erişilebilir olup olmadığını kontrol et
        const isApiAvailable = await checkApiHealth();
        setApiAvailable(isApiAvailable);

        if (!isApiAvailable) {
          logger.warn('Backend API erişilebilir değil. Dashboard boş verilerle gösterilecek.');
          setLoading(false);
          return;
        }

        const [statsData, projectsData] = await Promise.allSettled([
          getDashboardStats(),
          getAllProjects({ page: 1, limit: 1000 }),
        ]);

        if (statsData.status === 'fulfilled') {
          setStats(statsData.value.stats);
          setUpcomingMaintenances(statsData.value.upcomingMaintenances || []);
        } else {
          // API hatası durumunda varsayılan değerleri kullan
          logger.warn('Dashboard stats yüklenemedi:', statsData.reason);
        }

        if (projectsData.status === 'fulfilled') {
          setProjects(projectsData.value.projects || []);
        } else {
          setProjects([]);
          logger.warn('Projects yüklenemedi:', projectsData.reason);
        }

        // Charts verisini ayrı bir request olarak lazy load et (non-blocking)
        getDashboardCharts(7)
          .then((chartsData) => setCharts(chartsData))
          .catch((error) => {
            logger.error('Charts verisi yüklenirken hata:', error);
            // Charts yüklenemezse null kalır, sayfa yine de render edilir
          });
      } catch (error) {
        logger.error('Dashboard verileri yüklenirken hata:', error);
        // Hata olsa bile sayfa render edilmeli
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

  const getProjectStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
      case 'PLANNING':
        return 'Onay Bekleyen';
      case 'APPROVED':
        return 'Onaylanan';
      case 'ACTIVE':
        return 'Devam Ediyor';
      case 'ON_HOLD':
        return 'Ertelendi';
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return 'Onay Bekleyen';
    }
  };

  const getProjectStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'APPROVED':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  // API erişilebilir değilse kullanıcıya bilgi ver
  if (apiAvailable === false) {
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
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h2 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Backend API Erişilemiyor</h2>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Backend API&apos;ye bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.
            <br />
            <span className="text-xs mt-2 block">
              Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const dashboardStats = { stats, upcomingProjects: [], upcomingMaintenances };
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
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center gap-2"
        >
          {isCustomizing ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Özelleştirmeyi Bitir
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Dashboard&apos;u Özelleştir
            </>
          )}
        </button>
      </div>

      {/* 1) En üst: Tüm Projeler (durumlarıyla) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Projeler</h2>
          <Link href="/admin/projects">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Tümünü Gör
            </span>
          </Link>
        </div>
        <div className="p-4">
          {projects.length > 0 ? (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project: any) => {
                const id = project._id || project.id || '';
                const clientName =
                  typeof project.client === 'object' && project.client
                    ? (project.client.companyName || project.client.name || '')
                    : '';
                const statusLabel = getProjectStatusLabel(project.status);
                const badgeClass = getProjectStatusBadgeClass(project.status);

                return (
                  <Link
                    key={id}
                    href={id ? `/admin/projects/view/${id}` : '/admin/projects'}
                    className="block py-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {project.name || 'Proje'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                          {clientName ? `${clientName} • ` : ''}
                          {project.startDate ? formatDate(project.startDate) : 'Tarih yok'}
                          {project.location ? ` • ${project.location}` : ''}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
              Proje bulunmuyor
            </p>
          )}
        </div>
      </div>

      {/* 2) Altında: Toplam Ekipman + Aktif Projeler + Açık Görevler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardWidget
          widget={makeWidget({ type: 'STAT_CARD', title: 'Toplam Ekipman', settings: { statType: 'equipment_total' } })}
          dashboardStats={dashboardStats}
          isEditable={isCustomizing}
        />
        <StatCardWidget
          widget={makeWidget({ type: 'STAT_CARD', title: 'Aktif Projeler', settings: { statType: 'projects_active' } })}
          dashboardStats={dashboardStats}
          isEditable={isCustomizing}
        />
        <StatCardWidget
          widget={makeWidget({ type: 'STAT_CARD', title: 'Açık Görevler', settings: { statType: 'tasks_open' } })}
          dashboardStats={dashboardStats}
          isEditable={isCustomizing}
        />
      </div>

      {/* 3) Altında: Proje Durum Dağılımı + Müşteriler */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-h-[380px]">
          <DonutChartWidget
            widget={makeWidget({ type: 'DONUT_CHART', title: 'Proje Durum Dağılımı', settings: { chartType: 'project_status' } })}
            chartData={chartData}
            isEditable={isCustomizing}
          />
        </div>
        <div className="min-h-[190px]">
          <StatCardWidget
            widget={makeWidget({ type: 'STAT_CARD', title: 'Müşteriler', settings: { statType: 'clients_total' } })}
            dashboardStats={dashboardStats}
            isEditable={isCustomizing}
          />
        </div>
      </div>

      {/* 4) Altında: Ekipman Durum Dağılımı + Yaklaşan Bakımlar */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[380px]">
          <PieChartWidget
            widget={makeWidget({ type: 'PIE_CHART', title: 'Ekipman Durum Dağılımı', settings: { chartType: 'equipment_status' } })}
            chartData={chartData}
            isEditable={isCustomizing}
          />
        </div>

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
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingMaintenances.map((item: any) => (
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

      {/* 5) Altında: Görev Tamamlanma Trendi */}
      <div className="min-h-[380px]">
        <LineChartWidget
          widget={makeWidget({ type: 'LINE_CHART', title: 'Görev Tamamlanma Trendi', settings: { chartType: 'task_completion' } })}
          chartData={chartData}
          isEditable={isCustomizing}
        />
      </div>

      {/* 6) Altında: Aylık Aktivite */}
      <div className="min-h-[380px]">
        <BarChartWidget
          widget={makeWidget({ type: 'BAR_CHART', title: 'Aylık Aktivite', settings: { chartType: 'monthly_activity' } })}
          chartData={chartData}
          isEditable={isCustomizing}
        />
      </div>
    </div>
  );
}
