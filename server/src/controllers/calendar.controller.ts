import type { Request, Response } from 'express';
import { Maintenance, Project } from '../models';
import { hasPermission, Permission, Role } from '../config/permissions';
import logger from '../utils/logger';

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
    const user = req.user as any;
    const role = user?.role as string;
    const userPermissions = (user?.permissions || []) as string[];
    const canViewMaintenance =
      role === Role.ADMIN ||
      role === Role.FIRMA_SAHIBI ||
      hasPermission(role, Permission.MAINTENANCE_VIEW, userPermissions);

    // Proje filtreleri (tarih aralığı ile overlap)
    const projectQuery: any = {
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
      ...projects.map((p: any) => ({
        id: p._id.toString(),
        type: 'project' as const,
        name: p.name,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate || p.startDate,
      })),
      ...maintenances.map((m: any) => ({
        id: m._id.toString(),
        type: 'maintenance' as const,
        name: typeof m.equipment === 'object' && m.equipment ? m.equipment.name || 'Bakım' : 'Bakım',
        status: 'PENDING_APPROVAL', // frontend renkleriyle uyumlu
        startDate: m.scheduledDate,
        endDate: m.scheduledDate,
      })),
    ];

    return res.status(200).json({
      success: true,
      range: { startDate, endDate },
      counts: {
        projects: projects.length,
        maintenances: maintenances.length,
        events: events.length,
      },
      events,
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

    const user = req.user as any;
    const role = user?.role as string;
    const userPermissions = (user?.permissions || []) as string[];
    const canViewMaintenance =
      role === Role.ADMIN ||
      role === Role.FIRMA_SAHIBI ||
      hasPermission(role, Permission.MAINTENANCE_VIEW, userPermissions);

    const projectQuery: any = {
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

    projects.forEach((p: any) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate || p.startDate);
      addAllDayEvent(
        `project-${p._id}@skpro`,
        `[Proje] ${p.name}`,
        start,
        end,
        `Durum: ${p.status}`
      );
    });

    maintenances.forEach((m: any) => {
      const date = new Date(m.scheduledDate);
      const eqName = typeof m.equipment === 'object' && m.equipment ? m.equipment.name || 'Ekipman' : 'Ekipman';
      addAllDayEvent(`maintenance-${m._id}@skpro`, `[Bakım] ${eqName}`, date, date, `Tip: ${m.type || ''}`);
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
