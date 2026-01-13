/**
 * Maintenance Service Tests
 */

import { getAllMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance, useMaintenance, useMaintenanceById } from '@/services/maintenanceService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Maintenance Service', () => {
  const mockMaintenance = {
    _id: '1',
    equipment: 'equipment1',
    type: 'ROUTINE' as const,
    description: 'Test Maintenance',
    scheduledDate: '2024-01-15',
    status: 'SCHEDULED' as const,
    assignedTo: 'user1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMaintenance', () => {
    it('should fetch all maintenance records', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockMaintenance],
          total: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getAllMaintenance();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/maintenance', expect.any(Object));
    });

    it('should fetch maintenance with filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockMaintenance],
          total: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getAllMaintenance({
        status: 'SCHEDULED',
        type: 'ROUTINE',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/maintenance',
        expect.objectContaining({
          params: expect.objectContaining({
            status: 'SCHEDULED',
            type: 'ROUTINE',
            page: 1,
            limit: 10,
          }),
        })
      );
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(getAllMaintenance()).rejects.toThrow();
    });
  });

  describe('getMaintenanceById', () => {
    it('should fetch maintenance by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockMaintenance,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getMaintenanceById('1');

      expect(result).toEqual(mockMaintenance);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/maintenance/1');
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Not found'));

      await expect(getMaintenanceById('1')).rejects.toThrow();
    });
  });

  describe('createMaintenance', () => {
    it('should create a new maintenance record', async () => {
      const newMaintenance = {
        equipment: 'equipment1',
        type: 'ROUTINE' as const,
        description: 'New Maintenance',
        scheduledDate: '2024-01-20',
        status: 'SCHEDULED' as const,
        assignedTo: 'user1',
      };

      const mockResponse = {
        data: {
          success: true,
          data: { ...newMaintenance, _id: '2' },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await createMaintenance(newMaintenance);

      expect(result).toEqual(mockResponse.data.data);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/maintenance', newMaintenance);
    });

    it('should handle errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Validation error'));

      await expect(createMaintenance({} as any)).rejects.toThrow();
    });
  });

  describe('updateMaintenance', () => {
    it('should update a maintenance record', async () => {
      const updatedMaintenance = {
        ...mockMaintenance,
        status: 'COMPLETED' as const,
      };

      const mockResponse = {
        data: {
          success: true,
          data: updatedMaintenance,
        },
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await updateMaintenance('1', { status: 'COMPLETED' });

      expect(result).toEqual(updatedMaintenance);
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/maintenance/1', { status: 'COMPLETED' });
    });

    it('should handle errors', async () => {
      mockedAxios.put.mockRejectedValue(new Error('Not found'));

      await expect(updateMaintenance('1', {})).rejects.toThrow();
    });
  });

  describe('deleteMaintenance', () => {
    it('should delete a maintenance record', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Maintenance deleted',
        },
      };

      mockedAxios.delete.mockResolvedValue(mockResponse);

      await deleteMaintenance('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/maintenance/1');
    });

    it('should handle errors', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('Not found'));

      await expect(deleteMaintenance('1')).rejects.toThrow();
    });
  });
});

