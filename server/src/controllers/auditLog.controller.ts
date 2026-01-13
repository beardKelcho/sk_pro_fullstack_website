import { Request, Response } from 'express';
import { getAuditLogs } from '../utils/auditLogger';
import logger from '../utils/logger';

// Aktivite loglarını getir
export const getAuditLogsController = async (req: Request, res: Response) => {
  try {
    const {
      user,
      resource,
      resourceId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const filters: any = {};

    if (user) {
      filters.user = user as string;
    }

    if (resource) {
      filters.resource = resource as string;
    }

    if (resourceId) {
      filters.resourceId = resourceId as string;
    }

    if (action) {
      filters.action = action as string;
    }

    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }

    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }

    const result = await getAuditLogs({
      ...filters,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Aktivite logları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktivite logları getirilirken bir hata oluştu',
    });
  }
};

// Belirli bir kaynağın aktivite geçmişini getir
export const getResourceAuditHistory = async (req: Request, res: Response) => {
  try {
    const { resource, resourceId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await getAuditLogs({
      resource: resource as any,
      resourceId: resourceId,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Kaynak aktivite geçmişi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktivite geçmişi getirilirken bir hata oluştu',
    });
  }
};

