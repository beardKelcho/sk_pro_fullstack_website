import axios from 'axios';
import logger from '../utils/logger';

export interface CalendarEventData {
    id?: string;
    summary: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    attendees?: string[]; // Emails
}

export class GoogleCalendarService {
    // These should ideally come from environment variables
    private readonly clientId = process.env.GOOGLE_CLIENT_ID || '';
    private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI || '';

    /**
     * Generate OAuth Auth URL
     */
    getAuthUrl(): string {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        // Return a dummy or actual Google Auth URL using query params
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=${scopes.join(' ')}&access_type=offline&prompt=consent`;
    }

    /**
     * Exchange code for tokens
     */
    async getTokens(code: string): Promise<any> {
        try {
            const { data } = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code'
            });
            return data;
        } catch (error: any) {
            logger.error('Google Calendar Error: Failed to get tokens', { error: error.response?.data || error.message });
            throw new Error('Google OAuth failed');
        }
    }

    /**
     * Create event
     */
    async createEvent(accessToken: string, event: CalendarEventData): Promise<string | null> {
        try {
            const response = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                summary: event.summary,
                description: event.description,
                location: event.location,
                start: { dateTime: event.startDate.toISOString() },
                end: { dateTime: event.endDate.toISOString() },
                attendees: event.attendees?.map(email => ({ email }))
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return (response.data as any).id;
        } catch (error: any) {
            logger.error('Google Calendar Error: Failed to create event', { error: error.response?.data || error.message });
            return null;
        }
    }

    /**
     * Update event
     */
    async updateEvent(accessToken: string, eventId: string, event: CalendarEventData): Promise<boolean> {
        try {
            await axios.put(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                summary: event.summary,
                description: event.description,
                location: event.location,
                start: { dateTime: event.startDate.toISOString() },
                end: { dateTime: event.endDate.toISOString() },
                attendees: event.attendees?.map(email => ({ email }))
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return true;
        } catch (error: any) {
            logger.error('Google Calendar Error: Failed to update event', { error: error.response?.data || error.message });
            return false;
        }
    }

    /**
     * Delete event
     */
    async deleteEvent(accessToken: string, eventId: string): Promise<boolean> {
        try {
            await axios.delete(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return true;
        } catch (error: any) {
            logger.error('Google Calendar Error: Failed to delete event', { error: error.response?.data || error.message });
            return false;
        }
    }
}

export default new GoogleCalendarService();
