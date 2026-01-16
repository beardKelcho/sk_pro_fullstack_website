import { Notification, User, NotificationSettings } from '../models';
import { sendEmail } from './emailService';
import logger from './logger';
import mongoose from 'mongoose';
import { sendPushNotification } from './pushNotificationService';
import { sendToUser } from './realtime/realtimeHub';

export interface CreateNotificationParams {
  userId: mongoose.Types.ObjectId | string;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'PROJECT_STARTED' | 'PROJECT_UPDATED' | 'PROJECT_COMPLETED' | 'MAINTENANCE_REMINDER' | 'MAINTENANCE_DUE' | 'EQUIPMENT_ASSIGNED' | 'USER_INVITED' | 'SYSTEM';
  title: string;
  message: string;
  data?: any;
  sendEmail?: boolean;
  emailSubject?: string;
}

// Bildirim oluştur ve gönder
export const createNotification = async (params: CreateNotificationParams): Promise<any> => {
  try {
    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      read: false,
    });

    // Real-time (SSE) bildirim (web/panel için)
    try {
      sendToUser(String(params.userId), 'notification:new', {
        _id: notification._id?.toString?.() || undefined,
        userId: String(params.userId),
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data || {},
        createdAt: (notification as any)?.createdAt || new Date().toISOString(),
      });
    } catch {
      // realtime hatası bildirimi engellemez
    }

    // Push notification gönder (kullanıcı ayarlarına göre)
    try {
      const settings = await NotificationSettings.findOne({ userId: params.userId });
      
      // Kullanıcı push notification'ları aktif etmişse ve bu tip için izin vermişse gönder
      if (
        (!settings || settings.pushEnabled) &&
        (!settings || !settings.pushTypes || settings.pushTypes[params.type] !== false)
      ) {
        await sendPushNotification(String(params.userId), {
          title: params.title,
          body: params.message,
          data: {
            notificationId: notification._id.toString(),
            type: params.type,
            ...params.data,
          },
          tag: params.type,
          requireInteraction: params.type === 'MAINTENANCE_DUE' || params.type === 'TASK_ASSIGNED',
          actions: [
            {
              action: 'view',
              title: 'Görüntüle',
            },
            {
              action: 'dismiss',
              title: 'Kapat',
            },
          ],
        });
      }
    } catch (pushError) {
      logger.error('Push notification gönderme hatası:', pushError);
      // Push hatası bildirimi engellemez
    }

    // Email gönder (kullanıcı ayarlarına göre)
    const shouldSendEmail = params.sendEmail || false;
    if (shouldSendEmail) {
      try {
        const settings = await NotificationSettings.findOne({ userId: params.userId });
        
        // Kullanıcı email notification'ları aktif etmişse ve bu tip için izin vermişse gönder
        if (
          (!settings || settings.emailEnabled) &&
          (!settings || !settings.emailTypes || settings.emailTypes[params.type] !== false)
        ) {
          const user = await User.findById(params.userId);
          if (user && user.email) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0066CC;">${params.title}</h2>
              <p>${params.message}</p>
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/notifications" 
                   style="background-color: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Bildirimleri Görüntüle
                </a>
              </p>
              <p>İyi çalışmalar,<br>SK Production</p>
            </div>
          `;
          
          await sendEmail(
            user.email,
            params.emailSubject || params.title,
            emailHtml
          );
          }
        }
      } catch (emailError) {
        logger.error('Bildirim email gönderme hatası:', emailError);
        // Email hatası bildirimi engellemez
      }
    }

    return notification;
  } catch (error) {
    logger.error('Bildirim oluşturma hatası:', error);
    throw error;
  }
};

// Kullanıcıya bildirim gönder
export const notifyUser = async (
  userId: mongoose.Types.ObjectId | string,
  type: CreateNotificationParams['type'],
  title: string,
  message: string,
  data?: any,
  sendEmail = false
): Promise<any> => {
  return createNotification({
    userId,
    type,
    title,
    message,
    data,
    sendEmail,
  });
};

// Çoklu kullanıcıya bildirim gönder
export const notifyUsers = async (
  userIds: (mongoose.Types.ObjectId | string)[],
  type: CreateNotificationParams['type'],
  title: string,
  message: string,
  data?: any,
  sendEmail = false
): Promise<any[]> => {
  const notifications = await Promise.all(
    userIds.map(userId =>
      createNotification({
        userId,
        type,
        title,
        message,
        data,
        sendEmail,
      })
    )
  );

  return notifications;
};

// Proje ekibine bildirim gönder
export const notifyProjectTeam = async (
  teamMemberIds: (mongoose.Types.ObjectId | string)[],
  type: CreateNotificationParams['type'],
  title: string,
  message: string,
  projectId?: string,
  sendEmail = false
): Promise<any[]> => {
  return notifyUsers(
    teamMemberIds,
    type,
    title,
    message,
    { projectId },
    sendEmail
  );
};

