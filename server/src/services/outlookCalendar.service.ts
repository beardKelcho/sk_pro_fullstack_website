import axios from 'axios';
import logger from '../utils/logger';
import { CalendarEventData } from './googleCalendar.service';

export class OutlookCalendarService {
    private readonly clientId = process.env.OUTLOOK_CLIENT_ID || '';
    private readonly clientSecret = process.env.OUTLOOK_CLIENT_SECRET || '';
    private readonly redirectUri = process.env.OUTLOOK_REDIRECT_URI || '';

    /**
     * Generate OAuth Auth URL
     */
    getAuthUrl(): string {
        const scopes = ['offline_access', 'Calendars.ReadWrite'];
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUri}&response_mode=query&scope=${scopes.join('+')}`;
    }

    /**
     * Exchange code for tokens
     */
    async getTokens(code: string): Promise<any> {
        try {
            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('scope', 'offline_access Calendars.ReadWrite');
            params.append('code', code);
            params.append('redirect_uri', this.redirectUri);
            params.append('grant_type', 'authorization_code');
            params.append('client_secret', this.clientSecret);

            const { data } = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            return data;
        } catch (error: any) {
            logger.error('Outlook Calendar Error: Failed to get tokens', { error: error.response?.data || error.message });
            throw new Error('Outlook OAuth failed');
        }
    }

    /**
     * Create event
     */
    async createEvent(accessToken: string, event: CalendarEventData): Promise<string | null> {
        try {
            const response = await axios.post('https://graph.microsoft.com/v1.0/me/events', {
                subject: event.summary,
                body: { contentType: 'HTML', content: event.description || '' },
                location: { displayName: event.location || '' },
                start: { dateTime: event.startDate.toISOString(), timeZone: 'UTC' },
                end: { dateTime: event.endDate.toISOString(), timeZone: 'UTC' },
                attendees: event.attendees?.map(email => ({ emailAddress: { address: email }, type: 'required' }))
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return (response.data as any).id;
        } catch (error: any) {
            logger.error('Outlook Calendar Error: Failed to create event', { error: error.response?.data || error.message });
            return null;
        }
    }

    /**
     * Update event
     */
    async updateEvent(accessToken: string, eventId: string, event: CalendarEventData): Promise<boolean> {
        try {
            await axios.patch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
                subject: event.summary,
                body: { contentType: 'HTML', content: event.description || '' },
                location: { displayName: event.location || '' },
                start: { dateTime: event.startDate.toISOString(), timeZone: 'UTC' },
                end: { dateTime: event.endDate.toISOString(), timeZone: 'UTC' },
                attendees: event.attendees?.map(email => ({ emailAddress: { address: email }, type: 'required' }))
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return true;
        } catch (error: any) {
            logger.error('Outlook Calendar Error: Failed to update event', { error: error.response?.data || error.message });
            return false;
        }
    }

    /**
     * Delete event
     */
    async deleteEvent(accessToken: string, eventId: string): Promise<boolean> {
        try {
            await axios.delete(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return true;
        } catch (error: any) {
            logger.error('Outlook Calendar Error: Failed to delete event', { error: error.response?.data || error.message });
            return false;
        }
    }
}

export default new OutlookCalendarService();
