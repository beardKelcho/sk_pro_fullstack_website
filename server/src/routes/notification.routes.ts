import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Bildirimleri getir
router.get('/', getUserNotifications);

// Okunmamış bildirim sayısı
router.get('/unread-count', getUnreadCount);

// Bildirimi okundu olarak işaretle
router.patch('/:id/read', markNotificationAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.patch('/read-all', markAllNotificationsAsRead);

// Bildirimi sil
router.delete('/:id', deleteNotification);

export default router;

