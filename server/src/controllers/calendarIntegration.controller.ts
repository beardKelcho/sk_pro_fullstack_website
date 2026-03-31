/**
 * Calendar Integration Controller
 * Google Calendar ve Outlook Calendar entegrasyonları için controller
 */

import { Request, Response } from 'express';
import { AppError } from '../types/common';
import crypto from 'crypto';
import axios from 'axios';
import { CalendarIntegration } from '../models';
import {
  refreshGoogleAccessToken,
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  googleEventToProject,
  projectToGoogleEvent,
} from '../services/googleCalendarService';
import {
  refreshOutlookAccessToken,
  listOutlookCalendarEvents,
  createOutlookCalendarEvent,
  outlookEventToProject,
  projectToOutlookEvent,
} from '../services/outlookCalendarService';
import { Project, Client } from '../models';
import logger from '../utils/logger';
import { buildClientUrl } from '../config/clientOrigins';

// OAuth state CSRF koruması — state imzalama/doğrulama
const OAUTH_STATE_SECRET = process.env.JWT_SECRET || 'dev-only-secret';

const signOAuthState = (provider: string, userId: string): string => {
  const ts = Date.now().toString();
  const payload = `${provider}:${userId}:${ts}`;
  const hmac = crypto.createHmac('sha256', OAUTH_STATE_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ provider, userId, ts, hmac })).toString('base64url');
};

const verifyOAuthState = (state: string): { provider: string; userId: string } | null => {
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    const { provider, userId, ts, hmac } = parsed;
    // 10 dakikadan eski state'leri reddet
    if (Date.now() - Number(ts) > 10 * 60 * 1000) return null;
    const expected = crypto.createHmac('sha256', OAUTH_STATE_SECRET)
      .update(`${provider}:${userId}:${ts}`)
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))) return null;
    return { provider, userId };
  } catch {
    return null;
  }
};

/**
 * Google Calendar OAuth2 callback URL'i oluştur
 */
export const getGoogleCalendarAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || buildClientUrl('/admin/calendar/integrations/google/callback', 'Google Calendar redirect URL');
    const scope = 'https://www.googleapis.com/auth/calendar';

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'Google Calendar entegrasyonu yapılandırılmamış',
      });
    }

    const user = req.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = String((user as any).id || (user as any)._id);
    const state = signOAuthState('google', userId); // HMAC imzalı state — CSRF koruması

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

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code bulunamadı',
      });
    }

    if (!state) {
      return res.status(400).json({ success: false, message: 'OAuth state eksik' });
    }

    // CSRF koruması: state imzasını doğrula
    const verified = verifyOAuthState(state as string);
    if (!verified || verified.provider !== 'google') {
      return res.status(403).json({ success: false, message: 'Geçersiz veya süresi dolmuş OAuth state' });
    }
    const userId = verified.userId;

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
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || buildClientUrl('/admin/calendar/integrations/google/callback', 'Google Calendar redirect URL');

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'Google Calendar entegrasyonu yapılandırılmamış',
      });
    }

    // Token exchange
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const tokenData = tokenResponse.data as { access_token: string; refresh_token: string; expires_in: number };
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calendar integration kaydet veya güncelle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const savedIntegration = await CalendarIntegration.findOneAndUpdate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { user: (user as any).id, provider: 'google' },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: (user as any).id,
        provider: 'google',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
        syncEnabled: true,
      },
      { upsert: true, new: true }
    );

    // Google Calendar Push Webhook (watch) kanalı oluştur
    // channelToken üret → Google bunu X-Goog-Channel-Token header'ı ile geri yollar → webhook doğrulama
    if (savedIntegration && process.env.CALENDAR_WEBHOOK_URL) {
      try {
        const channelId = crypto.randomUUID();
        const channelToken = crypto.randomBytes(32).toString('hex');
        const webhookExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 gün

        const watchRes = await axios.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events/watch',
          {
            id: channelId,
            type: 'web_hook',
            address: process.env.CALENDAR_WEBHOOK_URL,
            token: channelToken,
            expiration: webhookExpiration.toString(),
          },
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const watchData = watchRes.data as { id?: string; expiration?: string };
        if (watchData?.id) {
          await CalendarIntegration.updateOne(
            { _id: savedIntegration._id },
            {
              channelId: watchData.id,
              channelToken,
              channelExpiration: new Date(Number(watchData.expiration || webhookExpiration)),
            }
          );
          logger.info(`Google Calendar watch channel created: ${channelId}`);
        }
      } catch (watchErr) {
        // Watch başarısız olursa entegrasyonu engelleme — push notification olmadan da çalışır
        logger.warn('Google Calendar watch channel kurulumu başarısız (non-blocking):', watchErr instanceof Error ? watchErr.message : String(watchErr));
      }
    }

    // Varsayılan client bul veya oluştur
    let defaultClient = await Client.findOne({ name: 'Calendar Import' });
    if (!defaultClient) {
      defaultClient = await Client.create({
        name: 'Calendar Import',
        email: 'calendar@example.com',
        phone: '',
        address: '',
        notes: 'Calendar entegrasyonu ile otomatik oluşturuldu',
      });
    }

    return res.redirect(buildClientUrl('/admin/calendar/integrations?success=true', 'Google Calendar callback redirect'));
  } catch (error: unknown) {
    const appError = error as AppError;
    logger.error('Google Calendar callback hatası:', error);
    return res.redirect(buildClientUrl(`/admin/calendar/integrations?error=${encodeURIComponent(appError?.message || (error as Error)?.message || 'Entegrasyon başarısız')}`, 'Google Calendar callback redirect'));
  }
};

