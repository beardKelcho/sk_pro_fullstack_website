import { createAuditLog, logLoginAction, logAction } from '../../utils/auditLogger';
import AuditLog from '../../models/AuditLog';
import mongoose from 'mongoose';
import { Request } from 'express';
import logger from '../../utils/logger';

// Mock AuditLog model
const mockCreate = jest.fn();
jest.mock('../../models/AuditLog', () => ({
  __esModule: true,
  default: {
    create: mockCreate,
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('auditLogger', () => {
  const mockUserId = new mongoose.Types.ObjectId();
  const mockResourceId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
    // Her test için mock'u resetle
    mockCreate.mockResolvedValue({});
  });

  describe('createAuditLog', () => {
    it('should create an audit log with valid ObjectId strings', async () => {
      mockCreate.mockResolvedValue({});

      await createAuditLog({
        user: mockUserId.toString(),
        action: 'CREATE',
        resource: 'Project',
        resourceId: mockResourceId.toString(),
        changes: [{ field: 'name', oldValue: 'Old', newValue: 'New' }],
        metadata: { ipAddress: '127.0.0.1' },
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUserId,
          action: 'CREATE',
          resource: 'Project',
          resourceId: mockResourceId,
          changes: [{ field: 'name', oldValue: 'Old', newValue: 'New' }],
          metadata: { ipAddress: '127.0.0.1' },
        })
      );
    });

    it('should create an audit log with ObjectId objects', async () => {
      mockCreate.mockResolvedValue({});

      await createAuditLog({
        user: mockUserId.toString(),
        action: 'UPDATE',
        resource: 'Equipment',
        resourceId: mockResourceId.toString(),
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUserId,
          action: 'UPDATE',
          resource: 'Equipment',
          resourceId: mockResourceId,
          changes: [],
          metadata: {},
        })
      );
    });

    it('should handle null user for system actions', async () => {
      mockCreate.mockResolvedValue({});

      await createAuditLog({
        user: null,
        action: 'CREATE',
        resource: 'System',
        resourceId: mockResourceId.toString(),
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          user: null,
          action: 'CREATE',
          resource: 'System',
          resourceId: mockResourceId,
        })
      );
    });

    it('should handle "system" string as null user', async () => {
      mockCreate.mockResolvedValue({});

      await createAuditLog({
        user: 'system',
        action: 'CREATE',
        resource: 'System',
        resourceId: mockResourceId.toString(),
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          user: null,
          action: 'CREATE',
          resource: 'System',
          resourceId: mockResourceId,
        })
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should skip audit log creation for invalid resourceId', async () => {
      mockCreate.mockClear();

      await createAuditLog({
        user: mockUserId.toString(),
        action: 'CREATE',
        resource: 'Project',
        resourceId: 'invalid-id',
      });

      expect(mockCreate).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should skip audit log creation for invalid user ID', async () => {
      mockCreate.mockResolvedValue({});

      await createAuditLog({
        user: 'invalid-user-id',
        action: 'CREATE',
        resource: 'Project',
        resourceId: mockResourceId.toString(),
      });

      // Invalid user ID için null user ile audit log oluşturulmalı
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          user: null,
          action: 'CREATE',
          resource: 'Project',
          resourceId: mockResourceId,
          changes: [],
          metadata: {},
        })
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      await createAuditLog({
        user: mockUserId.toString(),
        action: 'CREATE',
        resource: 'Project',
        resourceId: mockResourceId.toString(),
      });

      expect(logger.error).toHaveBeenCalledWith('Audit log oluşturma hatası:', expect.any(Error));
    });
  });

  describe('logLoginAction', () => {
    const mockReq = {
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      method: 'POST',
      originalUrl: '/api/auth/login',
      url: '/api/auth/login',
    } as unknown as Request;

    it('should create a login audit log', async () => {
      mockCreate.mockResolvedValue({});

      await logLoginAction(mockUserId.toString(), mockReq);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUserId,
          action: 'LOGIN',
          resource: 'User',
          resourceId: mockUserId,
          changes: [],
          metadata: expect.objectContaining({
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            method: 'POST',
            endpoint: '/api/auth/login',
          }),
        })
      );
    });

    it('should skip audit log for invalid user ID', async () => {
      mockCreate.mockClear();

      await logLoginAction('invalid-id', mockReq);

      expect(mockCreate).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      await logLoginAction(mockUserId.toString(), mockReq);

      expect(logger.error).toHaveBeenCalledWith('Login audit log oluşturma hatası:', expect.any(Error));
    });
  });

  describe('logAction', () => {
    const mockReq = {
      user: { id: mockUserId.toString() },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      method: 'PUT',
      originalUrl: '/api/projects/123',
      url: '/api/projects/123',
    } as unknown as Request;

    it('should create an audit log from request', async () => {
      mockCreate.mockResolvedValue({});

      await logAction(mockReq, 'UPDATE', 'Project', mockResourceId.toString(), [
        { field: 'name', oldValue: 'Old', newValue: 'New' },
      ]);

      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.user?.toString()).toBe(mockUserId.toString());
      expect(callArgs.action).toBe('UPDATE');
      expect(callArgs.resource).toBe('Project');
      expect(callArgs.resourceId?.toString()).toBe(mockResourceId.toString());
      expect(callArgs.changes).toEqual([{ field: 'name', oldValue: 'Old', newValue: 'New' }]);
      expect(callArgs.metadata.ipAddress).toBe('127.0.0.1');
      expect(callArgs.metadata.userAgent).toBe('Mozilla/5.0');
      expect(callArgs.metadata.method).toBe('PUT');
      expect(callArgs.metadata.endpoint).toBe('/api/projects/123');
    });

    it('should handle request without user', async () => {
      const reqWithoutUser = {
        ...mockReq,
        user: undefined,
      } as unknown as Request;
      mockCreate.mockResolvedValue({});

      await logAction(reqWithoutUser, 'VIEW', 'Project', mockResourceId.toString());

      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.user).toBeNull();
      expect(callArgs.action).toBe('VIEW');
      expect(callArgs.resource).toBe('Project');
      expect(callArgs.resourceId?.toString()).toBe(mockResourceId.toString());
      expect(callArgs.changes).toEqual([]);
      expect(callArgs.metadata.method).toBe('PUT');
    });

    it('should handle errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      await logAction(mockReq, 'DELETE', 'Project', mockResourceId.toString());

      expect(logger.error).toHaveBeenCalledWith('Audit log oluşturma hatası:', expect.any(Error));
    });
  });
});
