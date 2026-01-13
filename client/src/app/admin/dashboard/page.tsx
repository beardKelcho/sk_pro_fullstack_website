'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/services/dashboardService';

// Dashboard kartı bileşeni
const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  link 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  description?: string; 
  trend?: { value: number; isUp: boolean }; 
  link?: { text: string; url: string } 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      )}
      
      {trend && (
        <div className={`flex items-center text-sm ${trend.isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mb-2`}>
          <span className="mr-1">
            {trend.isUp ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            )}
          </span>
          {trend.value}% {trend.isUp ? 'artış' : 'azalış'} (son 30 gün)
        </div>
      )}
      
      {link && (
        <Link href={link.url}>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline block mt-2">
            {link.text} &rarr;
          </span>
        </Link>
      )}
    </div>
  );
};

// Dashboard için istatistik simgeleri
const EquipmentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
  </svg>
);

const TaskIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
  </svg>
);

const ClientIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        setUpcomingProjects(data.upcomingProjects || []);
        setUpcomingMaintenances(data.upcomingMaintenances || []);
      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
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
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          SK Production yönetim paneline hoş geldiniz
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
        </div>
      ) : (
        <>
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Toplam Ekipman" 
              value={stats.equipment.total} 
              icon={<EquipmentIcon />}
              link={{ text: "Tüm ekipmanları görüntüle", url: "/admin/equipment" }}
            />
            <DashboardCard 
              title="Aktif Projeler" 
              value={stats.projects.active} 
              icon={<ProjectIcon />}
              link={{ text: "Tüm projeleri görüntüle", url: "/admin/projects" }}
            />
            <DashboardCard 
              title="Açık Görevler" 
              value={stats.tasks.open} 
              icon={<TaskIcon />}
              link={{ text: "Tüm görevleri görüntüle", url: "/admin/tasks" }}
            />
            <DashboardCard 
              title="Müşteriler" 
              value={stats.clients.total} 
              icon={<ClientIcon />}
              link={{ text: "Tüm müşterileri görüntüle", url: "/admin/clients" }}
            />
          </div>
      
      {/* Durum ve Bilgi Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yaklaşan Etkinlikler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
        </>
      )}
    </div>
  );
} 