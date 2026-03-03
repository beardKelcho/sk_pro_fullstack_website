import type { Request, Response } from 'express';
import { AppError } from '../types/common';
import { Maintenance, Project } from '../models';
import { hasPermission, Permission, Role } from '../config/permissions';
import logger from '../utils/logger';
import User from '../models/User';
import googleCalendarService from '../services/googleCalendar.service';
import outlookCalendarService from '../services/outlookCalendar.service';

const parseDate = (raw: unknown): Date | null => {
  if (typeof raw !== 'string' || !raw) return null;
  const d = new Date(raw);
  // Invalid date
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const parseCsv = (raw: unknown): string[] => {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
};

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const startDate = parseDate(req.query.startDate);
    const endDate = parseDate(req.query.endDate);
    const statuses = parseCsv(req.query.status);

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate ve endDate parametreleri zorunludur',
      });
    }

    // Permissions: project view şart; maintenance opsiyonel
    const user = req.user;
    const role = user?.role as string;
    const userPermissions = (user?.permissions || []) as string[];
    const canViewMaintenance =
      role === Role.ADMIN ||
      role === Role.FIRMA_SAHIBI ||
      hasPermission(role, Permission.MAINTENANCE_VIEW, userPermissions);

    // Proje filtreleri (tarih aralığı ile overlap)
    const projectQuery: Record<string, unknown> = {
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
    };
    if (statuses.length > 0) {
      // legacy -> yeni statü
      const normalized = statuses.map((s) => (s === 'PLANNING' ? 'PENDING_APPROVAL' : s));
      projectQuery.status = { $in: normalized };
    }

    const projects = await Project.find(projectQuery)
      .select('name status startDate endDate')
      .sort({ startDate: 1 })
      .lean();

    const maintenances = canViewMaintenance
      ? await Maintenance.find({
        scheduledDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
      })
        .populate('equipment', 'name')
        .select('scheduledDate status equipment type')
        .sort({ scheduledDate: 1 })
        .lean()
      : [];

    const events = [
      ...projects.map((p: unknown) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (p as any)._id.toString(),
        type: 'project' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (p as any).name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (p as any).status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        startDate: (p as any).startDate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endDate: (p as any).endDate || (p as any).startDate,
      })),
      ...maintenances.map((m: unknown) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (m as any)._id.toString(),
        type: 'maintenance' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: typeof (m as any).equipment === 'object' && (m as any).equipment ? ((m as any).equipment as any).name || 'Bakım' : 'Bakım',
        status: 'PENDING_APPROVAL', // frontend renkleriyle uyumlu
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        startDate: (m as any).scheduledDate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endDate: (m as any).scheduledDate,
      })),
    ];

    return res.status(200).json({
      success: true,
      events,
      range: { startDate, endDate },
      counts: {
        projects: projects.length,
        maintenances: maintenances.length,
        events: events.length,
      },
    });
  } catch (error) {
    logger.error('Calendar events hatası:', error);
    return res.status(500).json({ success: false, message: 'Takvim verileri alınamadı' });
  }
};

const toIcsDateTime = (d: Date) => {
  // YYYYMMDDTHHMMSSZ (UTC)
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mi = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
};

const toIcsDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  return `${yyyy}${mm}${dd}`;
};

const escapeIcsText = (s: string) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

/**
 * iCal export (ICS)
 * GET /api/calendar/ics?startDate=...&endDate=...
 */
