/**
 * Outlook Calendar Service
 * Microsoft Graph API entegrasyonu için service
 */

import axios from 'axios';
import logger from '../utils/logger';

export interface OutlookCalendarEvent {
  id?: string;
  subject: string;
  body?: {
    contentType: string;
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  isAllDay?: boolean;
  showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown';
}

export interface OutlookCalendarListResponse {
  value: Array<{
    id: string;
    name: string;
    canEdit: boolean;
  }>;
}

/**
 * Microsoft Graph API'ye erişim için access token ile istek yap
 */
const makeGraphRequest = async (
  accessToken: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any
) => {
  try {
    const response = await axios({
      method,
      url: `https://graph.microsoft.com/v1.0${endpoint}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data;
  } catch (error: any) {
    logger.error('Microsoft Graph API hatası:', {
      endpoint,
      method,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
    });
    throw error;
  }
};

/**
 * Access token'ı yenile (refresh token kullanarak)
 */
export const refreshOutlookAccessToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  tenantId: string = 'common'
): Promise<{ accessToken: string; expiresIn: number }> => {
  try {
    const response = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Calendars.ReadWrite',
    });

    const data = response.data as { access_token: string; expires_in?: number };
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  } catch (error: any) {
    logger.error('Outlook token refresh hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının takvimlerini listele
 */
export const listOutlookCalendars = async (accessToken: string): Promise<OutlookCalendarListResponse> => {
  return makeGraphRequest(accessToken, 'GET', '/me/calendars');
};

/**
 * Takvimdeki etkinlikleri listele
 */
export const listOutlookCalendarEvents = async (
  accessToken: string,
  calendarId: string = 'calendar',
  startDateTime?: string,
  endDateTime?: string
): Promise<{ value: OutlookCalendarEvent[] }> => {
  let endpoint = `/me/calendars/${calendarId}/events`;
  const params = new URLSearchParams();
  if (startDateTime) params.append('$filter', `start/dateTime ge '${startDateTime}'`);
  if (endDateTime) params.append('$filter', `${params.get('$filter') || ''} and end/dateTime le '${endDateTime}'`);
  params.append('$orderby', 'start/dateTime');
  if (params.toString()) endpoint += `?${params.toString()}`;

  return makeGraphRequest(accessToken, 'GET', endpoint);
};

/**
 * Takvime etkinlik ekle
 */
export const createOutlookCalendarEvent = async (
  accessToken: string,
  calendarId: string = 'calendar',
  event: OutlookCalendarEvent
): Promise<OutlookCalendarEvent> => {
  return makeGraphRequest(accessToken, 'POST', `/me/calendars/${calendarId}/events`, event);
};

/**
 * Takvimdeki etkinliği güncelle
 */
export const updateOutlookCalendarEvent = async (
  accessToken: string,
  calendarId: string = 'calendar',
  eventId: string,
  event: Partial<OutlookCalendarEvent>
): Promise<OutlookCalendarEvent> => {
  return makeGraphRequest(accessToken, 'PATCH', `/me/calendars/${calendarId}/events/${eventId}`, event);
};

/**
 * Takvimdeki etkinliği sil
 */
export const deleteOutlookCalendarEvent = async (
  accessToken: string,
  calendarId: string = 'calendar',
  eventId: string
): Promise<void> => {
  return makeGraphRequest(accessToken, 'DELETE', `/me/calendars/${calendarId}/events/${eventId}`);
};

/**
 * Outlook Calendar event'ini proje formatına çevir
 */
export const outlookEventToProject = async (event: OutlookCalendarEvent, userId: string, clientId: string): Promise<any> => {
  const startDate = event.isAllDay
    ? event.start.dateTime.split('T')[0]
    : new Date(event.start.dateTime).toISOString().split('T')[0];
  const endDate = event.isAllDay
    ? event.end.dateTime.split('T')[0]
    : new Date(event.end.dateTime).toISOString().split('T')[0];

  const mongoose = (await import('mongoose')).default;
  return {
    name: event.subject || 'İsimsiz Proje',
    description: event.body?.content || '',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    status: event.showAs === 'free' ? 'PENDING_APPROVAL' : 'APPROVED',
    location: event.location?.displayName || '',
    client: mongoose.Types.ObjectId.isValid(clientId) ? new mongoose.Types.ObjectId(clientId) : clientId,
    team: [mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId],
    equipment: [],
  };
};

/**
 * Projeyi Outlook Calendar event formatına çevir
 */
export const projectToOutlookEvent = (project: any): OutlookCalendarEvent => {
  const startDate = new Date(project.startDate);
  const endDate = project.endDate ? new Date(project.endDate) : startDate;

  return {
    subject: `[Proje] ${project.name}`,
    body: {
      contentType: 'HTML',
      content: `<p>Durum: ${project.status}</p><p>${project.description || ''}</p>`,
    },
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'UTC',
    },
    location: project.location
      ? {
          displayName: project.location,
        }
      : undefined,
    isAllDay: true,
    showAs: project.status === 'CANCELLED' ? 'free' : 'busy',
  };
};
