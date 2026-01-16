import { Request, Response } from 'express';
import { getCalendarEvents } from '../../controllers/calendar.controller';
import { Maintenance, Project } from '../../models';

jest.mock('../../models', () => ({
  Project: {
    find: jest.fn(),
  },
  Maintenance: {
    find: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Calendar Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      query: {},
      user: { role: 'ADMIN', permissions: [] },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('startDate/endDate yoksa 400 dönmeli', async () => {
    await getCalendarEvents(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('events listesi dönmeli', async () => {
    mockRequest.query = {
      startDate: new Date('2026-01-01').toISOString(),
      endDate: new Date('2026-01-31').toISOString(),
      status: 'ACTIVE,PENDING_APPROVAL',
    };

    (Project.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'p1' },
          name: 'Proje 1',
          status: 'ACTIVE',
          startDate: new Date('2026-01-10').toISOString(),
          endDate: new Date('2026-01-11').toISOString(),
        },
      ]),
    });

    (Maintenance.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'm1' },
          scheduledDate: new Date('2026-01-12').toISOString(),
          status: 'SCHEDULED',
          equipment: { name: 'Ekipman 1' },
        },
      ]),
    });

    await getCalendarEvents(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.counts.events).toBe(2);
    expect(payload.events[0].type).toBe('project');
  });
});

