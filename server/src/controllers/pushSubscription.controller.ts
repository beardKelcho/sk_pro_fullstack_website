import { Request, Response } from 'express';
import PushSubscription from '../models/PushSubscription';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';

/**
 * Push subscription kaydet
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint ve keys gereklidir',
      });
    }

    // Mevcut subscription'ı kontrol et
    const existingSubscription = await PushSubscription.findOne({ endpoint });

    if (existingSubscription) {
      // Mevcut subscription'ı güncelle
      existingSubscription.userId = new mongoose.Types.ObjectId(userId);
      existingSubscription.keys = keys;
      if (userAgent) {
        existingSubscription.userAgent = userAgent;
      }
      await existingSubscription.save();

      await logAction(req, 'UPDATE', 'PushSubscription', existingSubscription._id.toString());

      return res.status(200).json({
        success: true,
        message: 'Push subscription güncellendi',
        subscription: existingSubscription,
      });
    }

    // Yeni subscription oluştur
    const subscription = await PushSubscription.create({
      userId: new mongoose.Types.ObjectId(userId),
      endpoint,
      keys,
      userAgent: userAgent || req.headers['user-agent'],
    });

    await logAction(req, 'CREATE', 'PushSubscription', subscription._id.toString());

    res.status(201).json({
      success: true,
      message: 'Push subscription kaydedildi',
      subscription,
    });
  } catch (error) {
    logger.error('Push subscription kaydetme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Push subscription kaydedilirken bir hata oluştu',
    });
  }
};

/**
 * Push subscription sil
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const { endpoint } = req.body;

    if (endpoint) {
      // Belirli endpoint'i sil
      const subscription = await PushSubscription.findOneAndDelete({
        userId: new mongoose.Types.ObjectId(userId),
        endpoint,
      });

      if (subscription) {
        await logAction(req, 'DELETE', 'PushSubscription', subscription._id.toString());
      }
    } else {
      // Kullanıcının tüm subscription'larını sil
      const subscriptions = await PushSubscription.find({
        userId: new mongoose.Types.ObjectId(userId),
      });

      for (const subscription of subscriptions) {
        await logAction(req, 'DELETE', 'PushSubscription', subscription._id.toString());
      }

      await PushSubscription.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Push subscription silindi',
    });
  } catch (error) {
    logger.error('Push subscription silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Push subscription silinirken bir hata oluştu',
    });
  }
};

/**
 * Kullanıcının push subscription'larını getir
 */
export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const subscriptions = await PushSubscription.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).select('-keys.p256dh -keys.auth'); // Güvenlik için keys'leri gizle

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    logger.error('Push subscription listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Push subscription\'lar listelenirken bir hata oluştu',
    });
  }
};

