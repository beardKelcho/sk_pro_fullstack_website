import { Request, Response } from 'express';
import { AppError } from '../types/common';
import { ReportSchedule } from '../models';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';
import cron from 'node-cron';
import { sendEmail } from '../utils/emailService';

/**
 * Tüm rapor zamanlamalarını getir
 */
export const getReportSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await ReportSchedule.find({ createdBy: req.user?.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    logger.error('Rapor zamanlamaları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor zamanlamaları getirilemedi',
    });
  }
};

/**
 * Tek bir rapor zamanlamasını getir
 */
export const getReportScheduleById = async (req: Request, res: Response) => {
  try {
    const schedule = await ReportSchedule.findOne({
      _id: req.params.id,
      createdBy: req.user?.id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Rapor zamanlaması bulunamadı',
      });
    }

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    logger.error('Rapor zamanlaması getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor zamanlaması getirilemedi',
    });
  }
};

/**
 * Yeni rapor zamanlaması oluştur
 */
export const createReportSchedule = async (req: Request, res: Response) => {
  try {
    const { name, type, reportType, recipients, schedule, filters, format } = req.body;

    if (!name || !type || !reportType || !recipients || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik',
      });
    }

    // Cron expression oluştur
    const cronExpression = generateCronExpression(schedule);
    if (!cronExpression) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz zamanlama ayarları',
      });
    }

    // Next run date hesapla
    const nextRun = calculateNextRun(schedule);

    const reportSchedule = await ReportSchedule.create({
      name,
      type,
      reportType,
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      schedule: {
        ...schedule,
        cronExpression,
      },
      filters: filters || {},
      format: format || 'PDF',
      isActive: true,
      nextRun,
      createdBy: req.user?.id,
    });

    // Scheduled task'ı başlat
    startScheduledReport(reportSchedule);

    await logAction(req, 'CREATE', 'ReportSchedule', reportSchedule._id.toString());

    res.status(201).json({
      success: true,
      schedule: reportSchedule,
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    logger.error('Rapor zamanlaması oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || 'Rapor zamanlaması oluşturulamadı',
    });
  }
};

/**
 * Rapor zamanlamasını güncelle
 */
export const updateReportSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await ReportSchedule.findOne({
      _id: req.params.id,
      createdBy: req.user?.id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Rapor zamanlaması bulunamadı',
      });
    }

    const { name, recipients, schedule: scheduleData, filters, format, isActive } = req.body;

    if (scheduleData) {
      const cronExpression = generateCronExpression(scheduleData);
      if (!cronExpression) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz zamanlama ayarları',
        });
      }

      schedule.schedule = {
        ...schedule.schedule,
        ...scheduleData,
        cronExpression,
      };
      schedule.nextRun = calculateNextRun(scheduleData);
    }

    if (name) schedule.name = name;
    if (recipients) schedule.recipients = Array.isArray(recipients) ? recipients : [recipients];
    if (filters) schedule.filters = filters;
    if (format) schedule.format = format;
    if (typeof isActive === 'boolean') schedule.isActive = isActive;

    await schedule.save();

    // Scheduled task'ı yeniden başlat
    if (schedule.isActive) {
      startScheduledReport(schedule);
    }

    await logAction(req, 'UPDATE', 'ReportSchedule', schedule._id.toString());

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    logger.error('Rapor zamanlaması güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || 'Rapor zamanlaması güncellenemedi',
    });
  }
};

/**
 * Rapor zamanlamasını sil
 */
export const deleteReportSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await ReportSchedule.findOne({
      _id: req.params.id,
      createdBy: req.user?.id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Rapor zamanlaması bulunamadı',
      });
    }

    await ReportSchedule.deleteOne({ _id: schedule._id });

    await logAction(req, 'DELETE', 'ReportSchedule', schedule._id.toString());

    res.status(200).json({
      success: true,
      message: 'Rapor zamanlaması silindi',
    });
  } catch (error) {
    logger.error('Rapor zamanlaması silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor zamanlaması silinemedi',
    });
  }
};

/**
 * Cron expression oluştur
 */
