import { Request, Response } from 'express';
import logger from '../utils/logger';
import { sendPushNotification, sendPushNotificationToUsers, broadcastPushNotification } from '../utils/pushNotificationService';

/**
 * VAPID public key'i getir (frontend için)
 */
export const getVapidPublicKey = async (req: Request, res: Response) => {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    
    if (!publicKey) {
      return res.status(503).json({
        success: false,
        message: 'VAPID keys yapılandırılmamış',
      });
    }

    res.status(200).json({
      success: true,
      publicKey,
    });
  } catch (error) {
    logger.error('VAPID public key getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'VAPID public key getirilemedi',
    });
  }
};

/**
 * Test push notification gönder (sadece admin için)
 */
export const sendTestPushNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const success = await sendPushNotification(String(userId), {
      title: 'Test Bildirimi',
      body: 'Bu bir test bildirimidir. Push notification sistemi çalışıyor!',
      icon: '/images/sk-logo.png',
      badge: '/images/sk-logo.png',
      data: {
        type: 'SYSTEM',
        test: true,
      },
      tag: 'test',
    });

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Test bildirimi gönderildi',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Test bildirimi gönderilemedi. Push subscription bulunamadı.',
      });
    }
  } catch (error) {
    logger.error('Test push notification gönderme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Test bildirimi gönderilirken bir hata oluştu',
    });
  }
};