export const exportCalendarIcs = async (req: Request, res: Response) => {
  try {
    const startDate = parseDate(req.query.startDate);
    const endDate = parseDate(req.query.endDate);
    const statuses = parseCsv(req.query.status);

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate ve endDate parametreleri zorunludur' });
    }

    const user = req.user;
    const role = user?.role as string;
    const userPermissions = (user?.permissions || []) as string[];
    const canViewMaintenance =
      role === Role.ADMIN ||
      role === Role.FIRMA_SAHIBI ||
      hasPermission(role, Permission.MAINTENANCE_VIEW, userPermissions);

    const projectQuery: Record<string, unknown> = {
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
    };
    if (statuses.length > 0) {
      const normalized = statuses.map((s) => (s === 'PLANNING' ? 'PENDING_APPROVAL' : s));
      projectQuery.status = { $in: normalized };
    }

    const projects = await Project.find(projectQuery).select('name status startDate endDate').sort({ startDate: 1 }).lean();

    const maintenances = canViewMaintenance
      ? await Maintenance.find({
        scheduledDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
      })
        .populate('equipment', 'name')
        .select('scheduledDate status equipment type')
        .sort({ scheduledDate: 1 })
        .lean()
      : [];

    const now = new Date();
    const calName = 'SK Production Takvim';
    const lines: string[] = [];
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//SKPRO//Calendar//TR');
    lines.push(`X-WR-CALNAME:${escapeIcsText(calName)}`);
    lines.push('CALSCALE:GREGORIAN');
    lines.push('METHOD:PUBLISH');

    const addAllDayEvent = (uid: string, summary: string, start: Date, endInclusive: Date, description?: string) => {
      // ICS'de DTEND non-inclusive; endInclusive +1 day
      const dtStart = toIcsDate(start);
      const dtEnd = toIcsDate(new Date(Date.UTC(endInclusive.getUTCFullYear(), endInclusive.getUTCMonth(), endInclusive.getUTCDate() + 1)));
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${toIcsDateTime(now)}`);
      lines.push(`SUMMARY:${escapeIcsText(summary)}`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
      lines.push('END:VEVENT');
    };

    projects.forEach((p: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const start = new Date((p as any).startDate as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const end = new Date(((p as any).endDate || (p as any).startDate) as any);
      addAllDayEvent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `project-${(p as any)._id}@skpro`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `[Proje] ${(p as any).name}`,
        start,
        end,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `Durum: ${(p as any).status}`
      );
    });

    maintenances.forEach((m: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const date = new Date((m as any).scheduledDate as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eqName = typeof (m as any).equipment === 'object' && (m as any).equipment ? ((m as any).equipment as any).name || 'Ekipman' : 'Ekipman';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addAllDayEvent(`maintenance-${(m as any)._id}@skpro`, `[Bakım] ${eqName}`, date, date, `Tip: ${(m as any).type || ''}`);
    });

    lines.push('END:VCALENDAR');

    const body = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="skpro-calendar.ics"');
    return res.status(200).send(body);
  } catch (error) {
    logger.error('Calendar iCal export hatası:', error);
    return res.status(500).json({ success: false, message: 'iCal export başarısız' });
  }
};

/**
 * iCal import (ICS)
 * POST /api/calendar/import
 * Body: { file: File (multipart/form-data) }
 */
export const importCalendarIcs = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'iCal dosyası yüklenmedi' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split(/\r?\n/);

    // iCal parse
    const events: Array<{
      summary: string;
      startDate: Date;
      endDate: Date;
      description?: string;
      type?: 'project' | 'maintenance';
    }> = [];

    let currentEvent: { summary?: string; startDate?: Date; endDate?: Date; description?: string; type?: 'project' | 'maintenance' } | null = null;
    let inEvent = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT') {
        if (currentEvent && currentEvent.summary && currentEvent.startDate) {
          // DTEND yoksa DTSTART + 1 gün
          if (!currentEvent.endDate) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const start = new Date(currentEvent.startDate as any);
            start.setDate(start.getDate() + 1);
            currentEvent.endDate = start;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((currentEvent.summary as string).includes('[Proje]') || (currentEvent.summary as string).includes('[Project]')) {
            currentEvent.type = 'project';
            currentEvent.summary = (currentEvent.summary as string).replace(/\[Proje\]|\[Project\]/g, '').trim();
          } else if ((currentEvent.summary as string).includes('[Bakım]') || (currentEvent.summary as string).includes('[Maintenance]')) {
            currentEvent.type = 'maintenance';
            currentEvent.summary = (currentEvent.summary as string).replace(/\[Bakım\]|\[Maintenance\]/g, '').trim();
          } else {
            // Varsayılan olarak proje
            currentEvent.type = 'project';
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          events.push(currentEvent as any);
        }
        inEvent = false;
        currentEvent = null;
      } else if (inEvent && currentEvent) {
        // SUMMARY
        if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = unescapeIcsText(line.substring(8));
        }
        // DTSTART
        else if (line.startsWith('DTSTART')) {
          const dateStr = line.includes('VALUE=DATE:')
            ? line.substring(line.indexOf('VALUE=DATE:') + 11)
            : line.substring(line.indexOf(':') + 1);
          currentEvent.startDate = parseIcsDate(dateStr);
        }
        // DTEND
        else if (line.startsWith('DTEND')) {
          const dateStr = line.includes('VALUE=DATE:')
            ? line.substring(line.indexOf('VALUE=DATE:') + 11)
            : line.substring(line.indexOf(':') + 1);
          currentEvent.endDate = parseIcsDate(dateStr);
        }
        // DESCRIPTION
        else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = unescapeIcsText(line.substring(12));
        }
      }
    }

    if (events.length === 0) {
      return res.status(400).json({ success: false, message: 'iCal dosyasında geçerli etkinlik bulunamadı' });
    }

    // Permissions kontrolü
    const user = req.user;
    const role = user?.role as string;
    const userPermissions = (user?.permissions || []) as string[];
    const canCreateProject =
      role === Role.ADMIN ||
      role === Role.FIRMA_SAHIBI ||
      hasPermission(role, Permission.PROJECT_CREATE, userPermissions);
    const canCreateMaintenance =
      role === Role.ADMIN ||
      role === Role.FIRMA_SAHIBI ||
      hasPermission(role, Permission.MAINTENANCE_CREATE, userPermissions);

    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      projects: [] as unknown[],
      maintenances: [] as unknown[],
    };

    // Client model'ini import et (proje oluşturmak için)
    const Client = (await import('../models')).Client;

    // Varsayılan client bul veya oluştur (iCal import için)
    let defaultClient = await Client.findOne({ name: 'iCal Import' });
    if (!defaultClient) {
      defaultClient = await Client.create({
        name: 'iCal Import',
        email: 'import@skproduction.com',
        phone: '',
        address: '',
        notes: 'iCal import ile otomatik oluşturuldu',
      });
    }

    for (const event of events) {
      try {
        if (event.type === 'project' && canCreateProject) {
          // Proje oluştur
          const project = await Project.create({
            name: event.summary || 'İsimsiz Proje',
            description: event.description || 'iCal import ile oluşturuldu',
            startDate: event.startDate,
            endDate: event.endDate,
            status: 'APPROVED', // Import edilen projeler onaylanmış olarak eklenir
            location: '',
            client: defaultClient._id,
            team: [],
            equipment: [],
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result.projects.push(project as any);
          result.success++;
        } else if (event.type === 'maintenance' && canCreateMaintenance) {
          // Bakım oluştur (ekipman bulunamazsa atlanır)
          // Bakım için ekipman gerekli, bu yüzden sadece proje oluşturuyoruz
          // İleride ekipman eşleştirme eklenebilir
          result.failed++;
          result.errors.push(`${event.summary}: Bakım için ekipman gerekli (şimdilik atlandı)`);
        } else {
          result.failed++;
          result.errors.push(`${event.summary}: Yetki yetersiz`);
        }
      } catch (error: unknown) {
        const appError = error as AppError;
        result.failed++;
        result.errors.push(`${event.summary}: ${appError?.message || (error as Error)?.message || 'Bilinmeyen hata'}`);
        logger.error('iCal import event oluşturma hatası:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: `${result.success} etkinlik başarıyla içe aktarıldı, ${result.failed} etkinlik başarısız`,
      result,
    });
  } catch (error) {
    logger.error('Calendar iCal import hatası:', error);
    return res.status(500).json({ success: false, message: 'iCal import başarısız' });
  }
};

/**
 * iCal date parse (YYYYMMDD veya YYYYMMDDTHHMMSSZ formatı)
 */
const parseIcsDate = (dateStr: string): Date => {
  // YYYYMMDD formatı
  if (dateStr.length === 8) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 0-indexed
    const day = parseInt(dateStr.substring(6, 8), 10);
    return new Date(Date.UTC(year, month, day));
  }
  // YYYYMMDDTHHMMSSZ formatı
  else if (dateStr.length >= 15 && dateStr.includes('T')) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = dateStr.length > 9 ? parseInt(dateStr.substring(9, 11), 10) : 0;
    const minute = dateStr.length > 11 ? parseInt(dateStr.substring(11, 13), 10) : 0;
    const second = dateStr.length > 13 ? parseInt(dateStr.substring(13, 15), 10) : 0;
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  // Fallback: Date.parse
  return new Date(dateStr);
};

/**
 * iCal text unescape
 */
const unescapeIcsText = (text: string): string => {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
};

// --- Google & Outlook OAuth API ---

export const getGoogleAuthUrl = (req: Request, res: Response) => {
  try {
    const url = googleCalendarService.getAuthUrl();
    res.json({ url });
  } catch (error: unknown) {
    logger.error('Error generating Google Auth URL', { error: (error as Error).message });
    res.status(500).json({ message: 'URL oluşturulamadı' });
  }
};

export const getOutlookAuthUrl = (req: Request, res: Response) => {
  try {
    const url = outlookCalendarService.getAuthUrl();
    res.json({ url });
  } catch (error: unknown) {
    logger.error('Error generating Outlook Auth URL', { error: (error as Error).message });
    res.status(500).json({ message: 'URL oluşturulamadı' });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!.id; // Assuming auth middleware

    if (!code || !userId) {
      return res.status(400).json({ message: 'Geçersiz istek' });
    }

    const tokens = await googleCalendarService.getTokens(code as string);

    await User.findByIdAndUpdate(userId, {
      googleTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: Date.now() + ((tokens.expires_in as number) * 1000)
      }
    });

    res.json({ message: 'Google Takvim başarıyla bağlandı' });
  } catch (error: unknown) {
    logger.error('Google Callback Error', { error: (error as Error).message });
    res.status(500).json({ message: 'Takvim bağlantısı başarısız' });
  }
};

export const outlookCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!.id;

    if (!code || !userId) {
      return res.status(400).json({ message: 'Geçersiz istek' });
    }

    const tokens = await outlookCalendarService.getTokens(code as string);

    await User.findByIdAndUpdate(userId, {
      outlookTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: Date.now() + ((tokens.expires_in as number) * 1000)
      }
    });

    res.json({ message: 'Outlook Takvim başarıyla bağlandı' });
  } catch (error: unknown) {
    logger.error('Outlook Callback Error', { error: (error as Error).message });
    res.status(500).json({ message: 'Takvim bağlantısı başarısız' });
  }
};

export const getCalendarStatus = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('+googleTokens +outlookTokens');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      googleConnected: !!user.googleTokens?.refreshToken,
      outlookConnected: !!user.outlookTokens?.refreshToken
    });
  } catch (error: unknown) {
    logger.error('Status Error', { error: (error as Error).message });
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
