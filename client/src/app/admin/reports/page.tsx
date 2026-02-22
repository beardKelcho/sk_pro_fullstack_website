'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DownloadCloud, Loader2, FileText, BarChart2 } from 'lucide-react';
import { toast } from 'react-toastify';
import reportService from '@/services/reportService';
import inventoryService from '@/services/inventoryService';
import { projectApi } from '@/services/api/project';

// Recharts kütüphanesini lazy load olarak içe aktar
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsPage() {
    const [downloadingInventory, setDownloadingInventory] = useState(false);
    const [downloadingProjects, setDownloadingProjects] = useState(false);

    // Grafikler için state
    const [inventoryStats, setInventoryStats] = useState<any[]>([]);
    const [projectStatusStats, setProjectStatusStats] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                // Backendden verileri getir
                const [invRes, curProjRes] = await Promise.all([
                    inventoryService.getItems({ limit: 1000 }),
                    projectApi.getAll()
                ]);

                const items = invRes.data || [];
                const projects = Array.isArray(curProjRes) ? curProjRes : (curProjRes as any).data || [];

                // Envanter Durum Grubu
                const statusCounts: Record<string, number> = {};
                items.forEach((item: any) => {
                    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
                });
                const invData = Object.keys(statusCounts).map(key => ({
                    name: key === 'AVAILABLE' ? 'Müsait' :
                        key === 'IN_USE' ? 'Kullanımda' :
                            key === 'MAINTENANCE' ? 'Bakımda' :
                                key === 'MISSING' ? 'Kayıp' :
                                    key === 'RETIRED' ? 'Emekli' : key,
                    value: statusCounts[key]
                }));
                setInventoryStats(invData);

                // Proje Durum Grubu
                const projStatusCounts: Record<string, number> = {};
                projects.forEach((proj: any) => {
                    projStatusCounts[proj.status] = (projStatusCounts[proj.status] || 0) + 1;
                });
                const projData = Object.keys(projStatusCounts).map(key => ({
                    name: key,
                    toplam: projStatusCounts[key]
                }));
                setProjectStatusStats(projData);

            } catch (e) {
                console.error("Dashboard verisi alınamadı", e);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

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
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                        İş Zekası ve Raporlama
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                        Şirketinizin genel durumunu grafiklerle analiz edin ve Excel/PDF raporları oluşturun.
                    </p>
                </div>
            </div>

            {/* Dashboard Grafikleri (Lazy Loaded) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Envanter Durumu Pasta Grafiği */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genel Envanter Durumu</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {loadingStats ? (
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        ) : inventoryStats.length === 0 ? (
                            <span className="text-gray-500">Veri Bulunamadı</span>
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
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Proje Durumları Çubuk Grafiği */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proje Durum Dağılımı</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {loadingStats ? (
                            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                        ) : projectStatusStats.length === 0 ? (
                            <span className="text-gray-500">Veri Bulunamadı</span>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectStatusStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#888' }} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Legend />
                                    <Bar dataKey="toplam" fill="#00C49F" name="Proje Sayısı" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Rapor İndirme Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
                {/* Envanter Raporu */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                    <div className="p-6 flex-grow">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Envanter Detay Raporu</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Tüm departmanlardaki ekipmanların, güncel konum, miktar ve zimmet durumlarını içeren master döküm.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <button
                            onClick={() => handleDownloadInventory('excel')}
                            disabled={downloadingInventory}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                        >
                            {downloadingInventory ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
                            Excel İndir
                        </button>
                        <button
                            onClick={() => handleDownloadInventory('pdf')}
                            disabled={downloadingInventory}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                        >
                            {downloadingInventory ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
                            PDF İndir
                        </button>
                    </div>
                </div>

                {/* Projeler Raporu */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                    <div className="p-6 flex-grow">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Projeler & Bütçe Analizi</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Tüm tamamlanmış ve devam eden projelerin, bütçe verileri, başlangıç tarihleri ve güncel maliyet özetleri.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <button
                            onClick={() => handleDownloadProjects('excel')}
                            disabled={downloadingProjects}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                        >
                            {downloadingProjects ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
                            Excel İndir
                        </button>
                        <button
                            onClick={() => handleDownloadProjects('pdf')}
                            disabled={downloadingProjects}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                        >
                            {downloadingProjects ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
                            PDF İndir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
