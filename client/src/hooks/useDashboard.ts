import { useState, useEffect } from 'react';
import {
    getDashboardStats,
    getDashboardCharts,
    DashboardStats,
    ChartData,
    UpcomingMaintenance
} from '@/services/dashboardService';
import { getAllProjects } from '@/services/projectService';
import { checkApiHealth } from '@/utils/apiHealthCheck';
import logger from '@/utils/logger';
import { toast } from 'react-toastify';

export interface DashboardData {
    stats: DashboardStats;
    chartData: ChartData | null;
    recentProjects: any[]; // Ideally typed with Project interface but keeping any for now to match strictness incrementally or use Project[]
    upcomingMaintenances: UpcomingMaintenance[];
    loading: boolean;
    apiAvailable: boolean | null;
    refresh: () => Promise<void>;
}

export const useDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

    const [stats, setStats] = useState<DashboardStats>({
        equipment: { total: 0, available: 0, inUse: 0, maintenance: 0 },
        projects: { total: 0, active: 0, completed: 0 },
        tasks: { total: 0, open: 0, completed: 0 },
        clients: { total: 0, active: 0 }
    });

    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [upcomingMaintenances, setUpcomingMaintenances] = useState<UpcomingMaintenance[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const isApiAvailable = await checkApiHealth();
            setApiAvailable(isApiAvailable);

            if (!isApiAvailable) {
                toast.error('API erişilemiyor');
                setLoading(false);
                return;
            }

            // Parallel Fetching
            const [statsRes, projectsRes] = await Promise.allSettled([
                getDashboardStats(),
                getAllProjects({ page: 1, limit: 10 }), // Fetch recent 10 projects
            ]);

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.stats);
                setUpcomingMaintenances(statsRes.value.upcomingMaintenances || []);
            } else {
                logger.error('Stats fetch failed', statsRes.reason);
            }

            if (projectsRes.status === 'fulfilled') {
                // Handle project response format (support { projects: [], ... } or [])
                const pList = (projectsRes.value as any).projects || projectsRes.value;
                setRecentProjects(Array.isArray(pList) ? pList : []);
            } else {
                logger.error('Projects fetch failed', projectsRes.reason);
            }

            // Lazy load charts (non-blocking for main stats, but here we await for "loading" state simplicity or separate?)
            // User asked for dynamic data flow. let's fetch charts too.
            try {
                const charts = await getDashboardCharts(7);
                setChartData(charts);
            } catch (err) {
                logger.error('Charts fetch failed', err);
            }

        } catch (error) {
            logger.error('Dashboard fetch error', error);
            toast.error('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        stats,
        chartData,
        recentProjects,
        upcomingMaintenances,
        loading,
        apiAvailable,
        refresh: fetchData
    };
};
