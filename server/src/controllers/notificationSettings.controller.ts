import { Request, Response } from 'express';
import NotificationSettings from '../models/NotificationSettings';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';

/**
 * Kullanıcının bildirim ayarlarını getir
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    let settings = await NotificationSettings.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Ayarlar yoksa varsayılan ayarlarla oluştur
    if (!settings) {
      settings = await NotificationSettings.create({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    logger.error('Bildirim ayarları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim ayarları getirilirken bir hata oluştu',
    });
  }
};

/**
 * Kullanıcının bildirim ayarlarını güncelle
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const {
      pushEnabled,
      pushTypes,
      emailEnabled,
      emailTypes,
      inAppEnabled,
    } = req.body;

    let settings = await NotificationSettings.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!settings) {
      // Yeni ayarlar oluştur
      settings = await NotificationSettings.create({
        userId: new mongoose.Types.ObjectId(userId),
        pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
        pushTypes: pushTypes || {},
        emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
        emailTypes: emailTypes || {},
        inAppEnabled: inAppEnabled !== undefined ? inAppEnabled : true,
      });

      await logAction(req, 'CREATE', 'NotificationSettings', settings._id.toString());
    } else {
      // Mevcut ayarları güncelle
      if (pushEnabled !== undefined) {
        settings.pushEnabled = pushEnabled;
      }
      if (pushTypes) {
        settings.pushTypes = { ...settings.pushTypes, ...pushTypes };
      }
      if (emailEnabled !== undefined) {
        settings.emailEnabled = emailEnabled;
      }
      if (emailTypes) {
        settings.emailTypes = { ...settings.emailTypes, ...emailTypes };
      }
      if (inAppEnabled !== undefined) {
        settings.inAppEnabled = inAppEnabled;
      }

      await settings.save();
      await logAction(req, 'UPDATE', 'NotificationSettings', settings._id.toString());
    }

    res.status(200).json({
      success: true,
      message: 'Bildirim ayarları güncellendi',
      settings,
    });
  } catch (error) {
    logger.error('Bildirim ayarları güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim ayarları güncellenirken bir hata oluştu',
    });
  }
};

