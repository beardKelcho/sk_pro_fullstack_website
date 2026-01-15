/**
 * Authentication Controller Testleri
 * 
 * Bu test dosyası authentication controller'ının tüm endpoint'lerini test eder
 */

import { Request, Response } from 'express';
import * as authController from '../../controllers/auth.controller';
import { User } from '../../models';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../../utils/auditLogger', () => ({
  logAction: jest.fn().mockResolvedValue(undefined),
}));
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

  describe('login', () => {
    it('geçerli credentials ile giriş yapılmalı', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        role: 'ADMIN',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('yanlış şifre ile giriş yapılamamalı', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});

