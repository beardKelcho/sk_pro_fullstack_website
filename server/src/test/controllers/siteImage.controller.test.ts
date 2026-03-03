/**
 * Site Image Controller Testleri
 * 
 * Bu test dosyası siteImage controller'ının tüm endpoint'lerini test eder
 */

import { Request, Response } from 'express';
import * as siteImageController from '../../controllers/siteImage.controller';
import siteService from '../../services/site.service';
import { AppError } from '../../types/common';
import mongoose from 'mongoose';
// Removed unused fs

// Mock dependencies
jest.mock('../../services/site.service');
jest.mock('../../services/upload.service');

jest.mock('fs');
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Site Image Controller Testleri', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };
    (mockRequest as Record<string, unknown>).user = { _id: new mongoose.Types.ObjectId() };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendFile: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllImages', () => {
    it('tüm resimleri başarıyla getirmeli', async () => {
      const mockImages = [
        { _id: '1', filename: 'test1.jpg', isActive: true },
        { _id: '2', filename: 'test2.jpg', isActive: true },
      ];

      (siteService.listImages as jest.Mock).mockResolvedValue(mockImages);

      await siteImageController.getAllImages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        images: mockImages,
      });
    });

    it('filtrelerle resimleri getirmeli', async () => {
      mockRequest.query = { category: 'project', isActive: 'true' };

      const mockImages = [{ _id: '1', filename: 'test1.jpg', category: 'project' }];

      (siteService.listImages as jest.Mock).mockResolvedValue(mockImages);

      await siteImageController.getAllImages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(siteService.listImages).toHaveBeenCalledWith('project', true);
    });
  });

  describe('getImageById', () => {
    it('geçerli ID ile resmi getirmeli', async () => {
      const mockImage = { _id: '123', filename: 'test.jpg' };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (siteService.getImageById as jest.Mock).mockResolvedValue(mockImage);

      await siteImageController.getImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        image: mockImage,
      });
    });

    it('bulunamayan resim için hata dönmeli (AppError)', async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      const err = new AppError('Resim bulunamadı', 404);
      (siteService.getImageById as jest.Mock).mockRejectedValue(err);

      await siteImageController.getImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('serveImageById', () => {
    it('resmi URL ile redirect etmeli', async () => {
      const mockImage = {
        _id: '123',
        filename: 'test.jpg',
        url: 'https://cloudinary.com/test.jpg'
      };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (siteService.getImageById as jest.Mock).mockResolvedValue(mockImage);

      await siteImageController.serveImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('https://cloudinary.com/test.jpg');
    });

    it('resim URL bulunamazsa 404 göndermeli', async () => {
      const mockImage = {
        _id: '123',
        filename: 'test.jpg',
      };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (siteService.getImageById as jest.Mock).mockResolvedValue(mockImage);

      await siteImageController.serveImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('Resim URL bulunamadı');
    });
  });

  describe('deleteImage', () => {
    it('resmi ve dosyayı başarıyla silmeli', async () => {
      const mockImage = {
        _id: '507f1f77bcf86cd799439011',
        filename: 'test.jpg',
        path: 'uploads/site-images/test.jpg',
        category: 'project',
      };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (siteService.getImageById as jest.Mock).mockResolvedValue(mockImage);
      (siteService.deleteImage as jest.Mock).mockResolvedValue(undefined);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const uploadService = require('../../services/upload.service').default;

      await siteImageController.deleteImage(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(uploadService.deleteFile).toHaveBeenCalledWith('test.jpg', 'project');
      expect(siteService.deleteImage).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteMultipleImages', () => {
    it('birden fazla resmi başarıyla silmeli', async () => {
      const mockImages = [
        { _id: '507f1f77bcf86cd799439011', filename: 'test1.jpg', category: 'project' },
        { _id: '507f1f77bcf86cd799439012', filename: 'test2.jpg', category: 'hero' },
      ];
      mockRequest.body = { ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] };

      (siteService.getImageById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(mockImages.find(i => i._id === id))
      );
      (siteService.deleteMultipleImages as jest.Mock).mockResolvedValue(undefined);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const uploadService = require('../../services/upload.service').default;

      await siteImageController.deleteMultipleImages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(uploadService.deleteFile).toHaveBeenCalledWith('test1.jpg', 'project');
      expect(uploadService.deleteFile).toHaveBeenCalledWith('test2.jpg', 'hero');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Silindi',
        })
      );
    });
  });
});
