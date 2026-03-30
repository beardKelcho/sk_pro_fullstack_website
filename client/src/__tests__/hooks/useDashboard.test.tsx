import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from '@/hooks/useDashboard';
import { getDashboardCharts, getDashboardStats } from '@/services/dashboardService';
import { getAllProjects } from '@/services/projectService';
import { checkApiHealth } from '@/utils/apiHealthCheck';

jest.mock('@/services/dashboardService', () => ({
  getDashboardStats: jest.fn(),
  getDashboardCharts: jest.fn(),
}));

jest.mock('@/services/projectService', () => ({
  getAllProjects: jest.fn(),
}));

jest.mock('@/utils/apiHealthCheck', () => ({
  checkApiHealth: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockGetDashboardStats = getDashboardStats as jest.MockedFunction<typeof getDashboardStats>;
const mockGetDashboardCharts = getDashboardCharts as jest.MockedFunction<typeof getDashboardCharts>;
const mockGetAllProjects = getAllProjects as jest.MockedFunction<typeof getAllProjects>;
const mockCheckApiHealth = checkApiHealth as jest.MockedFunction<typeof checkApiHealth>;

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes core dashboard data before chart loading finishes', async () => {
    mockCheckApiHealth.mockResolvedValue(true);
    mockGetDashboardStats.mockResolvedValue({
      stats: {
        equipment: { total: 4, available: 2, inUse: 1, maintenance: 1 },
        projects: { total: 3, active: 2, completed: 1 },
        tasks: { total: 8, open: 5, completed: 3 },
        clients: { total: 2, active: 2 },
      },
      upcomingMaintenances: [],
      upcomingProjects: [],
    });
    mockGetAllProjects.mockResolvedValue({
      projects: [
        {
          _id: 'p1',
          name: 'Test Project',
          startDate: '2026-03-01T00:00:00.000Z',
          status: 'PENDING_APPROVAL',
          client: 'c1',
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    const deferredCharts = createDeferred<Awaited<ReturnType<typeof getDashboardCharts>>>();
    mockGetDashboardCharts.mockReturnValue(deferredCharts.promise);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats.projects.active).toBe(2);
    expect(result.current.recentProjects).toHaveLength(1);
    expect(result.current.chartData).toBeNull();
    expect(result.current.chartsLoading).toBe(true);

    deferredCharts.resolve({
      activityData: [],
      equipmentStatus: [],
      projectStatus: [],
      taskStatus: [],
      taskCompletionTrend: [],
      equipmentUsage: {
        available: '0',
        inUse: '0',
        maintenance: '0',
        damaged: '0',
      },
    });

    await waitFor(() => {
      expect(result.current.chartsLoading).toBe(false);
    });

    expect(result.current.chartData?.projectStatus).toEqual([]);
  });
});
