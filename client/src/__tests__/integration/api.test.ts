/**
 * API Integration Testleri
 * 
 * Bu test dosyası frontend API servislerinin backend ile entegrasyonunu test eder
 */

import * as siteImageService from '@/services/siteImageService';
import * as siteContentService from '@/services/siteContentService';
import * as userService from '@/services/userService';
import apiClient from '@/services/api/axios';

jest.mock('@/services/api/axios');

describe('API Integration Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Site Image Service', () => {
    it('resimleri başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          success: true,
          images: [
            { _id: '1', filename: 'test1.jpg', isActive: true },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await siteImageService.getAllImages();

      expect(result.images).toHaveLength(1);
      // Parametre olmadığında public endpoint kullanılır
      expect(apiClient.get).toHaveBeenCalledWith('/site-images/public', { params: undefined });
    });
  });

  describe('Site Content Service', () => {
    it('içerikleri başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          content: {
            content: {
              title: 'Test Title',
              description: 'Test Description',
            },
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await siteContentService.getContentBySection('hero');

      expect(result.content.title).toBe('Test Title');
    });
  });

  describe('User Service', () => {
    it('kullanıcıları başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          users: [
            { _id: '1', name: 'Test User', email: 'test@example.com' },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.getAllUsers();

      expect(result.users).toHaveLength(1);
    });
  });
});

