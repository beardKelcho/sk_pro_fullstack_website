import { createNotification, CreateNotificationParams } from '../../utils/notificationService';
import { Notification, User, NotificationSettings } from '../../models';
import { sendEmail } from '../../utils/emailService';
import { sendPushNotification } from '../../utils/pushNotificationService';
import { sendToUser } from '../../utils/realtime/realtimeHub';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../../models', () => ({
  Notification: {
    create: jest.fn(),
  },
  User: {
    findById: jest.fn(),
  },
  NotificationSettings: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../utils/emailService', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('../../utils/pushNotificationService', () => ({
  sendPushNotification: jest.fn(),
}));

jest.mock('../../utils/realtime/realtimeHub', () => ({
  sendToUser: jest.fn(),
}));

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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

      await createNotification(baseParams);

      expect(sendToUser).toHaveBeenCalledWith(
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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (NotificationSettings.findOne as jest.Mock).mockResolvedValue(mockSettings);

      await createNotification(baseParams);

      expect(sendPushNotification).toHaveBeenCalledWith(
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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (NotificationSettings.findOne as jest.Mock).mockResolvedValue(mockSettings);

      await createNotification(baseParams);

      expect(sendPushNotification).not.toHaveBeenCalled();
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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (NotificationSettings.findOne as jest.Mock).mockResolvedValue(mockSettings);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await createNotification({
        ...baseParams,
        sendEmail: true,
        emailSubject: 'Test Subject',
      });

      expect(sendEmail).toHaveBeenCalled();
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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

      await createNotification({
        ...baseParams,
        sendEmail: false,
      });

      expect(sendEmail).not.toHaveBeenCalled();
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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

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
      (Notification.create as jest.Mock).mockRejectedValue(new Error('Database error'));

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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (sendToUser as jest.Mock).mockImplementation(() => {
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

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (NotificationSettings.findOne as jest.Mock).mockResolvedValue(mockSettings);
      (sendPushNotification as jest.Mock).mockRejectedValue(new Error('Push error'));

      // Should not throw
      await expect(createNotification(baseParams)).resolves.toBeDefined();
    });
  });
});