const generateCronExpression = (schedule: { frequency?: string; dayOfWeek?: number; dayOfMonth?: number; time?: string;[key: string]: unknown }): string | null => {
  const { frequency, dayOfWeek, dayOfMonth, time } = schedule;

  if (!time) return null;

  const [hours, minutes] = time.split(':').map(Number);

  if (frequency === 'WEEKLY' && dayOfWeek !== undefined) {
    // Her hafta belirli bir gün, belirli saatte
    return `${minutes} ${hours} * * ${dayOfWeek}`;
  } else if (frequency === 'MONTHLY' && dayOfMonth !== undefined) {
    // Her ay belirli bir gün, belirli saatte
    return `${minutes} ${hours} ${dayOfMonth} * *`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if ((schedule as any).cronExpression) {
    // Custom cron expression
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (schedule as any).cronExpression;
  }

  return null;
};

/**
 * Next run date hesapla
 */
const calculateNextRun = (schedule: { frequency?: string; dayOfWeek?: number; dayOfMonth?: number; time?: string;[key: string]: unknown }): Date => {
  const { frequency, dayOfWeek, dayOfMonth, time } = schedule;
  const now = new Date();
  const [hours, minutes] = time ? time.split(':').map(Number) : [9, 0];

  if (frequency === 'WEEKLY' && dayOfWeek !== undefined) {
    const nextRun = new Date(now);
    const currentDay = nextRun.getDay();
    const daysUntilNext = (dayOfWeek - currentDay + 7) % 7 || 7;
    nextRun.setDate(nextRun.getDate() + daysUntilNext);
    nextRun.setHours(hours, minutes, 0, 0);
    return nextRun;
  } else if (frequency === 'MONTHLY' && dayOfMonth !== undefined) {
    const nextRun = new Date(now);
    nextRun.setDate(dayOfMonth);
    nextRun.setHours(hours, minutes, 0, 0);
    if (nextRun < now) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }
    return nextRun;
  }

  // Default: yarın saat 9:00
  const nextRun = new Date(now);
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(9, 0, 0, 0);
  return nextRun;
};

/**
 * Scheduled report task'ı başlat
 */
const startScheduledReport = (schedule: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(schedule as any).schedule?.cronExpression) return;

  // Mevcut task'ı durdur (eğer varsa)
  // Not: Gerçek implementasyonda task ID'leri saklamak gerekir

  // Yeni task başlat
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cron.schedule((schedule as any).schedule.cronExpression, async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.info(`Rapor zamanlaması çalıştırılıyor: ${(schedule as any).name}`);

      // Rapor oluştur (export controller kullan)
      // Bu kısım export controller'a göre implement edilmeli
      // Şimdilik placeholder

      // Email gönder
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reportUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/reports/${(schedule as any)._id}`;

      await sendEmail(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (schedule as any).recipients,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `SK Production - ${(schedule as any).name}`,
        `
          <h2>Otomatik Rapor</h2>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <p>${(schedule as Record<string, unknown>).name} raporu hazırlandı.</p>
          <p>Raporu görüntülemek için <a href="${reportUrl}">buraya tıklayın</a>.</p>
        `
      );

      // Last sent güncelle
      await ReportSchedule.updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _id: (schedule as any)._id },
        {
          lastSent: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nextRun: calculateNextRun((schedule as any).schedule),
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.info(`Rapor zamanlaması tamamlandı: ${(schedule as any).name}`);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.error(`Rapor zamanlaması hatası: ${(schedule as any).name}`, error);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger.info(`Rapor zamanlaması başlatıldı: ${(schedule as any).name}`);
};

/**
 * Tüm aktif rapor zamanlamalarını başlat (server başlangıcında)
 */
export const startAllScheduledReports = async () => {
  try {
    const activeSchedules = await ReportSchedule.find({ isActive: true });

    for (const schedule of activeSchedules) {
      startScheduledReport(schedule);
    }

    logger.info(`${activeSchedules.length} aktif rapor zamanlaması başlatıldı`);
  } catch (error) {
    logger.error('Rapor zamanlamaları başlatma hatası:', error);
  }
};

