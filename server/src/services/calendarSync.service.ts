import User from '../models/User';
import googleCalendarService from './googleCalendar.service';
import outlookCalendarService from './outlookCalendar.service';
import logger from '../utils/logger';
import mongoose from 'mongoose';

class CalendarSyncService {
    /**
     * Sycns a project event to all assigned team members.
     * This is an asynchronous fire-and-forget method.
     */
    async syncProjectEvent(project: Record<string, unknown>, isUpdate: boolean = false): Promise<void> {
        try {
            if (project._isFromSync) return; // Sonsuz döngüyü önle (Webhook'tan gelmişse tekrar Google'a atma)

            if (!project.team || !Array.isArray(project.team) || project.team.length === 0) return;

            const projectTeamIds = (project.team as Array<{ _id?: unknown } | string>).map((user) => typeof user === 'string' ? user : String(user?._id || user));
            const users = await User.find({ _id: { $in: projectTeamIds } }).select('+googleTokens +outlookTokens').lean();

            const eventData = {
                summary: `Proje: ${project.name}`,
                description: `Açıklama: ${project.description || 'Belirtilmedi'}\nDurum: ${project.status}`,
                location: (project.location as { address?: string })?.address || 'Belirtilmedi',
                startDate: new Date(project.startDate as string | number | Date),
                endDate: new Date((project.endDate || project.startDate) as string | number | Date),
                attendees: users.map(u => u.email)
            };

            for (const user of users) {
                if (user.googleTokens?.accessToken) {
                    try {
                        let eventId = project.googleCalendarEventId as string | undefined;

                        if (eventId && isUpdate) {
                            await googleCalendarService.updateEvent(user.googleTokens.accessToken, eventId, eventData);
                            logger.info(`Google Calendar event updated for user ${user.email}`);
                        } else if (!isUpdate) {
                            eventId = await googleCalendarService.createEvent(user.googleTokens.accessToken, eventData) || undefined;
                            logger.info(`Google Calendar event created for user ${user.email}`);

                            // Projeye Event ID'yi kaydet (ilk defa oluşuyorsa)
                            if (eventId && project._id) {
                                const Project = mongoose.model('Project');
                                await Project.findByIdAndUpdate(project._id, { googleCalendarEventId: eventId });
                            }
                        }
                    } catch (gErr) {
                        logger.error(`Google sync error for user ${user.email}`, gErr);
                    }
                }

                if (user.outlookTokens?.accessToken && !isUpdate) {
                    await outlookCalendarService.createEvent(user.outlookTokens.accessToken, eventData);
                    logger.info(`Outlook Calendar event synced for user ${user.email}`);
                }
            }
        } catch (error: unknown) {
            logger.error('CalendarSyncService Error: Failed to sync project event', { error: error instanceof Error ? error.message : String(error) });
        }
    }

    /**
     * Syncs project deletion
     */
    async deleteProjectEvent(project: Record<string, unknown>): Promise<void> {
        // Implementation would fetch the mapping of Project ID -> Event ID for each user and delete them.
        logger.info(`Calendar deletion hook triggered for project ${project._id}. Note: Skeleton method.`);
    }

