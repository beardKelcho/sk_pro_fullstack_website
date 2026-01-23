/**
 * Google Calendar Service
 * Google Calendar API entegrasyonu için service
 */

import axios from 'axios';
import logger from '../utils/logger';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    date?: string; // All-day events için YYYY-MM-DD
    dateTime?: string; // Timed events için ISO 8601
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface GoogleCalendarListResponse {
  items: Array<{
    id: string;
    summary: string;
    primary?: boolean;
  }>;
}

/**
 * Google Calendar API'ye erişim için access token ile istek yap
 */
const makeGoogleCalendarRequest = async <T = any>(
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: unknown
): Promise<T> => {
  try {
    const response = await axios({
      method,
      url: `https://www.googleapis.com/calendar/v3${endpoint}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data as T;
  } catch (error: any) {
    logger.error('Google Calendar API hatası:', {
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
export const refreshGoogleAccessToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; expiresIn: number }> => {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const data = response.data as { access_token: string; expires_in?: number };
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  } catch (error: any) {
    logger.error('Google token refresh hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının takvimlerini listele
 */
export const listGoogleCalendars = async (accessToken: string): Promise<GoogleCalendarListResponse> => {
  return makeGoogleCalendarRequest(accessToken, 'GET', '/users/me/calendarList');
};

/**
 * Takvimdeki etkinlikleri listele
 */
export const listGoogleCalendarEvents = async (
  accessToken: string,
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string
): Promise<{ items: GoogleCalendarEvent[] }> => {
  const params = new URLSearchParams();
  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);
  params.append('singleEvents', 'true');
  params.append('orderBy', 'startTime');

  return makeGoogleCalendarRequest(accessToken, 'GET', `/calendars/${calendarId}/events?${params.toString()}`);
};

/**
 * Takvime etkinlik ekle
 */
export const createGoogleCalendarEvent = async (
  accessToken: string,
  calendarId: string = 'primary',
  event: GoogleCalendarEvent
): Promise<GoogleCalendarEvent> => {
  return makeGoogleCalendarRequest(accessToken, 'POST', `/calendars/${calendarId}/events`, event);
};

/**
 * Takvimdeki etkinliği güncelle
 */
export const updateGoogleCalendarEvent = async (
  accessToken: string,
  calendarId: string = 'primary',
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<GoogleCalendarEvent> => {
  return makeGoogleCalendarRequest(accessToken, 'PUT', `/calendars/${calendarId}/events/${eventId}`, event);
};

/**
 * Takvimdeki etkinliği sil
 */
export const deleteGoogleCalendarEvent = async (
  accessToken: string,
  calendarId: string = 'primary',
  eventId: string
): Promise<void> => {
  return makeGoogleCalendarRequest(accessToken, 'DELETE', `/calendars/${calendarId}/events/${eventId}`);
};

/**
 * Google Calendar event'ini proje formatına çevir
 */
export const googleEventToProject = (event: GoogleCalendarEvent, userId: string, clientId: string): Record<string, unknown> => {
  const startDate = event.start.date || event.start.dateTime?.split('T')[0];
  const endDate = event.end.date || event.end.dateTime?.split('T')[0];

  return {
    name: event.summary || 'İsimsiz Proje',
    description: event.description || '',
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : undefined,
    status: event.status === 'cancelled' ? 'CANCELLED' : 'APPROVED',
    location: event.location || '',
    client: clientId,
    team: [userId],
    equipment: [],
  };
};

/**
 * Projeyi Google Calendar event formatına çevir
 */
export const projectToGoogleEvent = (project: Record<string, any>): GoogleCalendarEvent => {
  const startDate = new Date(project.startDate);
  const endDate = project.endDate ? new Date(project.endDate) : startDate;

  return {
    summary: `[Proje] ${project.name}`,
    description: `Durum: ${project.status}\n${project.description || ''}`,
    start: {
      date: startDate.toISOString().split('T')[0],
    },
    end: {
      date: endDate.toISOString().split('T')[0],
    },
    location: project.location || '',
    status: project.status === 'CANCELLED' ? 'cancelled' : 'confirmed',
  };
};