/**
 * Outlook Calendar OAuth2 callback URL'i oluştur
 */
export const getOutlookCalendarAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.OUTLOOK_CLIENT_ID;
    const redirectUri = process.env.OUTLOOK_REDIRECT_URI || buildClientUrl('/admin/calendar/integrations/outlook/callback', 'Outlook Calendar redirect URL');
    const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
    const scope = 'https://graph.microsoft.com/Calendars.ReadWrite offline_access';

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'Outlook Calendar entegrasyonu yapılandırılmamış',
      });
    }

    const user = req.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = String((user as any).id || (user as any)._id);
    const state = signOAuthState('outlook', userId); // HMAC imzalı state — CSRF koruması

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

    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code bulunamadı' });
    }

    if (!state) {
      return res.status(400).json({ success: false, message: 'OAuth state eksik' });
    }

    // CSRF koruması: state imzasını doğrula
    const verified = verifyOAuthState(state as string);
    if (!verified || verified.provider !== 'outlook') {
      return res.status(403).json({ success: false, message: 'Geçersiz veya süresi dolmuş OAuth state' });
    }
    const userId = verified.userId;

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
    const redirectUri = process.env.OUTLOOK_REDIRECT_URI || buildClientUrl('/admin/calendar/integrations/outlook/callback', 'Outlook Calendar redirect URL');
    const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'Outlook Calendar entegrasyonu yapılandırılmamış',
      });
    }

    // Token exchange
    const tokenResponse = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      scope: 'https://graph.microsoft.com/Calendars.ReadWrite offline_access',
    });

    const tokenData = tokenResponse.data as { access_token: string; refresh_token: string; expires_in: number };
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calendar integration kaydet veya güncelle
    await CalendarIntegration.findOneAndUpdate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { user: (user as any).id, provider: 'outlook' },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: (user as any).id,
        provider: 'outlook',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
        syncEnabled: true,
      },
      { upsert: true, new: true }
    );

    return res.redirect(buildClientUrl('/admin/calendar/integrations?success=true', 'Outlook Calendar callback redirect'));
  } catch (error: unknown) {
    const appError = error as AppError;
    logger.error('Outlook Calendar callback hatası:', error);
    return res.redirect(buildClientUrl(`/admin/calendar/integrations?error=${encodeURIComponent(appError?.message || (error as Error)?.message || 'Entegrasyon başarısız')}`, 'Outlook Calendar callback redirect'));
  }
};

/**
 * Calendar entegrasyonlarını listele
 */
export const listCalendarIntegrations = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integrations = await CalendarIntegration.find({ user: (user as any).id }).select('-accessToken -refreshToken');

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
    const user = req.user;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integration = await CalendarIntegration.findOne({ _id: id, user: (user as any).id });
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
    const user = req.user;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integration = await CalendarIntegration.findOne({ _id: integrationId, user: (user as any).id }).select('+accessToken +refreshToken');
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
        email: 'calendar@example.com',
        phone: '',
        address: '',
        notes: 'Calendar entegrasyonu ile otomatik oluşturuldu',
      });
    }

    const timeMin = startDate ? new Date(startDate as string).toISOString() : new Date().toISOString();
    const timeMax = endDate ? new Date(endDate as string).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let events: unknown[] = [];
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
      projects: [] as unknown[],
    };

    for (const event of events) {
      try {
        let projectData;
        if (integration.provider === 'google') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          projectData = await googleEventToProject(event as any, (user as any).id || (user as any)._id.toString(), defaultClient._id.toString());
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          projectData = await outlookEventToProject(event as any, (user as any).id || (user as any)._id.toString(), defaultClient._id.toString());
        }

        const project = await Project.create(projectData);
        result.projects.push(project as unknown);
        result.success++;
      } catch (error: unknown) {
        const appError = error as AppError;
        result.failed++;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.errors.push(`${(event as any).summary || (event as any).subject}: ${appError?.message || (error as Error)?.message || 'Bilinmeyen hata'}`);
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
  } catch (error: unknown) {
    const appError = error as AppError;
    logger.error('Calendar import hatası:', error);
    return res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || 'Calendar import başarısız',
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
    const user = req.user;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integration = await CalendarIntegration.findOne({ _id: integrationId, user: (user as any).id }).select('+accessToken +refreshToken');
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
    const query: Record<string, unknown> = {};
    if (startDate) query.startDate = { $gte: new Date(startDate as string) };
    if (endDate) query.endDate = { $lte: new Date(endDate as string) };

    const projects = await Project.find(query).limit(100);

    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      events: [] as unknown[],
    };

    for (const project of projects) {
      try {
        let event;
        if (integration.provider === 'google') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event = projectToGoogleEvent(project as any as any);
          const created = await createGoogleCalendarEvent(accessToken, integration.calendarId || 'primary', event);
          result.events.push(created);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event = projectToOutlookEvent(project as any as any);
          const created = await createOutlookCalendarEvent(accessToken, integration.calendarId || 'calendar', event);
          result.events.push(created);
        }
        result.success++;
      } catch (error: unknown) {
        const appError = error as AppError;
        result.failed++;
        result.errors.push(`${project.name}: ${appError?.message || (error as Error)?.message || 'Bilinmeyen hata'}`);
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
  } catch (error: unknown) {
    const appError = error as AppError;
    logger.error('Calendar export hatası:', error);
    return res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || 'Calendar export başarısız',
    });
  }
};
