import { Request, Response } from 'express';
import authController from '../../controllers/auth.controller';
import authService from '../../services/auth.service';
import { logLoginAction } from '../../utils/auditLogger';
import { isMobileClient } from '../../utils/authTokens';

jest.mock('../../services/auth.service');
jest.mock('../../utils/auditLogger', () => ({
  logLoginAction: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../utils/authTokens', () => ({
  isMobileClient: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('AuthController', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (isMobileClient as jest.Mock).mockReturnValue(false);
  });

  it('should return 2FA challenge payload when login requires 2FA', async () => {
    const req = {
      body: { email: 'admin@example.com', password: 'secret' },
      headers: { 'x-request-id': 'req-1', 'user-agent': 'jest' },
      ip: '127.0.0.1',
    } as unknown as Request;
    const res = mockResponse();

    (authService.login as jest.Mock).mockResolvedValue({
      requires2FA: true,
      twoFAChallengeToken: 'challenge-token',
    });

    await authController.login(req, res);

    expect(authService.login).toHaveBeenCalledWith('admin@example.com', 'secret', '127.0.0.1', 'jest');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      requires2FA: true,
      message: '2FA doğrulaması gerekiyor',
      challengeToken: 'challenge-token',
    });
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('should set auth cookies and return sanitized user payload on successful web login', async () => {
    const req = {
      body: { email: 'admin@example.com', password: 'secret' },
      headers: { 'x-request-id': 'req-2', 'user-agent': 'jest' },
      ip: '127.0.0.1',
    } as unknown as Request;
    const res = mockResponse();
    const userId = 'user-1';

    (authService.login as jest.Mock).mockResolvedValue({
      requires2FA: false,
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      user: {
        _id: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    await authController.login(req, res);
    await new Promise((resolve) => setImmediate(resolve));

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: {
        id: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });
    expect(logLoginAction).toHaveBeenCalledWith(userId, req);
  });

  it('should reject refresh requests without a refresh token', async () => {
    const req = {
      cookies: {},
      body: {},
    } as unknown as Request;
    const res = mockResponse();

    await authController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Yenileme token\'ı bulunamadı',
    });
  });
});
