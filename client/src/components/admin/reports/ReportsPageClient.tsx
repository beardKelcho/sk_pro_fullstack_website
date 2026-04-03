'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { DownloadCloud, Loader2, FileText, BarChart2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import reportService from '@/services/reportService';
import inventoryService, { type InventoryItem } from '@/services/inventoryService';
import { getAllProjects, type Project } from '@/services/projectService';
import {
  buildInventoryStatusStats,
  buildProjectStatusStats,
  buildReportSummaryCards,
  filterProjectsByScope,
  getProjectScopeLabel,
  type ReportProjectScope,
} from '@/utils/reportInsights';
import logger from '@/utils/logger';

const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PROJECT_SCOPE_OPTIONS: ReportProjectScope[] = ['all', 'active', 'upcoming', 'past'];

export default function ReportsPage() {
  const [downloadingInventory, setDownloadingInventory] = useState(false);
  const [downloadingProjects, setDownloadingProjects] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [projectScope, setProjectScope] = useState<ReportProjectScope>('all');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);

    try {
      const [inventoryResponse, projectResponse] = await Promise.all([
        inventoryService.getItems({ limit: 1000 }),
        getAllProjects({ limit: 1000, dateScope: 'all' }),
      ]);

      setInventoryItems(inventoryResponse.data || []);
      setProjects(projectResponse.projects || []);
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      logger.error('Rapor istatistikleri alınamadı', error);
      setStatsError('Rapor verileri alınamadı. Lütfen yeniden deneyin.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const scopedProjects = useMemo(
    () => filterProjectsByScope(projects, projectScope),
    [projectScope, projects]
  );

  const inventoryStats = useMemo(
    () => buildInventoryStatusStats(inventoryItems),
    [inventoryItems]
  );

  const projectStatusStats = useMemo(
    () => buildProjectStatusStats(scopedProjects),
    [scopedProjects]
  );

  const summaryCards = useMemo(
    () => buildReportSummaryCards(inventoryItems, scopedProjects, projectScope),
    [inventoryItems, projectScope, scopedProjects]
  );

  const formattedLastUpdatedAt = useMemo(() => {
    if (!lastUpdatedAt) {
      return null;
    }

    return new Date(lastUpdatedAt).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lastUpdatedAt]);

  const handleDownloadInventory = async (format: 'excel' | 'pdf') => {
    setDownloadingInventory(true);
    try {
      await reportService.downloadInventoryReport(format);
      toast.success(`Envanter raporu ${format.toUpperCase()} olarak indiriliyor.`);
    } catch (error) {
      toast.error('Envanter raporu indirilemedi.');
    } finally {
      setDownloadingInventory(false);
    }
  };

  const handleDownloadProjects = async (format: 'excel' | 'pdf') => {
    setDownloadingProjects(true);
    try {
      await reportService.downloadProjectsReport(format);
      toast.success(`Projeler raporu ${format.toUpperCase()} olarak indiriliyor.`);
    } catch (error) {
      toast.error('Projeler raporu indirilemedi.');
    } finally {
      setDownloadingProjects(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
            <BarChart2 className="h-6 w-6 text-indigo-500" />
            Is Zekasi ve Raporlama
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Sirketinizin genel durumunu grafiklerle analiz edin ve Excel/PDF raporlari olusturun.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex flex-wrap gap-2">
            {PROJECT_SCOPE_OPTIONS.map((scope) => {
              const isActive = projectScope === scope;
              return (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setProjectScope(scope)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white'
                  }`}
                >
                  {getProjectScopeLabel(scope)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {formattedLastUpdatedAt && <span>Son guncelleme: {formattedLastUpdatedAt}</span>}
            <button
              type="button"
              onClick={() => void fetchStats()}
              disabled={loadingStats}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:text-white"
            >
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Yenile
            </button>
          </div>
        </div>
      </div>

      {statsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
          <div className="flex items-center justify-between gap-3">
            <span>{statsError}</span>
            <button
              type="button"
              onClick={() => void fetchStats()}
              className="rounded-md border border-red-200 px-3 py-1.5 font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{card.description}</div>
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Genel Envanter Durumu</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tum ekipman kayitlarinin guncel durum dagilimi</p>
            </div>
          </div>
          <div className="flex h-[300px] w-full items-center justify-center">
            {loadingStats ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            ) : inventoryStats.length === 0 ? (
              <span className="text-gray-500">Veri bulunamadi</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventoryStats.map((entry, index) => (
                      <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proje Durum Dagilimi</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getProjectScopeLabel(projectScope)} kapsamindaki projelerin durum ozeti
              </p>
            </div>
          </div>
          <div className="flex h-[300px] w-full items-center justify-center">
            {loadingStats ? (
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            ) : projectStatusStats.length === 0 ? (
              <span className="text-gray-500">Secili kapsam icin veri bulunamadi</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStatusStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#888' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="toplam" fill="#00C49F" name="Proje Sayisi" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 pt-4 md:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex-grow p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Envanter Detay Raporu</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tum departmanlardaki ekipmanlarin, guncel konum, miktar ve zimmet durumlarini iceren master dokum.
            </p>
          </div>
          <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
            <button
              onClick={() => void handleDownloadInventory('excel')}
              disabled={downloadingInventory}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {downloadingInventory ? <Loader2 className="h-5 w-5 animate-spin" /> : <DownloadCloud className="h-5 w-5" />}
              Excel Indir
            </button>
            <button
              onClick={() => void handleDownloadInventory('pdf')}
              disabled={downloadingInventory}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {downloadingInventory ? <Loader2 className="h-5 w-5 animate-spin" /> : <DownloadCloud className="h-5 w-5" />}
              PDF Indir
            </button>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex-grow p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Projeler ve Butce Analizi</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tum tamamlanmis ve devam eden projelerin, butce verileri, baslangic tarihleri ve guncel maliyet ozetleri.
            </p>
          </div>
          <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
            <button
              onClick={() => void handleDownloadProjects('excel')}
              disabled={downloadingProjects}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {downloadingProjects ? <Loader2 className="h-5 w-5 animate-spin" /> : <DownloadCloud className="h-5 w-5" />}
              Excel Indir
            </button>
            <button
              onClick={() => void handleDownloadProjects('pdf')}
              disabled={downloadingProjects}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {downloadingProjects ? <Loader2 className="h-5 w-5 animate-spin" /> : <DownloadCloud className="h-5 w-5" />}
              PDF Indir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
