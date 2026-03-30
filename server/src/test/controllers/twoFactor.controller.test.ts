import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import { User } from '../../models';
import { get2FAStatus, verify2FA } from '../../controllers/twoFactor.controller';

jest.mock('../../models', () => ({
  User: {
    findById: jest.fn(),
  },
  Session: {},
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

jest.mock('../../utils/auditLogger', () => ({
  logAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../utils/encryption', () => ({
  encryptField: jest.fn((value: string) => `encrypted:${value}`),
  decryptField: jest.fn((value: string) => value.replace(/^encrypted:/, '')),
}));

describe('Two Factor Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { body: {} };
    (mockRequest as Record<string, unknown>).user = { _id: 'user-1' };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('verify2FA gecici secret ile TOTP dogrulamasi yapip 2FAyi aktif eder', async () => {
    mockRequest.body = { token: '123456' };
    const save = jest.fn().mockResolvedValue(undefined);
    const mockUser = {
      twoFactorSecret: 'TEMPSECRET',
      twoFactorSecretHash: undefined,
      backupCodes: ['hashed-code'],
      is2FAEnabled: false,
      save,
    };

    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });
    jest.spyOn(speakeasy.totp, 'verify').mockReturnValue(true);

    await verify2FA(mockRequest as Request, mockResponse as Response);

    expect(speakeasy.totp.verify).toHaveBeenCalledWith(
      expect.objectContaining({
        secret: 'TEMPSECRET',
        token: '123456',
      })
    );
    expect(mockUser.is2FAEnabled).toBe(true);
    expect(mockUser.twoFactorSecretHash).toBe('encrypted:TEMPSECRET');
    expect(mockUser.twoFactorSecret).toBeUndefined();
    expect(save).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('get2FAStatus backup code varligini select false alana ragmen dogru raporlar', async () => {
    const select = jest.fn().mockResolvedValue({
      is2FAEnabled: true,
      backupCodes: ['hashed-code'],
    });

    (User.findById as jest.Mock).mockReturnValue({ select });

    await get2FAStatus(mockRequest as Request, mockResponse as Response);

    expect(select).toHaveBeenCalledWith('+backupCodes');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      is2FAEnabled: true,
      hasBackupCodes: true,
    });
  });
});
