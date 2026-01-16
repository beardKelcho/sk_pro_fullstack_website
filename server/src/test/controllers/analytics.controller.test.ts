import { Request, Response } from 'express';
import { getAnalyticsDashboard } from '../../controllers/analytics.controller';
import { Client, Equipment, Maintenance, Project, Task, User } from '../../models';
import logger from '../../utils/logger';

jest.mock('../../models', () => ({
  Project: { aggregate: jest.fn(), countDocuments: jest.fn() },
  Task: { aggregate: jest.fn(), countDocuments: jest.fn() },
  Equipment: { aggregate: jest.fn() },
  Maintenance: { aggregate: jest.fn(), countDocuments: jest.fn() },
  Client: { collection: { name: 'clients' } },
  User: { collection: { name: 'users' } },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Analytics Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (Project.aggregate as jest.Mock).mockResolvedValue([]);
    (Task.aggregate as jest.Mock).mockResolvedValue([]);
    (Equipment.aggregate as jest.Mock).mockResolvedValue([]);
    (Maintenance.aggregate as jest.Mock).mockResolvedValue([]);
    (Project.countDocuments as jest.Mock).mockResolvedValue(0);
    (Task.countDocuments as jest.Mock).mockResolvedValue(0);
    (Maintenance.countDocuments as jest.Mock).mockResolvedValue(0);
  });

  it('should return 200 with success true', async () => {
    await getAnalyticsDashboard(mockRequest as Request, mockResponse as Response);
    const statusCode = (mockResponse.status as jest.Mock).mock.calls?.[0]?.[0];
    if (statusCode !== 200) {
      const logCalls = (logger.error as unknown as jest.Mock).mock.calls || [];
      const err = logCalls?.[0]?.[1];
      throw new Error(
        `Analytics controller status=${statusCode}. ` +
          `errType=${err?.name || typeof err} ` +
          `message=${err?.message || String(err)} ` +
          `stack=${err?.stack ? String(err.stack).slice(0, 500) : ''}`
      );
    }
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.projects).toBeDefined();
    expect(payload.tasks).toBeDefined();
  });
});

