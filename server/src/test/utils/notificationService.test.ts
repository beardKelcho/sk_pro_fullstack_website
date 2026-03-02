import { createNotification, CreateNotificationParams } from '../../utils/notificationService';
import { Notification, User, NotificationSettings } from '../../models';
import * as emailService from '../../utils/emailService';
import * as pushNotificationService from '../../utils/pushNotificationService';
import * as realtimeHub from '../../utils/realtime/realtimeHub';
import mongoose from 'mongoose';

// Mock dependencies will be spied on instead of module mocked
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe('notificationService', () => {
  const mockUserId = new mongoose.Types.ObjectId();
  const mockNotificationId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Notification, 'create').mockResolvedValue({} as unknown);
    jest.spyOn(NotificationSettings, 'findOne').mockResolvedValue(null as unknown);
    jest.spyOn(User, 'findById').mockResolvedValue(null as unknown);
    jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined as unknown);
    jest.spyOn(pushNotificationService, 'sendPushNotification').mockResolvedValue(undefined as unknown);
    jest.spyOn(realtimeHub, 'sendToUser').mockImplementation(() => { });
  });

  describe('createNotification', () => {
    const baseParams: CreateNotificationParams = {
      userId: mockUserId,
      type: 'TASK_ASSIGNED',
      title: 'Test Notification',
      message: 'This is a test notification',
    };

    it('should create a notification', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);

      const result = await createNotification(baseParams);

      expect(Notification.create).toHaveBeenCalledWith({
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
      });
      expect(result).toBeDefined();
    });

    it('should send real-time notification via SSE', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);

      await createNotification(baseParams);

      expect(realtimeHub.sendToUser).toHaveBeenCalledWith(
        String(mockUserId),
        'notification:new',
        expect.objectContaining({
          userId: String(mockUserId),
          type: 'TASK_ASSIGNED',
          title: 'Test Notification',
          message: 'This is a test notification',
        })
      );
    });

    it('should send push notification when settings allow', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      const mockSettings = {
        userId: mockUserId,
        pushEnabled: true,
        pushTypes: {},
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);
      jest.spyOn(NotificationSettings, 'findOne').mockResolvedValue(mockSettings as unknown);

      await createNotification(baseParams);

      expect(pushNotificationService.sendPushNotification).toHaveBeenCalledWith(
        String(mockUserId),
        expect.objectContaining({
          title: 'Test Notification',
          body: 'This is a test notification',
          data: expect.objectContaining({
            notificationId: mockNotificationId.toString(),
            type: 'TASK_ASSIGNED',
          }),
        })
      );
    });

    it('should not send push notification when settings disable it', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      const mockSettings = {
        userId: mockUserId,
        pushEnabled: false,
        pushTypes: {},
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);
      jest.spyOn(NotificationSettings, 'findOne').mockResolvedValue(mockSettings as unknown);

      await createNotification(baseParams);

      expect(pushNotificationService.sendPushNotification).not.toHaveBeenCalled();
    });

    it('should send email when sendEmail is true and settings allow', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockSettings = {
        userId: mockUserId,
        emailEnabled: true,
        emailTypes: {},
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);
      jest.spyOn(NotificationSettings, 'findOne').mockResolvedValue(mockSettings as unknown);
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser as unknown);

      await createNotification({
        ...baseParams,
        sendEmail: true,
        emailSubject: 'Test Subject',
      });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should not send email when sendEmail is false', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);

      await createNotification({
        ...baseParams,
        sendEmail: false,
      });

      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle notification with custom data', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'PROJECT_UPDATED',
        title: 'Project Updated',
        message: 'Project has been updated',
        data: { projectId: '123', status: 'ACTIVE' },
        read: false,
        createdAt: new Date(),
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);

      await createNotification({
        ...baseParams,
        type: 'PROJECT_UPDATED',
        title: 'Project Updated',
        message: 'Project has been updated',
        data: { projectId: '123', status: 'ACTIVE' },
      });

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { projectId: '123', status: 'ACTIVE' },
        })
      );
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(Notification, 'create').mockRejectedValue(new Error('Database error'));

      await expect(createNotification(baseParams)).rejects.toThrow('Database error');
    });

    it('should handle real-time notification errors gracefully', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);
      jest.spyOn(realtimeHub, 'sendToUser').mockImplementation(() => {
        throw new Error('SSE error');
      });

      // Should not throw - error is caught internally
      const result = await createNotification(baseParams);
      expect(result).toBeDefined();
    });

    it('should handle push notification errors gracefully', async () => {
      const mockNotification = {
        _id: mockNotificationId,
        userId: mockUserId,
        type: 'TASK_ASSIGNED',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: {},
        read: false,
        createdAt: new Date(),
      };

      const mockSettings = {
        userId: mockUserId,
        pushEnabled: true,
        pushTypes: {},
      };

      jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification as unknown);
      jest.spyOn(NotificationSettings, 'findOne').mockResolvedValue(mockSettings as unknown);
      jest.spyOn(pushNotificationService, 'sendPushNotification').mockRejectedValue(new Error('Push error'));

      // Should not throw
      await expect(createNotification(baseParams)).resolves.toBeDefined();
    });
  });
});
