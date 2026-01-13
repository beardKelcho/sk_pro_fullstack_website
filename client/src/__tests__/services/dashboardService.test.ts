import { getDashboardStats, getDashboardCharts } from '@/services/dashboardService';
import apiClient from '@/services/api/axios';
import { handleApiError } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/services/api/axios');
jest.mock('@/utils/apiErrorHandler');
jest.mock('@/utils/logger');

describe('dashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockStats = {
        stats: {
          equipment: { total: 10, available: 5, inUse: 3, maintenance: 2 },
          projects: { total: 5, active: 2, completed: 3 },
          tasks: { total: 15, open: 8, completed: 7 },
          clients: { total: 4, active: 3 },
        },
        upcomingProjects: [],
        upcomingMaintenances: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await getDashboardStats();

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(getDashboardStats()).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getDashboardCharts', () => {
    it('should fetch dashboard charts successfully', async () => {
      const mockCharts = {
        equipmentStatus: [],
        projectStatus: [],
        taskCompletion: [],
        monthlyActivity: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: { charts: mockCharts } });

      const result = await getDashboardCharts(30);

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/charts?period=30');
      expect(result).toEqual(mockCharts);
    });

    it('should use default days parameter if not provided', async () => {
      const mockCharts = {
        equipmentStatus: [],
        projectStatus: [],
        taskCompletion: [],
        monthlyActivity: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: { charts: mockCharts } });

      await getDashboardCharts();

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/charts?period=30');
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(getDashboardCharts(30)).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
