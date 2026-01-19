/**
 * Authentication Controller Testleri
 * 
 * Bu test dosyası authentication controller'ının tüm endpoint'lerini test eder
 */

import { Request, Response } from 'express';
import * as authController from '../../controllers/auth.controller';
import { User, Session } from '../../models';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

// Mock authTokens - mock fonksiyonları önce tanımla
const mockGenerateTokenPair = jest.fn();
const mockCreateTokenHash = jest.fn();
const mockIsMobileClient = jest.fn();

jest.mock('../../utils/authTokens', () => ({
  generateTokenPair: (...args: any[]) => mockGenerateTokenPair(...args),
  createTokenHash: (...args: any[]) => mockCreateTokenHash(...args),
  isMobileClient: (...args: any[]) => mockIsMobileClient(...args),
  JWT_SECRET: 'test-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
}));

jest.mock('../../models', () => {
  const actualModels = jest.requireActual('../../models');
  return {
    ...actualModels,
    User: {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    },
    Session: {
      create: jest.fn(),
      findOne: jest.fn(),
      updateMany: jest.fn(),
    },
  };
});
jest.mock('../../utils/auditLogger', () => ({
  logAction: jest.fn().mockResolvedValue(undefined),
  logLoginAction: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe('Authentication Controller Testleri', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      cookies: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      headersSent: false,
    };
    jest.clearAllMocks();
    mockGenerateTokenPair.mockClear();
    mockCreateTokenHash.mockClear();
    mockIsMobileClient.mockClear();
    (User.findOne as jest.Mock).mockClear();
    (Session.create as jest.Mock).mockClear();
    (Session.findOne as jest.Mock).mockClear();
    (Session.updateMany as jest.Mock).mockClear();
    
    // Default mock değerlerini ayarla
    mockGenerateTokenPair.mockReturnValue({
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    });
    mockCreateTokenHash.mockReturnValue('hashedToken');
    mockIsMobileClient.mockReturnValue(false);
  });

  describe('login', () => {
    it('geçerli credentials ile giriş yapılmalı', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Session.create as jest.Mock).mockResolvedValue({});

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          accessToken: 'mockAccessToken',
          user: expect.objectContaining({
            id: '123',
            email: 'test@example.com',
            role: 'ADMIN',
          }),
        })
      );
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
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('kullanıcı bulunamadığında 401 döndürmeli', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Geçersiz email ya da şifre',
        })
      );
    });

    it('aktif olmayan kullanıcı giriş yapamamalı', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('telefon numarası ile giriş yapılabilmeli', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        phone: '+905551234567',
        name: 'Test User',
        role: 'ADMIN',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = {
        email: '+905551234567',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Session.create as jest.Mock).mockResolvedValue({});

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ phone: expect.any(String) }),
          ]),
        })
      );
    });

    it('2FA aktif kullanıcı için 2FA token döndürmeli', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        isActive: true,
        is2FAEnabled: true, // Controller'da is2FAEnabled kullanılıyor
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          requires2FA: true,
        })
      );
    });

    it('database hatası durumunda 500 döndürmeli', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('mobile client için refreshToken döndürmeli', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Test123!',
      };
      mockRequest.headers = {
        'x-client': 'mobile',
      } as any;

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Session.create as jest.Mock).mockResolvedValue({});
      mockIsMobileClient.mockReturnValue(true);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken',
        })
      );
    });
  });

  describe('refreshToken', () => {
    it('geçerli refresh token ile yeni access token döndürmeli', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        role: 'ADMIN',
        isActive: true,
      };

      const mockSession = {
        userId: '123',
        token: 'hashedToken',
        refreshToken: 'hashedRefreshToken',
        isActive: true,
      };

      mockRequest.cookies = {
        refreshToken: 'validRefreshToken',
      };

      (jwt.verify as jest.Mock).mockReturnValue({ id: '123' });
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Session.updateMany as jest.Mock).mockResolvedValue({});
      (Session.create as jest.Mock).mockResolvedValue({});

      mockGenerateTokenPair.mockReturnValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          accessToken: 'newAccessToken',
        })
      );
    });

    it('geçersiz refresh token ile 401 döndürmeli', async () => {
      mockRequest.cookies = {
        refreshToken: 'invalidToken',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('refresh token yoksa 401 döndürmeli', async () => {
      mockRequest.cookies = {};

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('logout başarılı olmalı', async () => {
      const mockSession = {
        userId: '123',
        token: 'hashedToken',
        isActive: true,
      };

      mockRequest.cookies = {
        refreshToken: 'validRefreshToken',
      };

      (Session.updateMany as jest.Mock).mockResolvedValue({});

      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Başarıyla çıkış yapıldı', // Controller'da bu mesaj kullanılıyor
      });
    });
  });
});
