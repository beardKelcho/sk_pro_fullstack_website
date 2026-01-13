/**
 * Site Image Service Testleri
 * 
 * Bu test dosyası siteImageService'in tüm fonksiyonlarını test eder
 */

import * as siteImageService from '@/services/siteImageService';
import apiClient from '@/services/api/axios';

jest.mock('@/services/api/axios');

describe('Site Image Service Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllImages', () => {
    it('tüm resimleri başarıyla getirmeli', async () => {
      const mockResponse = {
        data: {
          success: true,
          images: [
            { _id: '1', filename: 'test1.jpg', isActive: true },
            { _id: '2', filename: 'test2.jpg', isActive: true },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await siteImageService.getAllImages();

      // Parametre olmadığında public endpoint kullanılır
      expect(apiClient.get).toHaveBeenCalledWith('/site-images/public', { params: undefined });
      expect(result.images).toHaveLength(2);
    });

    it('filtrelerle resimleri getirmeli', async () => {
      const mockResponse = {
        data: {
          success: true,
          images: [{ _id: '1', filename: 'test1.jpg', category: 'project' }],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await siteImageService.getAllImages({ category: 'project', isActive: true });

      expect(apiClient.get).toHaveBeenCalledWith('/site-images', {
        params: { category: 'project', isActive: true },
      });
    });

    it('hata durumunda exception fırlatmalı', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(siteImageService.getAllImages()).rejects.toThrow('Network error');
    });
  });

  describe('deleteImage', () => {
    it('resmi başarıyla silmeli', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      await siteImageService.deleteImage('image-id');

      expect(apiClient.delete).toHaveBeenCalledWith('/site-images/image-id');
    });
  });

  describe('deleteMultipleImages', () => {
    it('birden fazla resmi başarıyla silmeli', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true, deletedCount: 2 },
      });

      const result = await siteImageService.deleteMultipleImages(['id1', 'id2']);

      expect(apiClient.delete).toHaveBeenCalledWith('/site-images/bulk/delete', {
        data: { ids: ['id1', 'id2'] },
      });
      expect(result.deletedCount).toBe(2);
    });
  });
});

