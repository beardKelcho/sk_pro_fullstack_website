/**
 * Calendar Integration Controller Testleri
 */

import { Request, Response } from 'express';
import {
  getGoogleCalendarAuthUrl,
  getOutlookCalendarAuthUrl,
  listCalendarIntegrations,
  deleteCalendarIntegration,
} from '../../controllers/calendarIntegration.controller';
import { CalendarIntegration } from '../../models';

jest.mock('../../models', () => ({
  CalendarIntegration: {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  },
  User: {
    findById: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe('Calendar Integration Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/callback';
    process.env.OUTLOOK_CLIENT_ID = 'test-outlook-client-id';
    process.env.OUTLOOK_REDIRECT_URI = 'http://localhost:3000/callback';
    process.env.CLIENT_URL = 'http://localhost:3000';

    mockRequest = {
      user: { id: 'user1', _id: 'user1', role: 'ADMIN' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
    };
  });

  describe('getGoogleCalendarAuthUrl', () => {
    it('Google Calendar auth URL döndürmeli', async () => {
      await getGoogleCalendarAuthUrl(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.authUrl).toContain('accounts.google.com');
      expect(payload.authUrl).toContain('test-google-client-id');
    });

    it('GOOGLE_CLIENT_ID yoksa 500 döndürmeli', async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      await getGoogleCalendarAuthUrl(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getOutlookCalendarAuthUrl', () => {
    it('Outlook Calendar auth URL döndürmeli', async () => {
      await getOutlookCalendarAuthUrl(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.authUrl).toContain('login.microsoftonline.com');
      expect(payload.authUrl).toContain('test-outlook-client-id');
    });

    it('OUTLOOK_CLIENT_ID yoksa 500 döndürmeli', async () => {
      delete process.env.OUTLOOK_CLIENT_ID;
      await getOutlookCalendarAuthUrl(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('listCalendarIntegrations', () => {
    it('entegrasyonları listele', async () => {
      (CalendarIntegration.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue([
          { _id: '1', provider: 'google', syncEnabled: true },
          { _id: '2', provider: 'outlook', syncEnabled: true },
        ]),
      });

      await listCalendarIntegrations(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.integrations).toHaveLength(2);
    });
  });

  describe('deleteCalendarIntegration', () => {
    it('entegrasyonu sil', async () => {
      (CalendarIntegration.findOne as jest.Mock).mockResolvedValue({
        _id: '1',
        user: 'user1',
        provider: 'google',
      });
      (CalendarIntegration.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      mockRequest.params = { id: '1' };

      await deleteCalendarIntegration(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(payload.success).toBe(true);
    });

    it('entegrasyon bulunamazsa 404 döndürmeli', async () => {
      (CalendarIntegration.findOne as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { id: '1' };

      await deleteCalendarIntegration(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
