/**
 * Calendar Integration Controller
 * Google Calendar ve Outlook Calendar entegrasyonları için controller
 */

import { Request, Response } from 'express';
import { CalendarIntegration } from '../models';
import {
  refreshGoogleAccessToken,
  listGoogleCalendars,
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  googleEventToProject,
  projectToGoogleEvent,
} from '../services/googleCalendarService';
import {
  refreshOutlookAccessToken,
  listOutlookCalendars,
  listOutlookCalendarEvents,
  createOutlookCalendarEvent,
  updateOutlookCalendarEvent,
  deleteOutlookCalendarEvent,
  outlookEventToProject,
  projectToOutlookEvent,
} from '../services/outlookCalendarService';
import { Project, Client } from '../models';
import logger from '../utils/logger';

/**
 * Google Calendar OAuth2 callback URL'i oluştur
 */
export const getGoogleCalendarAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'Google Calendar entegrasyonu yapılandırılmamış',
      });
    }

    const user = req.user as any;
    const state = `google:${user.id || user._id}`; // State ile user ID'yi gönder
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline',
      prompt: 'consent',
      state, // User ID'yi state ile gönder
    }).toString()}`;

    return res.status(200).json({
      success: true,
      authUrl,
    });
  } catch (error) {
    logger.error('Google Calendar auth URL oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Auth URL oluşturulamadı',
    });
  }
};

/**
 * Google Calendar OAuth2 callback - Token'ı al ve kaydet
 * Not: Bu endpoint authentication gerektirmez (OAuth2 flow)
 */
export const handleGoogleCalendarCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    // State'den user ID'yi al (güvenlik için state kullanılabilir)
    // Şimdilik session veya token'dan alacağız
    // Production'da state ile user ID'yi encode edip decode etmek daha güvenli olur
    const userId = state ? (state as string).split(':')[1] : null;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code bulunamadı',
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı bilgisi bulunamadı',
      });
    }
    
    const { User } = await import('../models');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations/google/callback`;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'Google Calendar entegrasyonu yapılandırılmamış',
      });
    }

    // Token exchange
    const axios = require('axios');
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Calendar integration kaydet veya güncelle
    const integration = await CalendarIntegration.findOneAndUpdate(
      { user: user.id, provider: 'google' },
      {
        user: user.id,
        provider: 'google',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
        syncEnabled: true,
      },
      { upsert: true, new: true }
    );

    // Varsayılan client bul veya oluştur
    let defaultClient = await Client.findOne({ name: 'Calendar Import' });
    if (!defaultClient) {
      defaultClient = await Client.create({
        name: 'Calendar Import',
        email: 'calendar@skproduction.com',
        phone: '',
        address: '',
        notes: 'Calendar entegrasyonu ile otomatik oluşturuldu',
      });
    }

    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations?success=true`);
  } catch (error: any) {
    logger.error('Google Calendar callback hatası:', error);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations?error=${encodeURIComponent(error.message || 'Entegrasyon başarısız')}`);
  }
};

/**
 * Outlook Calendar OAuth2 callback URL'i oluştur
 */
