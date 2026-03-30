import { startTransition, useEffect, useState } from 'react';
import {
    getDashboardStats,
    getDashboardCharts,
    DashboardStats,
    ChartData,
    UpcomingMaintenance
} from '@/services/dashboardService';
import { getAllProjects, type Project } from '@/services/projectService';
import { checkApiHealth } from '@/utils/apiHealthCheck';
import logger from '@/utils/logger';
import { toast } from 'react-toastify';

export interface DashboardData {
    stats: DashboardStats;
    chartData: ChartData | null;
    chartsLoading: boolean;
    recentProjects: Project[];
    upcomingMaintenances: UpcomingMaintenance[];
    loading: boolean;
    apiAvailable: boolean | null;
    refresh: () => Promise<void>;
}

export const useDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(false);
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

    const [stats, setStats] = useState<DashboardStats>({
        equipment: { total: 0, available: 0, inUse: 0, maintenance: 0 },
        projects: { total: 0, active: 0, completed: 0 },
        tasks: { total: 0, open: 0, completed: 0 },
        clients: { total: 0, active: 0 }
    });

    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [upcomingMaintenances, setUpcomingMaintenances] = useState<UpcomingMaintenance[]>([]);

    const loadCharts = async () => {
        setChartsLoading(true);
        try {
            const charts = await getDashboardCharts(7);
            startTransition(() => {
                setChartData(charts);
            });
        } catch (err) {
            logger.error('Charts fetch failed', err);
            startTransition(() => {
                setChartData(null);
            });
        } finally {
            setChartsLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setChartsLoading(false);
        try {
            const isApiAvailable = await checkApiHealth();
            setApiAvailable(isApiAvailable);

            if (!isApiAvailable) {
                setChartData(null);
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
                const projectResponse = projectsRes.value as Awaited<ReturnType<typeof getAllProjects>> | Project[];
                const pList = Array.isArray(projectResponse) ? projectResponse : projectResponse.projects;
                setRecentProjects(Array.isArray(pList) ? pList : []);
            } else {
                logger.error('Projects fetch failed', projectsRes.reason);
            }
            setLoading(false);
            void loadCharts();
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
        chartsLoading,
        recentProjects,
        upcomingMaintenances,
        loading,
        apiAvailable,
        refresh: fetchData
    };
};
