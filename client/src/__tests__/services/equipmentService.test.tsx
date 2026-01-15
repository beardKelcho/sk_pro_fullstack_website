/**
 * Equipment Service Testleri
 */

import * as equipmentService from '@/services/equipmentService';
import apiClient from '@/services/api/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

jest.mock('@/services/api/axios');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientProviderWrapper';
  return Wrapper;
};

describe('Equipment Service Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEquipment', () => {
    it('tüm ekipmanları başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          equipment: [
            { _id: '1', name: 'Test Equipment', type: 'VideoSwitcher', status: 'AVAILABLE' },
          ],
          total: 1,
          page: 1,
          totalPages: 1,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await equipmentService.getAllEquipment();

      expect(apiClient.get).toHaveBeenCalledWith('/equipment', { params: undefined });
      expect(result.equipment).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filtrelerle ekipmanları getirmeli', async () => {
      const mockResponse = {
        data: {
          equipment: [],
          total: 0,
          page: 1,
          totalPages: 0,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await equipmentService.getAllEquipment({ type: 'VideoSwitcher', status: 'AVAILABLE' });

      expect(apiClient.get).toHaveBeenCalledWith('/equipment', {
        params: { type: 'VideoSwitcher', status: 'AVAILABLE' },
      });
    });
  });

  describe('getEquipmentById', () => {
    it('ekipmanı ID ile getirmeli', async () => {
      const mockResponse = {
        data: {
          equipment: { _id: '1', name: 'Test Equipment' },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await equipmentService.getEquipmentById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/equipment/1');
      expect(result._id).toBe('1');
    });
  });

  describe('createEquipment', () => {
    it('yeni ekipman oluşturmalı', async () => {
      const mockResponse = {
        data: {
          equipment: { _id: '1', name: 'New Equipment', type: 'VideoSwitcher' },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await equipmentService.createEquipment({
        name: 'New Equipment',
        type: 'VideoSwitcher',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/equipment', {
        name: 'New Equipment',
        type: 'VideoSwitcher',
      });
      expect(result._id).toBe('1');
    });
  });

  describe('updateEquipment', () => {
    it('ekipmanı güncellemeli', async () => {
      const mockResponse = {
        data: {
          equipment: { _id: '1', name: 'Updated Equipment' },
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await equipmentService.updateEquipment('1', { name: 'Updated Equipment' });

      expect(apiClient.put).toHaveBeenCalledWith('/equipment/1', { name: 'Updated Equipment' });
      expect(result.name).toBe('Updated Equipment');
    });
  });

  describe('deleteEquipment', () => {
    it('ekipmanı silmeli', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await equipmentService.deleteEquipment('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/equipment/1');
    });
  });

  describe('React Query Hooks', () => {
    it('useEquipment hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          equipment: [],
          total: 0,
          page: 1,
          totalPages: 0,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => equipmentService.useEquipment(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.equipment).toEqual([]);
    });

    it('useEquipmentById hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          equipment: { _id: '1', name: 'Test Equipment' },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => equipmentService.useEquipmentById('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('1');
    });

    it('useCreateEquipment hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          equipment: { _id: '1', name: 'New Equipment' },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => equipmentService.useCreateEquipment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'New Equipment', type: 'VideoSwitcher' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});

