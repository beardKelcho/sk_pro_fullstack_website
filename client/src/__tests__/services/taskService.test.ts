/**
 * Task Service Tests
 */

import { getAllTasks, getTaskById, createTask, updateTask, deleteTask, useTasks, useTaskById } from '@/services/taskService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Task Service', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO' as const,
    priority: 'MEDIUM' as const,
    assignedTo: 'user1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should fetch all tasks', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockTask],
          total: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getAllTasks();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks', expect.any(Object));
    });

    it('should fetch tasks with filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockTask],
          total: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getAllTasks({
        status: 'TODO',
        priority: 'HIGH',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          params: expect.objectContaining({
            status: 'TODO',
            priority: 'HIGH',
            page: 1,
            limit: 10,
          }),
        })
      );
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(getAllTasks()).rejects.toThrow();
    });
  });

  describe('getTaskById', () => {
    it('should fetch task by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockTask,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getTaskById('1');

      expect(result).toEqual(mockTask);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/1');
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Not found'));

      await expect(getTaskById('1')).rejects.toThrow();
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        assignedTo: 'user1',
      };

      const mockResponse = {
        data: {
          success: true,
          data: { ...newTask, _id: '2' },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await createTask(newTask);

      expect(result).toEqual(mockResponse.data.data);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks', newTask);
    });

    it('should handle errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Validation error'));

      await expect(createTask({} as any)).rejects.toThrow();
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updatedTask = {
        ...mockTask,
        title: 'Updated Task',
      };

      const mockResponse = {
        data: {
          success: true,
          data: updatedTask,
        },
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await updateTask('1', { title: 'Updated Task' });

      expect(result).toEqual(updatedTask);
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/tasks/1', { title: 'Updated Task' });
    });

    it('should handle errors', async () => {
      mockedAxios.put.mockRejectedValue(new Error('Not found'));

      await expect(updateTask('1', {})).rejects.toThrow();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Task deleted',
        },
      };

      mockedAxios.delete.mockResolvedValue(mockResponse);

      await deleteTask('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/1');
    });

    it('should handle errors', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('Not found'));

      await expect(deleteTask('1')).rejects.toThrow();
    });
  });
});

