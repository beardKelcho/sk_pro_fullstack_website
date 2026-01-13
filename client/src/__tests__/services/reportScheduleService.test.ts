import {
  getReportSchedules,
  getReportScheduleById,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
} from '@/services/reportScheduleService';
import apiClient from '@/services/api/axios';
import { handleApiError } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/services/api/axios');
jest.mock('@/utils/apiErrorHandler');
jest.mock('@/utils/logger');

describe('reportScheduleService', () => {
  const mockSchedule = {
    _id: 'schedule1',
    name: 'Weekly Report',
    reportType: 'DASHBOARD_SUMMARY',
    frequency: 'WEEKLY',
    recipients: ['user1@example.com'],
    enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReportSchedules', () => {
    it('should fetch all report schedules successfully', async () => {
      const mockResponse = {
        success: true,
        schedules: [mockSchedule],
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await getReportSchedules();

      expect(apiClient.get).toHaveBeenCalledWith('/report-schedules');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(getReportSchedules()).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getReportScheduleById', () => {
    it('should fetch a report schedule by id successfully', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { success: true, schedule: mockSchedule },
      });

      const result = await getReportScheduleById('schedule1');

      expect(apiClient.get).toHaveBeenCalledWith('/report-schedules/schedule1');
      expect(result.schedule).toEqual(mockSchedule);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(getReportScheduleById('schedule1')).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createReportSchedule', () => {
    it('should create a report schedule successfully', async () => {
      const scheduleData = {
        name: 'Weekly Report',
        reportType: 'DASHBOARD_SUMMARY',
        frequency: 'WEEKLY',
        recipients: ['user1@example.com'],
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { success: true, schedule: mockSchedule },
      });

      const result = await createReportSchedule(scheduleData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/report-schedules',
        scheduleData
      );
      expect(result.schedule).toEqual(mockSchedule);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(
        createReportSchedule({
          name: 'Test',
          reportType: 'DASHBOARD_SUMMARY',
          frequency: 'WEEKLY',
          recipients: [],
        })
      ).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateReportSchedule', () => {
    it('should update a report schedule successfully', async () => {
      const updates = { enabled: false };
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { success: true, schedule: { ...mockSchedule, ...updates } },
      });

      const result = await updateReportSchedule('schedule1', updates);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/report-schedules/schedule1',
        updates
      );
      expect(result.schedule.enabled).toBe(false);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(updateReportSchedule('schedule1', {})).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteReportSchedule', () => {
    it('should delete a report schedule successfully', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      await deleteReportSchedule('schedule1');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/report-schedules/schedule1'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.delete as any).mockRejectedValue(mockError);
      (handleApiError as any).mockReturnValue(mockError);

      await expect(deleteReportSchedule('schedule1')).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });
});
