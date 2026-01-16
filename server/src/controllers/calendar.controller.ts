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