    /**
     * Pulls changes from Google Calendar and updates local Project DB
     */
    async syncFromGoogleCalendar(integration: any): Promise<void> {
        try {
            logger.info(`Starting sync from Google for user integration ${integration.user}`);

            // Get user's active tokens
            const user = await User.findById(integration.user).select('+googleTokens');
            if (!user || !user.googleTokens?.accessToken) {
                logger.warn(`No Google tokens found for user ${integration.user}`);
                return;
            }

            // Google'dan eventleri çek (syncToken ile)
            const { googleCalendarEventToProject, listGoogleCalendarEvents } = require('./googleCalendarService');

            // Use the list events method, but we also pass syncToken
            // Note: Our listGoogleCalendarEvents might need adapting or we make a direct axios call here
            const axios = require('axios');

            // Parametreleri oluştur
            const params = new URLSearchParams();
            if (integration.syncToken) {
                params.append('syncToken', integration.syncToken);
            } else {
                // If it's the very first time, maybe limit timeMin to today to avoid full history
                params.append('timeMin', new Date().toISOString());
            }

            let response;
            try {
                response = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${user.googleTokens.accessToken}` }
                });
            } catch (apiErr: any) {
                // Handle token expiration or invalidated syncToken (410 Gone)
                if (apiErr.response?.status === 410) {
                    logger.warn(`syncToken invalidated for ${integration.user}, performing full sync`);
                    // Temizle ve yeniden dene (syncToken olmadan)
                    integration.syncToken = undefined;
                    await integration.save();
                    return this.syncFromGoogleCalendar(integration);
                }
                throw apiErr;
            }

            const events = response.data.items || [];
            const nextSyncToken = response.data.nextSyncToken;
            const Project = mongoose.model('Project');

            // Client modelini varsayılan değer atama için al
            const Client = mongoose.model('Client');
            let defaultClient = await Client.findOne({ name: 'Takvimden Gelenler' });

            if (!defaultClient) {
                defaultClient = await Client.create({
                    name: 'Takvimden Gelenler',
                    email: 'takvim@skpro.com.tr',
                    phone: '0000000000',
                    address: 'Otomatik Oluşturuldu',
                    type: 'Bireysel'
                });
                logger.info('Varsayılan Takvimden Gelenler müşterisi oluşturuldu.');
            }

            for (const event of events) {
                // Check if it's our own app's generated event (skip loop back if needed)
                // Ama incremental sync ile geleni isleyelim

                let existingProject = await Project.findOne({ googleCalendarEventId: event.id });

                if (event.status === 'cancelled') {
                    if (existingProject) {
                        logger.info(`Google Event ${event.id} cancelled. Marking project as cancelled.`);
                        await Project.findByIdAndUpdate(existingProject._id, { status: 'CANCELLED', _isFromSync: true });
                    }
                    continue;
                }

                // If event exists and summary is present
                if (event.summary) {
                    const startDateStr = event.start?.date || event.start?.dateTime;
                    const endDateStr = event.end?.date || event.end?.dateTime;

                    if (!startDateStr) continue; // Geçersiz event

                    const startDate = new Date(startDateStr);
                    const endDate = endDateStr ? new Date(endDateStr) : startDate;

                    if (existingProject) {
                        // Update existing project
                        await Project.findByIdAndUpdate(existingProject._id, {
                            name: event.summary,
                            description: event.description || existingProject.description,
                            startDate,
                            endDate,
                            // _isFromSync true göndererek sonsuz döngüyü önle
                            isFromSync: true
                        } as any);
                        logger.info(`Project ${existingProject._id} updated via Google Calendar sync.`);
                    } else {
                        // Create new project
                        // Zorunlu alanlar (required fields) için varsayılan değerler
                        const newProject = new Project({
                            name: event.summary || 'İsimsiz Takvim Etkinliği',
                            description: event.description || 'Takvim entegrasyonu ile otomatik oluşturuldu.',
                            location: event.location || 'Belirtilmedi',
                            startDate,
                            endDate,
                            status: 'PENDING_APPROVAL', // Default status
                            client: defaultClient._id,
                            team: [],
                            equipment: [],
                            googleCalendarEventId: event.id,
                        });

                        // isFromSync'i any ile setleyerek schema error bypass ediyoruz (schema strict=false degilse)
                        // veya pre-save hook varsa diye manuel kaydetmeden project objesine ekleyelim
                        (newProject as any).isFromSync = true;

                        try {
                            await newProject.save();
                            logger.info(`New project ${newProject._id} created via Google Calendar sync.`);
                        } catch (saveErr) {
                            logger.error(`Failed to create project from Google event ${event.id}. Missing required fields?`, saveErr);
                        }
                    }
                }
            }

            // Save new syncToken
            if (nextSyncToken && nextSyncToken !== integration.syncToken) {
                integration.syncToken = nextSyncToken;
                integration.lastSyncAt = new Date();
                await integration.save();
            }

        } catch (error) {
            logger.error(`Error in syncFromGoogleCalendar for integration ${integration?._id}`, error);
        }
    }
}

export default new CalendarSyncService();
