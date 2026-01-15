'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getDashboardStats, getDashboardCharts, ChartData } from '@/services/dashboardService';
import { getUserWidgets, createDefaultWidgets, Widget } from '@/services/widgetService';
import { trackApiError } from '@/utils/errorTracking';
import logger from '@/utils/logger';
import { authApi } from '@/services/api/auth';
import { Permission, Role, rolePermissions, hasPermission } from '@/config/permissions';
import { User } from '@/services/userService';

// Lazy load WidgetContainer (react-grid-layout içerir, büyük bundle)
const WidgetContainer = dynamic(
  () => import('@/components/admin/widgets/WidgetContainer'),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    ),
    ssr: false, // Client-side only (react-grid-layout SSR desteklemiyor)
  }
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
        
        // Kullanıcı profilini yükle
        try {
          const profileResponse = await authApi.getProfile();
          if (profileResponse.data?.user) {
            setCurrentUser(profileResponse.data.user);
          }
        } catch (error) {
          logger.error('Kullanıcı profili yüklenirken hata:', error);
          // localStorage'dan kullanıcı bilgilerini al (fallback)
          try {
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              setCurrentUser(userData);
            }
          } catch (e) {
            logger.error('Kullanıcı bilgisi parse hatası:', e);
          }
        }
        
        // Dashboard verilerini ve widget'ları paralel yükle
        // Charts verisini lazy load yap (ilk yüklemede sadece stats ve widgets)
        const [statsData, userWidgets] = await Promise.allSettled([
          getDashboardStats(),
          getUserWidgets(),
        ]);
        
        // Charts verisini ayrı bir request olarak lazy load et (non-blocking)
        getDashboardCharts(7).then((chartsData) => {
          setCharts(chartsData);
        }).catch((error) => {
          logger.error('Charts verisi yüklenirken hata:', error);
        });

        if (statsData.status === 'fulfilled') {
          setStats(statsData.value.stats);
          setUpcomingProjects(statsData.value.upcomingProjects || []);
          setUpcomingMaintenances(statsData.value.upcomingMaintenances || []);
        }

        if (userWidgets.status === 'fulfilled') {
          if (userWidgets.value.length === 0) {
            // Varsayılan widget'ları oluştur
            try {
              const defaultWidgets = await createDefaultWidgets();
              setWidgets(defaultWidgets);
            } catch (error: any) {
              trackApiError(error, '/widgets/defaults', 'POST');
              logger.error('Varsayılan widget oluşturma hatası:', error);
            }
          } else {
            setWidgets(userWidgets.value);
          }
        } else {
          // Widget yükleme hatası - varsayılan widget'ları oluşturmayı dene
          try {
            const defaultWidgets = await createDefaultWidgets();
            setWidgets(defaultWidgets);
          } catch (error: any) {
            trackApiError(error, '/widgets/defaults', 'POST');
            logger.error('Varsayılan widget oluşturma hatası:', error);
          }
        }
      } catch (error) {
        logger.error('Dashboard verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Widget'ları yetkilere göre filtrele - useMemo ile optimize et
  // ÖNEMLİ: Position'ları yeniden hesaplama - Widget'ların kendi position'larını kullan
  const filteredWidgets = React.useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const filtered = widgets.filter(widget => {
      // Widget görünür değilse gösterme
      if (!widget.isVisible) return false;

      // Widget'ın requiredPermission ayarı varsa kontrol et
      const requiredPermission = widget.settings?.requiredPermission as Permission | undefined;
      if (requiredPermission) {
        return hasPermission(currentUser.role, requiredPermission, currentUser.permissions);
      }

      // Permission yoksa varsayılan olarak göster
      return true;
    });

    // Widget'ları order ve position'a göre sırala - position'ları değiştirme!
    const sorted = [...filtered].sort((a, b) => {
      // Önce order'a göre sırala
      if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
        return a.order - b.order;
      }
      // Sonra y pozisyonuna göre
      const aY = a.position?.y ?? 0;
      const bY = b.position?.y ?? 0;
      if (aY !== bY) {
        return aY - bY;
      }
      // Son olarak x pozisyonuna göre
      return (a.position?.x ?? 0) - (b.position?.x ?? 0);
    });

    // Position'ları değiştirmeden döndür - WidgetContainer kendi layout'unu yönetecek
    return sorted;
  }, [
    // Stable dependencies
    widgets.length,
    widgets.map(w => `${w._id}-${w.isVisible}-${w.order}-${w.position?.x}-${w.position?.y}-${w.position?.w}-${w.position?.h}`).join('|'),
    currentUser?.role || '',
    (currentUser?.permissions || []).join(',')
  ]);

  const handleWidgetsChange = useCallback((updatedWidgets: Widget[]) => {
    // Sadece gerçekten değiştiyse güncelle - referans karşılaştırması yap
    setWidgets(prevWidgets => {
      // Deep comparison - sadece gerçekten değiştiyse güncelle
      const prevKey = prevWidgets.map(w => `${w._id}-${w.position?.x}-${w.position?.y}-${w.position?.w}-${w.position?.h}-${w.order}`).join('|');
      const newKey = updatedWidgets.map(w => `${w._id}-${w.position?.x}-${w.position?.y}-${w.position?.w}-${w.position?.h}-${w.order}`).join('|');
      
      if (prevKey === newKey) {
        return prevWidgets; // Değişiklik yok, aynı referansı döndür
      }
      
      return updatedWidgets;
    });
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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            SK Production yönetim paneline hoş geldiniz
          </p>
        </div>
      </div>

      {/* Widget Container */}
      {filteredWidgets.length > 0 ? (
        <WidgetContainer
          widgets={filteredWidgets}
          onWidgetsChange={handleWidgetsChange}
          isEditable={false}
          dashboardStats={{
            stats,
            upcomingProjects,
            upcomingMaintenances,
          }}
          chartData={charts ? {
            equipmentStatus: charts.equipmentStatus || [],
            projectStatus: charts.projectStatus || [],
            taskCompletion: (charts as any).taskCompletion || charts.taskCompletionTrend || [],
            monthlyActivity: (charts as any).monthlyActivity || charts.activityData || [],
          } : undefined}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Henüz widget yapılandırılmamış
          </p>
          <button
            onClick={async () => {
              try {
                const defaultWidgets = await createDefaultWidgets();
                setWidgets(defaultWidgets);
              } catch (error: any) {
                trackApiError(error, '/widgets/defaults', 'POST');
                logger.error('Varsayılan widget oluşturma hatası:', error);
              }
            }}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Varsayılan Widget&apos;ları Oluştur
          </button>
        </div>
      )}

      {/* Yaklaşan Etkinlikler ve Bakımlar - Widget olmayan sabit bölümler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
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
    </div>
  );
}
