'use client';

import Link from 'next/link';
import logger from '@/utils/logger';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  type Notification,
} from '@/services/notificationService';

interface AdminNotificationPanelProps {
  unreadCount: number;
  formatRelativeTime: (dateString: string) => string;
  onClose: () => void;
}

export default function AdminNotificationPanel({
  unreadCount,
  formatRelativeTime,
  onClose,
}: AdminNotificationPanelProps) {
  const { data: notificationList, isLoading: notificationsLoading } = useNotifications({ page: 1, limit: 10 });
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  const notifications: Notification[] = notificationList?.notifications || [];

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      logger.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsReadMutation.mutateAsync(notification._id);
      }
    } finally {
      onClose();
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[60] border border-gray-200 dark:border-gray-700 slide-in-right">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 dark:text-white">Bildirimler</h3>
        <button
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          onClick={handleMarkAllAsRead}
        >
          Tümünü Okundu İşaretle
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {notificationsLoading ? (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">Yükleniyor...</p>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''} ${markAsReadMutation.isPending ? 'opacity-80' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`w-2 h-2 mt-1 rounded-full ${!notification.read ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white">{notification.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">Bildirim bulunmuyor</p>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/admin/notifications"
          onClick={onClose}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline block text-center"
        >
          Tüm Bildirimleri Görüntüle
        </Link>
      </div>
    </div>
  );
}
