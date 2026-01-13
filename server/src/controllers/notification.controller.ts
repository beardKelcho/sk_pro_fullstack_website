import { Request, Response } from 'express';
import { Notification } from '../models';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Kullanıcının tüm bildirimlerini getir
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }
    
    const { read, type, page = 1, limit = 20 } = req.query;
    
    const filters: any = { userId };
    
    if (read !== undefined) {
      filters.read = read === 'true';
    }
    
    if (type) {
      filters.type = type;
    }
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Notification.countDocuments(filters),
      Notification.countDocuments({ userId, read: false })
    ]);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      notifications,
    });
  } catch (error) {
    logger.error('Bildirimleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilirken bir hata oluştu',
    });
  }
};

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz bildirim ID',
      });
    }
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    logger.error('Bildirim okundu işaretleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim güncellenirken bir hata oluştu',
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }
    
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} bildirim okundu olarak işaretlendi`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler güncellenirken bir hata oluştu',
    });
  }
};

// Bildirimi sil
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz bildirim ID',
      });
    }
    
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bildirim başarıyla silindi',
    });
  } catch (error) {
    logger.error('Bildirim silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim silinirken bir hata oluştu',
    });
  }
};

// Okunmamış bildirim sayısını getir
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }
    
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    
    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    logger.error('Okunmamış bildirim sayısı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış bildirim sayısı alınırken bir hata oluştu',
    });
  }
};

