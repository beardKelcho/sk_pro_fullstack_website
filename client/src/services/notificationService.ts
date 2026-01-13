import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackApiError } from '@/utils/errorTracking';
import logger from '@/utils/logger';

export interface Notification {
  _id: string;
  userId: string;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'PROJECT_STARTED' | 'PROJECT_UPDATED' | 'PROJECT_COMPLETED' | 'MAINTENANCE_REMINDER' | 'MAINTENANCE_DUE' | 'EQUIPMENT_ASSIGNED' | 'USER_INVITED' | 'SYSTEM';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  count: number;
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
  notifications: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

// Tüm bildirimleri getir
export const getNotifications = async (
  params?: {
    read?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }
): Promise<NotificationListResponse> => {
  try {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  } catch (error: any) {
    logger.error('Bildirimleri getirme hatası:', error);
    // Development modunda logger zaten hata logluyor
    throw new Error(error.response?.data?.message || 'Bildirimler getirilemedi');
  }
};

// Okunmamış bildirim sayısını getir
export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return res.data.unreadCount;
  } catch (error: any) {
    logger.error('Okunmamış bildirim sayısı getirme hatası:', error);
    // Development modunda logger zaten hata logluyor
    return 0;
  }
};

// Bildirimi okundu olarak işaretle
export const markAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`, {});
    return res.data.notification;
  } catch (error: any) {
    logger.error('Bildirim okundu işaretleme hatası:', error);
    // Development modunda logger zaten hata logluyor
    throw new Error(error.response?.data?.message || 'Bildirim güncellenemedi');
  }
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllAsRead = async (): Promise<{ modifiedCount: number }> => {
  try {
    const res = await apiClient.patch('/notifications/read-all', {});
    return { modifiedCount: res.data.modifiedCount };
  } catch (error: any) {
    logger.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    // Development modunda logger zaten hata logluyor
    throw new Error(error.response?.data?.message || 'Bildirimler güncellenemedi');
  }
};

// Bildirimi sil
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error: any) {
    logger.error('Bildirim silme hatası:', error);
    // Development modunda logger zaten hata logluyor
    throw new Error(error.response?.data?.message || 'Bildirim silinemedi');
  }
};

// React Query Hooks
export const useNotifications = (params?: {
  read?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
    staleTime: 30 * 1000, // 30 saniye (bildirimler sık güncellenir)
    refetchInterval: 60 * 1000, // Her 60 saniyede bir otomatik yenile
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    staleTime: 30 * 1000, // 30 saniye
    refetchInterval: 30 * 1000, // Her 30 saniyede bir otomatik yenile
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

