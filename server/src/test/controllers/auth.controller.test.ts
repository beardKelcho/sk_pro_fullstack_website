/**
 * Authentication Controller Testleri
 * 
 * Bu test dosyası authentication controller'ının tüm endpoint'lerini test eder
 */

import { Request, Response } from 'express';
import * as authController from '../../controllers/auth.controller';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Authentication Controller Testleri', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      cookies: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('yeni kullanıcı başarıyla kaydedilmeli', async () => {
      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!',
        role: 'TEKNISYEN',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (User.create as jest.Mock).mockResolvedValue({
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'TEKNISYEN',
      });

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('mevcut email ile kayıt yapılamamalı', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('geçerli credentials ile giriş yapılmalı', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'ADMIN',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('yanlış şifre ile giriş yapılamamalı', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});

