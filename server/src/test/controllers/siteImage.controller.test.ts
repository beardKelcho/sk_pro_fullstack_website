/**
 * Site Image Controller Testleri
 * 
 * Bu test dosyası siteImage controller'ının tüm endpoint'lerini test eder
 */

import { Request, Response } from 'express';
import * as siteImageController from '../../controllers/siteImage.controller';
import SiteImage from '../../models/SiteImage';
import mongoose from 'mongoose';
import fs from 'fs';

// Mock dependencies
jest.mock('../../models/SiteImage');
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
      user: { _id: new mongoose.Types.ObjectId() },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendFile: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllImages', () => {
    it('tüm resimleri başarıyla getirmeli', async () => {
      const mockImages = [
        { _id: '1', filename: 'test1.jpg', isActive: true },
        { _id: '2', filename: 'test2.jpg', isActive: true },
      ];

      (SiteImage.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockImages),
      });

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

      (SiteImage.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockImages),
      });

      await siteImageController.getAllImages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(SiteImage.find).toHaveBeenCalledWith({
        category: 'project',
        isActive: true,
      });
    });
  });

  describe('getImageById', () => {
    it('geçerli ID ile resmi getirmeli', async () => {
      const mockImage = { _id: '123', filename: 'test.jpg' };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (SiteImage.findById as jest.Mock).mockResolvedValue(mockImage);

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

    it('geçersiz ID ile hata vermeli', async () => {
      mockRequest.params = { id: 'invalid' };

      await siteImageController.getImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('bulunamayan resim için 404 vermeli', async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      (SiteImage.findById as jest.Mock).mockResolvedValue(null);

      await siteImageController.getImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('serveImageById', () => {
    it('resmi başarıyla serve etmeli', async () => {
      const mockImage = {
        _id: '123',
        filename: 'test.jpg',
        path: 'uploads/site-images/test.jpg',
      };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (SiteImage.findById as jest.Mock).mockResolvedValue(mockImage);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await siteImageController.serveImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(mockResponse.sendFile).toHaveBeenCalled();
    });

    it('resim dosyası bulunamazsa 404 vermeli', async () => {
      const mockImage = {
        _id: '123',
        filename: 'test.jpg',
        path: 'uploads/site-images/test.jpg',
      };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (SiteImage.findById as jest.Mock).mockResolvedValue(mockImage);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await siteImageController.serveImageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteImage', () => {
    it('resmi ve dosyayı başarıyla silmeli', async () => {
      const mockImage = {
        _id: '123',
        filename: 'test.jpg',
        path: 'uploads/site-images/test.jpg',
        category: 'project',
        deleteOne: jest.fn().mockResolvedValue(undefined),
      };
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      (SiteImage.findById as jest.Mock).mockResolvedValue(mockImage);
      // İlk path'te dosya bulunmalı
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path.includes('general') || path.includes('test.jpg');
      });
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      await siteImageController.deleteImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Dosya silme işlemi çağrılmalı (en az bir kez)
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockImage.deleteOne).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteMultipleImages', () => {
    it('birden fazla resmi başarıyla silmeli', async () => {
      const mockImages = [
        { _id: '507f1f77bcf86cd799439011', filename: 'test1.jpg', path: 'uploads/site-images/test1.jpg', category: 'project' },
        { _id: '507f1f77bcf86cd799439012', filename: 'test2.jpg', path: 'uploads/site-images/test2.jpg', category: 'project' },
      ];
      mockRequest.body = { ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] };

      (SiteImage.find as jest.Mock).mockResolvedValue(mockImages);
      (SiteImage.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      await siteImageController.deleteMultipleImages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          deletedCount: 2,
        })
      );
    });
  });
});

