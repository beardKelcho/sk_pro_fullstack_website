import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getMonitoringDashboard } from '../../controllers/monitoring.controller';
import {
  __resetMonitoringStoreForTests,
  recordApiMetric,
  recordDbMetric,
} from '../../utils/monitoring/monitoringStore';
import { Session } from '../../models';

jest.mock('../../models', () => ({
  Session: {
    find: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Monitoring Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    __resetMonitoringStoreForTests();
    jest.clearAllMocks();

    mockRequest = {
      query: { timeRange: '1h' },
      user: { role: 'ADMIN', permissions: [] },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('metriklerle dashboard verisini üretmeli', async () => {
    (mongoose.connection as any).readyState = 1;

    (Session.find as jest.Mock).mockResolvedValue([
      {
        userId: { toString: () => 'u1' },
        createdAt: new Date(Date.now() - 60_000).toISOString(),
        lastActivity: new Date().toISOString(),
      },
      {
        userId: { toString: () => 'u2' },
        createdAt: new Date(Date.now() - 120_000).toISOString(),
        lastActivity: new Date().toISOString(),
      },
    ]);

    recordApiMetric({
      ts: Date.now(),
      method: 'GET',
      path: '/api/projects',
      statusCode: 200,
      durationMs: 120,
    });
    recordApiMetric({
      ts: Date.now(),
      method: 'GET',
      path: '/api/projects',
      statusCode: 500,
      durationMs: 450,
    });

    recordDbMetric({
      ts: Date.now(),
      model: 'Project',
      operation: 'find',
      durationMs: 30,
    });
    recordDbMetric({
      ts: Date.now(),
      model: 'Project',
      operation: 'find',
      durationMs: 200,
    });

    await getMonitoringDashboard(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(payload.apiMetrics.totalRequests).toBe(2);
    expect(payload.errors.totalErrors).toBe(1);
    expect(payload.database.status).toBe('connected');
    expect(Array.isArray(payload.database.slowestQueries)).toBe(true);
    expect(payload.database.slowestQueries[0].query).toContain('Project.find');
  });
});

