import { Request, Response } from 'express';
import logger from '../utils/logger';
import { CalendarIntegration } from '../models/CalendarIntegration';
import calendarSyncService from '../services/calendarSync.service';

/**
 * Handle incoming webhooks from Google Calendar API
 */
export const handleGoogleCalendarWebhook = async (req: Request, res: Response) => {
    try {
        const channelId = req.headers['x-goog-channel-id'] as string;
        const resourceState = req.headers['x-goog-resource-state'] as string;
        const resourceId = req.headers['x-goog-resource-id'] as string;

        // Google sends 'sync' as the initial test
        if (resourceState === 'sync') {
            logger.info(`Google Calendar Webhook Sync message received for channel: ${channelId}`);
            return res.status(200).send('OK');
        }

        // We only care about actual changes (exists)
        if (resourceState !== 'exists') {
            logger.info(`Ignoring webhook state ${resourceState} for channel ${channelId}`);
            return res.status(200).send('OK');
        }

        if (!channelId) {
            logger.warn('Google Calendar Webhook received without channelId');
            return res.status(400).send('Missing channel ID');
        }

        // Find the user integration by channelId
        const integration = await CalendarIntegration.findOne({
            provider: 'google',
            channelId
        });

        if (!integration) {
            logger.warn(`Received webhook for unknown channel: ${channelId}`);
            return res.status(404).send('Integration not found');
        }

        // Acknowledge the webhook promptly per Google's requirements
        res.status(200).send('OK');

        // Process the sync asynchronously
        calendarSyncService.syncFromGoogleCalendar(integration).catch(err => {
            logger.error(`Error processing Google Calendar sync for integration ${integration._id}`, err);
        });

    } catch (error) {
        logger.error('Google Calendar Webhook Error', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
};
