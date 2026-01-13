/**
 * User Service Testleri
 */

import * as userService from '@/services/userService';
import apiClient from '@/services/api/axios';

jest.mock('@/services/api/axios');

describe('User Service Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('tüm kullanıcıları başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          users: [
            { _id: '1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' },
            { _id: '2', name: 'Test User 2', email: 'test2@example.com', role: 'TEKNISYEN' },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.getAllUsers();

      expect(apiClient.get).toHaveBeenCalledWith('/users');
      expect(result.users).toHaveLength(2);
    });

    it('hata durumunda exception fırlatmalı', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(userService.getAllUsers()).rejects.toThrow('Network error');
    });
  });

  describe('getUserById', () => {
    it('kullanıcıyı ID ile getirmeli', async () => {
      const mockResponse = {
        data: {
          user: { _id: '1', name: 'Test User', email: 'test@example.com' },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.getUserById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/users/1');
      expect(result._id).toBe('1');
    });
  });

  describe('createUser', () => {
    it('yeni kullanıcı oluşturmalı', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!',
        role: 'TEKNISYEN',
      };

      const mockResponse = {
        data: {
          user: { _id: '1', ...mockUser },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.createUser(mockUser);

      expect(apiClient.post).toHaveBeenCalledWith('/users', mockUser);
      expect(result._id).toBe('1');
    });
  });

  describe('updateUser', () => {
    it('kullanıcıyı güncellemeli', async () => {
      const mockResponse = {
        data: {
          user: { _id: '1', name: 'Updated User' },
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.updateUser('1', { name: 'Updated User' });

      expect(apiClient.put).toHaveBeenCalledWith('/users/1', { name: 'Updated User' });
      expect(result.name).toBe('Updated User');
    });
  });

  describe('deleteUser', () => {
    it('kullanıcıyı silmeli', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      await userService.deleteUser('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/users/1');
    });
  });
});

