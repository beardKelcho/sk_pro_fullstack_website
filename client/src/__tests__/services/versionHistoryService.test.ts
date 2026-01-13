import {
  getResourceVersionHistory,
  getVersionById,
  rollbackToVersion,
} from '@/services/versionHistoryService';
import apiClient from '@/services/api/axios';
import { handleApiError } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/services/api/axios');
jest.mock('@/utils/apiErrorHandler');
jest.mock('@/utils/logger');

describe('versionHistoryService', () => {
  const mockVersion = {
    _id: 'version1',
    resourceType: 'Equipment',
    resourceId: 'equipment1',
    version: 1,
    changes: { name: 'Old Name' },
    createdBy: 'user1',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getResourceVersionHistory', () => {
    it('should fetch version history successfully', async () => {
      const mockResponse = {
        versions: [mockVersion],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await getResourceVersionHistory('Equipment', 'equipment1');

      expect(apiClient.get).toHaveBeenCalledWith('/version-history/Equipment/equipment1', {
        params: { page: 1, limit: 50 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(
        getResourceVersionHistory('Equipment', 'equipment1')
      ).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getVersionById', () => {
    it('should fetch a version by id successfully', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { success: true, version: mockVersion },
      });

      const result = await getVersionById('version1');

      expect(apiClient.get).toHaveBeenCalledWith('/version-history/version/version1');
      expect(result.version).toEqual(mockVersion);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(getVersionById('version1')).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('rollbackToVersion', () => {
    it('should rollback to a version successfully', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      await rollbackToVersion('Equipment', 'equipment1', 1);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/version-history/Equipment/equipment1/rollback/1'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(rollbackToVersion('Equipment', 'equipment1', 1)).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });
});
