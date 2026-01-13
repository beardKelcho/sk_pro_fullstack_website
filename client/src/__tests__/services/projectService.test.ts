/**
 * Project Service Testleri
 */

import * as projectService from '@/services/projectService';
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Project Service Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('tüm projeleri başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          projects: [
            { _id: '1', name: 'Test Project', status: 'ACTIVE' },
          ],
          total: 1,
          page: 1,
          totalPages: 1,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await projectService.getAllProjects();

      expect(apiClient.get).toHaveBeenCalledWith('/projects', { params: undefined });
      expect(result.projects).toHaveLength(1);
    });
  });

  describe('getProjectById', () => {
    it('projeyi ID ile getirmeli', async () => {
      const mockResponse = {
        data: {
          project: { _id: '1', name: 'Test Project' },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await projectService.getProjectById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/projects/1');
      expect(result._id).toBe('1');
    });
  });

  describe('createProject', () => {
    it('yeni proje oluşturmalı', async () => {
      const mockResponse = {
        data: {
          project: { _id: '1', name: 'New Project' },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await projectService.createProject({ name: 'New Project' });

      expect(apiClient.post).toHaveBeenCalledWith('/projects', { name: 'New Project' });
      expect(result._id).toBe('1');
    });
  });

  describe('React Query Hooks', () => {
    it('useProjects hook çalışmalı', async () => {
      const mockResponse = {
        data: {
          projects: [],
          total: 0,
          page: 1,
          totalPages: 0,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => projectService.useProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.projects).toEqual([]);
    });
  });
});

