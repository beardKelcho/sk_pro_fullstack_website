import User from '../models/User';
import googleCalendarService from './googleCalendar.service';
import outlookCalendarService from './outlookCalendar.service';
import logger from '../utils/logger';

class CalendarSyncService {
    /**
     * Sycns a project event to all assigned team members.
     * This is an asynchronous fire-and-forget method.
     */
    async syncProjectEvent(project: any, isUpdate: boolean = false): Promise<void> {
        try {
            if (!project.team || project.team.length === 0) return;

            const projectTeamIds = project.team.map((user: any) => user._id || user);
            const users = await User.find({ _id: { $in: projectTeamIds } }).select('+googleTokens +outlookTokens').lean();

            const eventData = {
                summary: `Proje: ${project.name}`,
                description: `Açıklama: ${project.description || 'Belirtilmedi'}\nDurum: ${project.status}`,
                location: project.location?.address || 'Belirtilmedi',
                startDate: project.startDate,
                endDate: project.endDate || project.startDate,
                attendees: users.map(u => u.email)
            };

            for (const user of users) {
                // Determine if we need to create/update
                // NOTE: In a complete implementation, you would store the generated Google/Outlook Event ID in a mapping table
                // For this skeleton, we assume creation or skip update if mapping doesn't exist

                if (user.googleTokens?.accessToken && !isUpdate) {
                    await googleCalendarService.createEvent(user.googleTokens.accessToken, eventData);
                    logger.info(`Google Calendar event synced for user ${user.email}`);
                }

                if (user.outlookTokens?.accessToken && !isUpdate) {
                    await outlookCalendarService.createEvent(user.outlookTokens.accessToken, eventData);
                    logger.info(`Outlook Calendar event synced for user ${user.email}`);
                }

                // If isUpdate is true, we would call updateEvent with the stored event ID.
            }
        } catch (error: any) {
            logger.error('CalendarSyncService Error: Failed to sync project event', { error: error.message });
        }
    }

    /**
     * Syncs project deletion
     */
    async deleteProjectEvent(project: any): Promise<void> {
        // Implementation would fetch the mapping of Project ID -> Event ID for each user and delete them.
        logger.info(`Calendar deletion hook triggered for project ${project._id}. Note: Skeleton method.`);
    }
}

export default new CalendarSyncService();
