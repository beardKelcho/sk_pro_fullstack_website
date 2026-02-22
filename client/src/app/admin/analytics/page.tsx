'use client';

import React, { useMemo, useState } from 'react';
import { useAnalyticsDashboard } from '@/services/analyticsService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(() => import('@/components/admin/AnalyticsCharts'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
});

const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

const downloadJson = (filename: string, data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function AnalyticsPage() {
  const today = useMemo(() => new Date(), []);
  const [to, setTo] = useState(toIsoDate(today));
  const [from, setFrom] = useState(toIsoDate(new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000)));

  const { data, isLoading, error, refetch, isFetching } = useAnalyticsDashboard({ from, to });

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setTo(toIsoDate(end));
    setFrom(toIsoDate(start));
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(`analytics-${from}-to-${to}.json`, data);
    toast.success('JSON export indirildi');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h2 className="text-red-800 dark:text-red-200 font-semibold mb-2">Hata</h2>
        <p className="text-red-600 dark:text-red-300 text-sm">Analytics verileri yüklenemedi.</p>
      </div>
    );
  }

  const projectStatusData = data.projects.byStatus.map((x) => ({ name: x.status, value: x.count }));
  const taskStatusData = data.tasks.byStatus.map((x) => ({ name: x.status, value: x.count }));
  const taskPriorityData = data.tasks.byPriority.map((x) => ({ name: x.priority, value: x.count }));
  const projectTrend = data.projects.trendByMonth.map((x) => ({ month: x.month, count: x.count }));
  const completedTrend = data.tasks.completedTrendByDay.map((x) => ({ day: x.day, count: x.count }));
  const forecast = data.tasks.forecastNext7Days.map((x) => ({ day: x.day, expected: x.expectedCompleted }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Proje/Görev/Ekipman/Bakım metrikleri, trend karşılaştırma ve basit tahminleme.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => handleQuickRange(30)}
          >
            30 Gün
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => handleQuickRange(90)}
          >
            90 Gün
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => handleQuickRange(180)}
          >
            180 Gün
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
                disabled={isFetching}
              >
                {isFetching ? 'Yenileniyor…' : 'Uygula'}
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                JSON Export
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">Projeler (Karşılaştırma)</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.comparison.projects.current}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Önceki: {data.comparison.projects.previous} • Değişim: {data.comparison.projects.changePct.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">Görevler (Oluşturulan)</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.comparison.tasksCreated.current}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Önceki: {data.comparison.tasksCreated.previous} • Değişim: {data.comparison.tasksCreated.changePct.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">Görevler (Tamamlanan)</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.comparison.tasksCompleted.current}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Önceki: {data.comparison.tasksCompleted.previous} • Değişim: {data.comparison.tasksCompleted.changePct.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <AnalyticsCharts
        projectStatusData={projectStatusData}
        taskStatusData={taskStatusData}
        taskPriorityData={taskPriorityData}
        projectTrend={projectTrend}
        completedTrend={completedTrend}
        forecast={forecast}
        data={data}
      />
    </div>
  );
}

