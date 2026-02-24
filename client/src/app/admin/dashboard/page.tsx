'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/useDashboard';
import type { Widget } from '@/services/widgetService';
import StatCardWidget from '@/components/admin/widgets/StatCardWidget';
import dynamic from 'next/dynamic';

const DonutChartWidget = dynamic(() => import('@/components/admin/widgets/DonutChartWidget'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-64 rounded-xl border border-gray-200 dark:border-gray-700"></div>
});
const PieChartWidget = dynamic(() => import('@/components/admin/widgets/PieChartWidget'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-64 rounded-xl border border-gray-200 dark:border-gray-700"></div>
});
const LineChartWidget = dynamic(() => import('@/components/admin/widgets/LineChartWidget'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-64 rounded-xl border border-gray-200 dark:border-gray-700"></div>
});
const BarChartWidget = dynamic(() => import('@/components/admin/widgets/BarChartWidget'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-64 rounded-xl border border-gray-200 dark:border-gray-700"></div>
});

export default function Dashboard() {
  const {
    stats,
    chartData,
    recentProjects,
    upcomingMaintenances,
    loading,
    apiAvailable
  } = useDashboard();

  const [isCustomizing, setIsCustomizing] = useState(false);

  // Helper Helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getProjectStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
      case 'PLANNING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'APPROVED': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ON_HOLD': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const dashboardStats = {
    stats,
    upcomingProjects: [],
    upcomingMaintenances
  };

  const makeWidget = (w: Pick<Widget, 'type' | 'title' | 'settings'>): Widget => ({
    userId: 'system',
    type: w.type,
    title: w.title,
    settings: w.settings,
    isVisible: true,
    order: 0,
    position: { x: 0, y: 0, w: 4, h: 4 },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  if (apiAvailable === false) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard - Sistem Hatası</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">Backend API erişilemiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Yönetim Paneli</p>
        </div>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] text-white rounded-md flex items-center gap-2"
        >
          {isCustomizing ? 'Özelleştirmeyi Bitir' : 'Dashboard\'u Özelleştir'}
        </button>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Son Projeler</h2>
          <Link href="/admin/projects" className="text-sm text-blue-600 hover:underline">Tümünü Gör</Link>
        </div>
        <div className="p-4">
          {recentProjects.length > 0 ? (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {recentProjects.map((project: any) => (
                <Link key={project.id || project._id} href={`/admin/projects/view?id=${project.id || project._id}`} className="block py-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.client?.companyName || project.client?.name} • {formatDate(project.startDate)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getProjectStatusBadgeClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="text-center py-4 text-gray-500">Proje bulunamadı.</p>}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardWidget widget={makeWidget({ type: 'STAT_CARD', title: 'Toplam Ekipman', settings: { statType: 'equipment_total' } })} dashboardStats={dashboardStats} isEditable={isCustomizing} />
        <StatCardWidget widget={makeWidget({ type: 'STAT_CARD', title: 'Aktif Projeler', settings: { statType: 'projects_active' } })} dashboardStats={dashboardStats} isEditable={isCustomizing} />
        <StatCardWidget widget={makeWidget({ type: 'STAT_CARD', title: 'Açık Görevler', settings: { statType: 'tasks_open' } })} dashboardStats={dashboardStats} isEditable={isCustomizing} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-h-[380px]">
          <DonutChartWidget widget={makeWidget({ type: 'DONUT_CHART', title: 'Proje Durumu', settings: { chartType: 'project_status' } })} chartData={chartData || undefined} isEditable={isCustomizing} />
        </div>
        <div className="min-h-[190px]">
          <StatCardWidget widget={makeWidget({ type: 'STAT_CARD', title: 'Müşteriler', settings: { statType: 'clients_total' } })} dashboardStats={dashboardStats} isEditable={isCustomizing} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[380px]">
          <PieChartWidget widget={makeWidget({ type: 'PIE_CHART', title: 'Ekipman Durumu', settings: { chartType: 'equipment_status' } })} chartData={chartData || undefined} isEditable={isCustomizing} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg">Yaklaşan Bakımlar</h2>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {upcomingMaintenances.length > 0 ? upcomingMaintenances.map(m => (
              <div key={m._id} className="py-2 border-b last:border-0 border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium">{m.equipment?.name}</p>
                <p className="text-xs text-gray-500">{formatDate(m.scheduledDate)}</p>
              </div>
            )) : <p className="text-gray-500 text-center">Bakım yok</p>}
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LineChartWidget widget={makeWidget({ type: 'LINE_CHART', title: 'Görev Trendi', settings: { chartType: 'task_completion' } })} chartData={chartData || undefined} isEditable={isCustomizing} />
        <BarChartWidget widget={makeWidget({ type: 'BAR_CHART', title: 'Aylık Aktivite', settings: { chartType: 'monthly_activity' } })} chartData={chartData || undefined} isEditable={isCustomizing} />
      </div>
    </div>
  );
}
