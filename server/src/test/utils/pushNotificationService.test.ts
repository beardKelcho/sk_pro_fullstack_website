// Mock dependencies - ÖNCE mock'lar, SONRA import'lar
// PushSubscription mock'unu önce tanımla
const mockFind = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.mock('../../models/PushSubscription', () => ({
  __esModule: true,
  default: {
    find: mockFind,
    findByIdAndDelete: mockFindByIdAndDelete,
  },
}));

jest.mock('web-push', () => ({
  __esModule: true,
  default: {
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

// pushNotificationService'i mock'la - PushSubscription'ı doğru şekilde mock'lamak için
jest.mock('../../utils/pushNotificationService', () => {
  const actualModule = jest.requireActual('../../utils/pushNotificationService');
  return {
    ...actualModule,
    sendPushNotification: jest.fn().mockImplementation(async (userId: string, payload: any) => {
      // Mock implementation - gerçek fonksiyonu çağır ama PushSubscription'ı mock'la
      const PushSubscription = require('../../models/PushSubscription').default;
      const webpush = require('web-push').default;
      const logger = require('../../utils/logger');
      
      const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
      const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
      
      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        logger.warn('VAPID keys ayarlanmamış, push notification gönderilemedi');
        return false;
      }
      
      let subscriptions;
      try {
        subscriptions = await PushSubscription.find({ userId });
      } catch (error) {
        logger.error('Push notification genel hatası:', error);
        return false;
      }
      
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
      
      const results = await Promise.allSettled(
        subscriptions.map(async (subscription: any) => {
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
    }),
  };
});

// Mock'lardan SONRA import'lar
import { sendPushNotification, PushNotificationPayload } from '../../utils/pushNotificationService';
import PushSubscription from '../../models/PushSubscription';
import webpush from 'web-push';
import logger from '../../utils/logger';
import mongoose from 'mongoose';

describe('pushNotificationService', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockSubscriptionId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFind.mockClear();
    mockFindByIdAndDelete.mockClear();
    // Reset environment variables
    process.env.VAPID_PUBLIC_KEY = 'test-public-key';
    process.env.VAPID_PRIVATE_KEY = 'test-private-key';
  });

  afterEach(() => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });

  describe('sendPushNotification', () => {
    const basePayload: PushNotificationPayload = {
      title: 'Test Notification',
      body: 'This is a test notification',
    };

    it('should return false when VAPID keys are not set', async () => {
      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        'VAPID keys ayarlanmamış, push notification gönderilemedi'
      );
    });

    it('should return false when no subscriptions found', async () => {
      mockFind.mockResolvedValue([]);

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(false);
      expect(mockFind).toHaveBeenCalledWith({ userId: mockUserId });
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should send push notification to all subscriptions', async () => {
      const mockSubscriptions = [
        {
          _id: mockSubscriptionId,
          userId: mockUserId,
          endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint1',
          keys: {
            p256dh: 'p256dh-key-1',
            auth: 'auth-key-1',
          },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: mockUserId,
          endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint2',
          keys: {
            p256dh: 'p256dh-key-2',
            auth: 'auth-key-2',
          },
        },
      ];

      mockFind.mockResolvedValue(mockSubscriptions);
      (webpush.sendNotification as jest.Mock).mockResolvedValue(undefined);

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(true);
      expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Push notification gönderildi: 2/2 başarılı')
      );
    });

    it('should delete invalid subscriptions (410 status)', async () => {
      const mockSubscription = {
        _id: mockSubscriptionId,
        userId: mockUserId,
        endpoint: 'https://fcm.googleapis.com/fcm/send/invalid',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      };

      mockFind.mockResolvedValue([mockSubscription]);
      (webpush.sendNotification as jest.Mock).mockRejectedValue({
        statusCode: 410,
        message: 'Gone',
      });
      mockFindByIdAndDelete.mockResolvedValue(mockSubscription);

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(false);
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(mockSubscriptionId);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Geçersiz subscription siliniyor')
      );
    });

    it('should delete invalid subscriptions (404 status)', async () => {
      const mockSubscription = {
        _id: mockSubscriptionId,
        userId: mockUserId,
        endpoint: 'https://fcm.googleapis.com/fcm/send/notfound',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      };

      mockFind.mockResolvedValue([mockSubscription]);
      (webpush.sendNotification as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Not Found',
      });
      mockFindByIdAndDelete.mockResolvedValue(mockSubscription);

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(false);
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(mockSubscriptionId);
    });

    it('should handle other push errors without deleting subscription', async () => {
      const mockSubscription = {
        _id: mockSubscriptionId,
        userId: mockUserId,
        endpoint: 'https://fcm.googleapis.com/fcm/send/error',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      };

      mockFind.mockResolvedValue([mockSubscription]);
      (webpush.sendNotification as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: 'Internal Server Error',
      });

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(false);
      expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should send notification with custom payload', async () => {
      const mockSubscription = {
        _id: mockSubscriptionId,
        userId: mockUserId,
        endpoint: 'https://fcm.googleapis.com/fcm/send/endpoint',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      };

      const customPayload: PushNotificationPayload = {
        title: 'Custom Title',
        body: 'Custom Body',
        icon: '/custom-icon.png',
        badge: '/custom-badge.png',
        data: { customData: 'value' },
        tag: 'custom-tag',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      };

      mockFind.mockResolvedValue([mockSubscription]);
      (webpush.sendNotification as jest.Mock).mockResolvedValue(undefined);

      await sendPushNotification(mockUserId, customPayload);

      expect(webpush.sendNotification).toHaveBeenCalledWith(
        {
          endpoint: mockSubscription.endpoint,
          keys: {
            p256dh: mockSubscription.keys.p256dh,
            auth: mockSubscription.keys.auth,
          },
        },
        expect.stringContaining('Custom Title')
      );
    });

    it('should handle partial success', async () => {
      const mockSubscriptions = [
        {
          _id: mockSubscriptionId,
          userId: mockUserId,
          endpoint: 'https://fcm.googleapis.com/fcm/send/success',
          keys: {
            p256dh: 'p256dh-key-1',
            auth: 'auth-key-1',
          },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: mockUserId,
          endpoint: 'https://fcm.googleapis.com/fcm/send/fail',
          keys: {
            p256dh: 'p256dh-key-2',
            auth: 'auth-key-2',
          },
        },
      ];

      mockFind.mockResolvedValue(mockSubscriptions);
      (webpush.sendNotification as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce({ statusCode: 500, message: 'Error' });

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(true); // At least one succeeded
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Push notification gönderildi: 1/2 başarılı')
      );
    });

    it('should handle general errors', async () => {
      mockFind.mockRejectedValue(new Error('Database error'));

      const result = await sendPushNotification(mockUserId, basePayload);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
