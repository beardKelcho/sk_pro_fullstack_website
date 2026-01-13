import {
  getUserWidgets,
  createWidget,
  updateWidget,
  deleteWidget,
  createDefaultWidgets,
  updateWidgetsBulk,
} from '@/services/widgetService';
import apiClient from '@/services/api/axios';
import { handleApiError } from '@/utils/apiErrorHandler';
import logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/services/api/axios');
jest.mock('@/utils/apiErrorHandler');
jest.mock('@/utils/logger');

describe('widgetService', () => {
  const mockWidget = {
    _id: 'widget1',
    type: 'STAT_CARD',
    position: { x: 0, y: 0, w: 4, h: 2 },
    isVisible: true,
    order: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserWidgets', () => {
    it('should fetch user widgets successfully', async () => {
      const mockResponse = { widgets: [mockWidget] };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await getUserWidgets();

      expect(apiClient.get).toHaveBeenCalledWith('/widgets');
      expect(result).toEqual([mockWidget]);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(getUserWidgets()).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createWidget', () => {
    it('should create a widget successfully', async () => {
      const widgetData = {
        type: 'STAT_CARD' as const,
        position: { x: 0, y: 0, w: 4, h: 2 },
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { widget: mockWidget },
      });

      const result = await createWidget(widgetData);

      expect(apiClient.post).toHaveBeenCalledWith('/widgets', widgetData);
      expect(result).toEqual(mockWidget);
    });

    it('should throw error if widget creation fails', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {},
      });

      await expect(
        createWidget({
          type: 'STAT_CARD',
          position: { x: 0, y: 0, w: 4, h: 2 },
        })
      ).rejects.toThrow('Widget oluşturulamadı');
    });
  });

  describe('updateWidget', () => {
    it('should update a widget successfully', async () => {
      const updates = { isVisible: false };
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { widget: { ...mockWidget, ...updates } },
      });

      const result = await updateWidget('widget1', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/widgets/widget1', updates);
      expect(result.isVisible).toBe(false);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(updateWidget('widget1', {})).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteWidget', () => {
    it('should delete a widget successfully', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      await deleteWidget('widget1');

      expect(apiClient.delete).toHaveBeenCalledWith('/widgets/widget1');
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(deleteWidget('widget1')).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createDefaultWidgets', () => {
    it('should create default widgets successfully', async () => {
      const mockWidgets = [mockWidget];
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { widgets: mockWidgets },
      });

      const result = await createDefaultWidgets();

      expect(apiClient.post).toHaveBeenCalledWith('/widgets/defaults');
      expect(result).toEqual(mockWidgets);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.post as any).mockRejectedValue(mockError);
      (handleApiError as any).mockReturnValue(mockError);

      await expect(createDefaultWidgets()).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateWidgetsBulk', () => {
    it('should update multiple widgets successfully', async () => {
      const updates = [
        { id: 'widget1', position: { x: 0, y: 0, w: 4, h: 2 }, order: 0 },
      ];

      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      await updateWidgetsBulk(updates);

      expect(apiClient.put).toHaveBeenCalledWith('/widgets/bulk', { widgets: updates });
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);
      (handleApiError as jest.Mock).mockReturnValue(mockError);

      await expect(updateWidgetsBulk([])).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });
});
