import { Request, Response } from 'express';
import { Session } from '../models';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';

/**
 * Kullanıcının aktif oturumlarını getir
 */
export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;

    const sessions = await Session.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastActivity: -1 })
      .lean();

    res.status(200).json({
      success: true,
      sessions: sessions.map((session: any) => ({
        _id: session._id,
        deviceInfo: session.deviceInfo,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })),
    });
  } catch (error) {
    logger.error('Aktif oturumlar getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif oturumlar getirilemedi',
    });
  }
};

/**
 * Belirli bir oturumu sonlandır
 */
export const terminateSession = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Oturum bulunamadı',
      });
    }

    await Session.updateOne(
      { _id: sessionId },
      { isActive: false }
    );

    await logAction(req, 'UPDATE', 'Session', sessionId, [
      {
        field: 'isActive',
        oldValue: true,
        newValue: false,
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Oturum sonlandırıldı',
    });
  } catch (error) {
    logger.error('Oturum sonlandırma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Oturum sonlandırılamadı',
    });
  }
};

/**
 * Tüm oturumları sonlandır (mevcut hariç)
 */
export const terminateAllOtherSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const currentToken = req.headers.authorization?.split(' ')[1];

    if (!currentToken) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut token bulunamadı',
      });
    }

    const crypto = require('crypto');
    const currentTokenHash = crypto.createHash('sha256').update(currentToken).digest('hex');

    const result = await Session.updateMany(
      {
        userId,
        token: { $ne: currentTokenHash },
        isActive: true,
      },
      {
        isActive: false,
      }
    );

    await logAction(req, 'UPDATE', 'Session', 'all', [
      {
        field: 'terminateAll',
        oldValue: 'active',
        newValue: 'terminated',
      },
    ]);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} oturum sonlandırıldı`,
      terminatedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('Tüm oturumları sonlandırma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Oturumlar sonlandırılamadı',
    });
  }
};

/**
 * Session activity güncelle (middleware için)
 */
export const updateSessionActivity = async (userId: string, token: string): Promise<void> => {
  try {
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await Session.updateOne(
      { userId, token: tokenHash, isActive: true },
      { lastActivity: new Date() }
    );
  } catch (error) {
    logger.error('Session activity güncelleme hatası:', error);
    // Hata olsa bile devam et
  }
};

