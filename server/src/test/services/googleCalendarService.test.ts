/**
 * Google Calendar Service Testleri
 */

import axios from 'axios';
import {
  refreshGoogleAccessToken,
  listGoogleCalendars,
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  googleEventToProject,
  projectToGoogleEvent,
} from '../../services/googleCalendarService';

jest.mock('axios');
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Google Calendar Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshGoogleAccessToken', () => {
    it('access token yenilemeli', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          access_token: 'new-access-token',
          expires_in: 3600,
        },
      });

      const result = await refreshGoogleAccessToken('refresh-token', 'client-id', 'client-secret');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.expiresIn).toBe(3600);
    });
  });

  describe('listGoogleCalendars', () => {
    it('takvimleri listele', async () => {
      (axios as unknown as jest.Mock).mockResolvedValue({
        data: {
          items: [
            { id: 'primary', summary: 'Primary Calendar' },
            { id: 'cal2', summary: 'Calendar 2' },
          ],
        },
      });

      const result = await listGoogleCalendars('access-token');

      expect(result.items).toHaveLength(2);
    });
  });

  describe('googleEventToProject', () => {
    it('Google event\'i proje formatına çevirmeli', () => {
      const event: import('../../services/googleCalendarService').GoogleCalendarEvent = {
        summary: 'Test Event',
        description: 'Test Description',
        start: { date: '2026-01-15' },
        end: { date: '2026-01-16' },
        location: 'Test Location',
        status: 'confirmed' as const,
      };

      const project = googleEventToProject(event, 'user1', 'client1');

      expect(project.name).toBe('Test Event');
      expect(project.description).toBe('Test Description');
      expect(project.location).toBe('Test Location');
    });
  });

  describe('projectToGoogleEvent', () => {
    it('projeyi Google event formatına çevirmeli', () => {
      const project = {
        name: 'Test Project',
        description: 'Test Description',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-16'),
        location: 'Test Location',
        status: 'APPROVED',
      };

      const event = projectToGoogleEvent(project);

      expect(event.summary).toContain('Test Project');
      expect(event.start.date).toBe('2026-01-15');
      expect(event.end.date).toBe('2026-01-16');
    });
  });
});
