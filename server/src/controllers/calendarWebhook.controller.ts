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

        const channelToken = req.headers['x-goog-channel-token'] as string | undefined;

        // channelToken ile doğrula — bilgi sızdırmamak için hatalarda da 200 dön
        const integration = await CalendarIntegration.findOne({
            provider: 'google',
            channelId
        }).select('+channelToken');

        if (!integration) {
            logger.warn(`Webhook: unknown channelId ${channelId}`);
            return res.status(200).send('OK');
        }

        // Token kayıtlıysa istek token'ı ile eşleşmeli
        if (integration.channelToken && integration.channelToken !== channelToken) {
            logger.warn(`Webhook: invalid channelToken for channel ${channelId}`);
            return res.status(200).send('OK');
        }

        // Acknowledge the webhook promptly per Google's requirements
        res.status(200).send('OK');

        // Process the sync asynchronously
        calendarSyncService.syncFromGoogleCalendar(integration).catch(err => {
            logger.error(`Error processing Google Calendar sync for integration ${integration._id}`, err);
        });

    } catch (error: unknown) {
        logger.error('Google Calendar Webhook Error', { error: error instanceof Error ? error.message : String(error) });
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
};
