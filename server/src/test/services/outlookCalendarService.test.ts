/**
 * Outlook Calendar Service Testleri
 */

import axios from 'axios';
import {
  refreshOutlookAccessToken,
  listOutlookCalendars,
  listOutlookCalendarEvents,
  createOutlookCalendarEvent,
  outlookEventToProject,
  projectToOutlookEvent,
} from '../../services/outlookCalendarService';

jest.mock('axios');
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Outlook Calendar Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshOutlookAccessToken', () => {
    it('access token yenilemeli', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          access_token: 'new-access-token',
          expires_in: 3600,
        },
      });

      const result = await refreshOutlookAccessToken('refresh-token', 'client-id', 'client-secret');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.expiresIn).toBe(3600);
    });
  });

  describe('listOutlookCalendars', () => {
    it('takvimleri listele', async () => {
      (axios as unknown as jest.Mock).mockResolvedValue({
        data: {
          value: [
            { id: 'cal1', name: 'Calendar 1' },
            { id: 'cal2', name: 'Calendar 2' },
          ],
        },
      });

      const result = await listOutlookCalendars('access-token');

      expect(result.value).toHaveLength(2);
    });
  });

  describe('outlookEventToProject', () => {
    it('Outlook event\'i proje formatına çevirmeli', async () => {
      const event: import('../../services/outlookCalendarService').OutlookCalendarEvent = {
        subject: 'Test Event',
        body: { contentType: 'text', content: 'Test Description' },
        start: { dateTime: '2026-01-15T00:00:00Z', timeZone: 'UTC' },
        end: { dateTime: '2026-01-16T00:00:00Z', timeZone: 'UTC' },
        location: { displayName: 'Test Location' },
        isAllDay: true,
        showAs: 'busy' as const,
      };

      const project = await outlookEventToProject(event, 'user1', 'client1');

      expect(project.name).toBe('Test Event');
      expect(project.description).toBe('Test Description');
      expect(project.location).toBe('Test Location');
    });
  });

  describe('projectToOutlookEvent', () => {
    it('projeyi Outlook event formatına çevirmeli', () => {
      const project = {
        name: 'Test Project',
        description: 'Test Description',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-16'),
        location: 'Test Location',
        status: 'APPROVED',
      };

      const event = projectToOutlookEvent(project);

      expect(event.subject).toContain('Test Project');
      expect(event.isAllDay).toBe(true);
    });
  });
});
