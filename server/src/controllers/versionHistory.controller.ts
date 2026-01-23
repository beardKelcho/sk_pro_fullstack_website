import { Request, Response } from 'express';
import { AppError } from '../types/common';
import mongoose from 'mongoose';
import { VersionHistory } from '../models';
import { getVersionHistory, rollbackToVersion } from '../utils/versionHistory';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';

/**
 * Resource'un versiyon geçmişini getir
 */
export const getResourceVersionHistory = async (req: Request, res: Response) => {
  try {
    const { resource, resourceId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!['Equipment', 'Project', 'Task', 'Client', 'Maintenance'].includes(resource)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz resource tipi',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz resource ID',
      });
    }

    const result = await getVersionHistory(
      resource as 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance',
      new mongoose.Types.ObjectId(resourceId),
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Versiyon geçmişi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Versiyon geçmişi getirilemedi',
    });
  }
};

/**
 * Belirli bir versiyonu getir
 */
export const getVersionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const version = await VersionHistory.findById(id)
      .populate('changedBy', 'name email')
      .lean();

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Versiyon bulunamadı',
      });
    }

    res.status(200).json({
      success: true,
      version,
    });
  } catch (error) {
    logger.error('Versiyon getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Versiyon getirilemedi',
    });
  }
};

/**
 * Belirli bir versiyona rollback yap
 */
export const rollbackVersion = async (req: Request, res: Response) => {
  try {
    const { resource, resourceId, version } = req.params;

    if (!['Equipment', 'Project', 'Task', 'Client', 'Maintenance'].includes(resource)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz resource tipi',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz resource ID',
      });
    }

    const versionNumber = parseInt(version);
    if (isNaN(versionNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz versiyon numarası',
      });
    }

    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bilgisi bulunamadı',
      });
    }

    await rollbackToVersion(
      resource as 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance',
      new mongoose.Types.ObjectId(resourceId),
      versionNumber,
      userId
    );

    await logAction(req, 'UPDATE', resource as any, resourceId, [
      {
        field: 'rollback',
        oldValue: 'current',
        newValue: `version ${versionNumber}`,
      },
    ]);

    res.status(200).json({
      success: true,
      message: `Versiyon ${versionNumber}'a rollback yapıldı`,
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    logger.error('Rollback hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || 'Rollback yapılamadı',
    });
  }
};