export const getOutlookCalendarAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.OUTLOOK_CLIENT_ID;
    const redirectUri = process.env.OUTLOOK_REDIRECT_URI || `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations/outlook/callback`;
    const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
    const scope = 'https://graph.microsoft.com/Calendars.ReadWrite offline_access';

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'Outlook Calendar entegrasyonu yapılandırılmamış',
      });
    }

    const user = req.user as any;
    const state = `outlook:${user.id || user._id}`; // State ile user ID'yi gönder
    
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      response_mode: 'query',
      state, // User ID'yi state ile gönder
    }).toString()}`;

    return res.status(200).json({
      success: true,
      authUrl,
    });
  } catch (error) {
    logger.error('Outlook Calendar auth URL oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Auth URL oluşturulamadı',
    });
  }
};

/**
 * Outlook Calendar OAuth2 callback - Token'ı al ve kaydet
 * Not: Bu endpoint authentication gerektirmez (OAuth2 flow)
 */
export const handleOutlookCalendarCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    // State'den user ID'yi al
    const userId = state ? (state as string).split(':')[1] : null;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code bulunamadı',
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı bilgisi bulunamadı',
      });
    }
    
    const { User } = await import('../models');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    const clientId = process.env.OUTLOOK_CLIENT_ID;
    const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;
    const redirectUri = process.env.OUTLOOK_REDIRECT_URI || `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations/outlook/callback`;
    const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'Outlook Calendar entegrasyonu yapılandırılmamış',
      });
    }

    // Token exchange
    const axios = require('axios');
    const tokenResponse = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      scope: 'https://graph.microsoft.com/Calendars.ReadWrite offline_access',
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Calendar integration kaydet veya güncelle
    const integration = await CalendarIntegration.findOneAndUpdate(
      { user: user.id, provider: 'outlook' },
      {
        user: user.id,
        provider: 'outlook',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
        syncEnabled: true,
      },
      { upsert: true, new: true }
    );

    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations?success=true`);
  } catch (error: any) {
    logger.error('Outlook Calendar callback hatası:', error);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/calendar/integrations?error=${encodeURIComponent(error.message || 'Entegrasyon başarısız')}`);
  }
};

/**
 * Calendar entegrasyonlarını listele
 */
export const listCalendarIntegrations = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const integrations = await CalendarIntegration.find({ user: user.id }).select('-accessToken -refreshToken');

    return res.status(200).json({
      success: true,
      integrations,
    });
  } catch (error) {
    logger.error('Calendar entegrasyonları listeleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Entegrasyonlar listelenemedi',
    });
  }
};

/**
 * Calendar entegrasyonunu sil
 */
export const deleteCalendarIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;

    const integration = await CalendarIntegration.findOne({ _id: id, user: user.id });
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Entegrasyon bulunamadı',
      });
    }

    await CalendarIntegration.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: 'Entegrasyon silindi',
    });
  } catch (error) {
    logger.error('Calendar entegrasyonu silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Entegrasyon silinemedi',
    });
  }
};

/**
 * Calendar'dan projeleri import et
 */
export const syncCalendarImport = async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    const { startDate, endDate } = req.query;
    const user = req.user as any;

    const integration = await CalendarIntegration.findOne({ _id: integrationId, user: user.id });
    if (!integration || !integration.syncEnabled) {
      return res.status(404).json({
        success: false,
        message: 'Entegrasyon bulunamadı veya devre dışı',
      });
    }

    // Token'ı kontrol et ve gerekirse yenile
    let accessToken = integration.accessToken;
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      if (integration.provider === 'google' && integration.refreshToken) {
        const refreshed = await refreshGoogleAccessToken(
          integration.refreshToken,
          process.env.GOOGLE_CLIENT_ID || '',
          process.env.GOOGLE_CLIENT_SECRET || ''
        );
        accessToken = refreshed.accessToken;
        integration.accessToken = refreshed.accessToken;
        integration.expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);
        await integration.save();
      } else if (integration.provider === 'outlook' && integration.refreshToken) {
        const refreshed = await refreshOutlookAccessToken(
          integration.refreshToken,
          process.env.OUTLOOK_CLIENT_ID || '',
          process.env.OUTLOOK_CLIENT_SECRET || '',
          process.env.OUTLOOK_TENANT_ID || 'common'
        );
        accessToken = refreshed.accessToken;
        integration.accessToken = refreshed.accessToken;
        integration.expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);
        await integration.save();
      }
    }

    // Varsayılan client bul
    let defaultClient = await Client.findOne({ name: 'Calendar Import' });
    if (!defaultClient) {
      defaultClient = await Client.create({
        name: 'Calendar Import',
        email: 'calendar@skproduction.com',
        phone: '',
        address: '',
        notes: 'Calendar entegrasyonu ile otomatik oluşturuldu',
      });
    }

    const timeMin = startDate ? new Date(startDate as string).toISOString() : new Date().toISOString();
    const timeMax = endDate ? new Date(endDate as string).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let events: any[] = [];
    if (integration.provider === 'google') {
      const calendarEvents = await listGoogleCalendarEvents(accessToken, integration.calendarId || 'primary', timeMin, timeMax);
      events = calendarEvents.items || [];
    } else if (integration.provider === 'outlook') {
      const calendarEvents = await listOutlookCalendarEvents(accessToken, integration.calendarId || 'calendar', timeMin, timeMax);
      events = calendarEvents.value || [];
    }

    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      projects: [] as any[],
    };

    for (const event of events) {
      try {
        let projectData;
        if (integration.provider === 'google') {
          projectData = googleEventToProject(event, user.id, defaultClient._id);
        } else {
          projectData = outlookEventToProject(event, user.id, defaultClient._id);
        }

        const project = await Project.create(projectData);
        result.projects.push(project);
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push(`${event.summary || event.subject}: ${error.message || 'Bilinmeyen hata'}`);
        logger.error('Calendar event import hatası:', error);
      }
    }

    integration.lastSyncAt = new Date();
    await integration.save();

    return res.status(200).json({
      success: true,
      message: `${result.success} proje başarıyla içe aktarıldı, ${result.failed} proje başarısız`,
      result,
    });
  } catch (error: any) {
    logger.error('Calendar import hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Calendar import başarısız',
    });
  }
};

/**
 * Projeleri Calendar'a export et
 */
export const syncCalendarExport = async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    const { startDate, endDate } = req.query;
    const user = req.user as any;

    const integration = await CalendarIntegration.findOne({ _id: integrationId, user: user.id });
    if (!integration || !integration.syncEnabled) {
      return res.status(404).json({
        success: false,
        message: 'Entegrasyon bulunamadı veya devre dışı',
      });
    }

    // Token'ı kontrol et ve gerekirse yenile
    let accessToken = integration.accessToken;
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      if (integration.provider === 'google' && integration.refreshToken) {
        const refreshed = await refreshGoogleAccessToken(
          integration.refreshToken,
          process.env.GOOGLE_CLIENT_ID || '',
          process.env.GOOGLE_CLIENT_SECRET || ''
        );
        accessToken = refreshed.accessToken;
        integration.accessToken = refreshed.accessToken;
        integration.expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);
        await integration.save();
      } else if (integration.provider === 'outlook' && integration.refreshToken) {
        const refreshed = await refreshOutlookAccessToken(
          integration.refreshToken,
          process.env.OUTLOOK_CLIENT_ID || '',
          process.env.OUTLOOK_CLIENT_SECRET || '',
          process.env.OUTLOOK_TENANT_ID || 'common'
        );
        accessToken = refreshed.accessToken;
        integration.accessToken = refreshed.accessToken;
        integration.expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);
        await integration.save();
      }
    }

    // Projeleri al
    const query: any = {};
    if (startDate) query.startDate = { $gte: new Date(startDate as string) };
    if (endDate) query.endDate = { $lte: new Date(endDate as string) };

    const projects = await Project.find(query).limit(100);

    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      events: [] as any[],
    };

    for (const project of projects) {
      try {
        let event;
        if (integration.provider === 'google') {
          event = projectToGoogleEvent(project);
          const created = await createGoogleCalendarEvent(accessToken, integration.calendarId || 'primary', event);
          result.events.push(created);
        } else {
          event = projectToOutlookEvent(project);
          const created = await createOutlookCalendarEvent(accessToken, integration.calendarId || 'calendar', event);
          result.events.push(created);
        }
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push(`${project.name}: ${error.message || 'Bilinmeyen hata'}`);
        logger.error('Calendar event export hatası:', error);
      }
    }

    integration.lastSyncAt = new Date();
    await integration.save();

    return res.status(200).json({
      success: true,
      message: `${result.success} proje başarıyla dışa aktarıldı, ${result.failed} proje başarısız`,
      result,
    });
  } catch (error: any) {
    logger.error('Calendar export hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Calendar export başarısız',
    });
  }
};
