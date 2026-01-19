import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription';
import logger from './logger';

let vapidConfigured = false;
let vapidMissingLogged = false;

const ensureVapidConfigured = (): boolean => {
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:info@skpro.com.tr';
  const isProd = process.env.NODE_ENV === 'production';

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    if (!vapidMissingLogged) {
      vapidMissingLogged = true;
      // Dev ortamında push opsiyonel: warn yerine info (log gürültüsünü azalt).
      const msg = 'VAPID keys ayarlanmamış. Push notification gönderilemeyecek.';
      if (isProd) logger.warn(msg);
      else logger.info(msg);
    }
    return false;
  }

  if (!vapidConfigured) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
  }

  return true;
};

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Kullanıcıya push notification gönder
 */
export const sendPushNotification = async (
  userId: string,
  payload: PushNotificationPayload
): Promise<boolean> => {
  try {
    if (!ensureVapidConfigured()) {
      return false;
    }

    // Kullanıcının tüm subscription'larını al
    const subscriptions = await PushSubscription.find({ userId });

    if (subscriptions.length === 0) {
      logger.debug(`Kullanıcı ${userId} için push subscription bulunamadı`);
      return false;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/images/sk-logo.png',
      badge: payload.badge || '/images/sk-logo.png',
      data: payload.data || {},
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
    });

    // Tüm subscription'lara gönder
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
              },
            },
            notificationPayload
          );
          return true;
        } catch (error: any) {
          // Subscription geçersizse sil
          if (error.statusCode === 410 || error.statusCode === 404) {
            logger.info(`Geçersiz subscription siliniyor: ${subscription._id}`);
            await PushSubscription.findByIdAndDelete(subscription._id);
          } else {
            logger.error(`Push notification gönderme hatası:`, error);
          }
          return false;
        }
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    logger.info(`Push notification gönderildi: ${successCount}/${subscriptions.length} başarılı`);

    return successCount > 0;
  } catch (error) {
    logger.error('Push notification gönderme hatası:', error);
    return false;
  }
};

/**
 * Çoklu kullanıcıya push notification gönder
 */
export const sendPushNotificationToUsers = async (
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> => {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushNotification(userId, payload))
  );

  const success = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.length - success;

  return { success, failed };
};

/**
 * Tüm kullanıcılara push notification gönder (broadcast)
 */
export const broadcastPushNotification = async (
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> => {
  try {
    if (!ensureVapidConfigured()) {
      return { success: 0, failed: 0 };
    }

    const subscriptions = await PushSubscription.find({});

    if (subscriptions.length === 0) {
      logger.debug('Hiç push subscription bulunamadı');
      return { success: 0, failed: 0 };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/images/sk-logo.png',
      badge: payload.badge || '/images/sk-logo.png',
      data: payload.data || {},
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
              },
            },
            notificationPayload
          );
          return true;
        } catch (error: any) {
          // Subscription geçersizse sil
          if (error.statusCode === 410 || error.statusCode === 404) {
            logger.info(`Geçersiz subscription siliniyor: ${subscription._id}`);
            await PushSubscription.findByIdAndDelete(subscription._id);
          } else {
            logger.error(`Push notification gönderme hatası:`, error);
          }
          return false;
        }
      })
    );

    const success = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - success;

    logger.info(`Broadcast push notification: ${success}/${subscriptions.length} başarılı`);

    return { success, failed };
  } catch (error) {
    logger.error('Broadcast push notification hatası:', error);
    return { success: 0, failed: 0 };
  }
};

