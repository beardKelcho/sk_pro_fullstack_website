import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface NotificationSettings {
  _id?: string;
  userId: string;
  pushEnabled: boolean;
  pushTypes: {
    TASK_ASSIGNED: boolean;
    TASK_UPDATED: boolean;
    PROJECT_STARTED: boolean;
    PROJECT_UPDATED: boolean;
    PROJECT_COMPLETED: boolean;
    MAINTENANCE_REMINDER: boolean;
    MAINTENANCE_DUE: boolean;
    EQUIPMENT_ASSIGNED: boolean;
    USER_INVITED: boolean;
    SYSTEM: boolean;
  };
  emailEnabled: boolean;
  emailTypes: {
    TASK_ASSIGNED: boolean;
    TASK_UPDATED: boolean;
    PROJECT_STARTED: boolean;
    PROJECT_UPDATED: boolean;
    PROJECT_COMPLETED: boolean;
    MAINTENANCE_REMINDER: boolean;
    MAINTENANCE_DUE: boolean;
    EQUIPMENT_ASSIGNED: boolean;
    USER_INVITED: boolean;
    SYSTEM: boolean;
  };
  inAppEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationSettingsResponse {
  success: boolean;
  settings: NotificationSettings;
}

/**
 * Bildirim ayarlarını getir
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const response = await apiClient.get<NotificationSettingsResponse>('/notification-settings');
    return response.data.settings;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Bildirim ayarları getirme hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Bildirim ayarları getirilemedi');
  }
};

/**
 * Bildirim ayarlarını güncelle
 */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  try {
    const response = await apiClient.put<NotificationSettingsResponse>(
      '/notification-settings',
      settings
    );
    return response.data.settings;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Bildirim ayarları güncelleme hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Bildirim ayarları güncellenemedi');
  }
};

// React Query Hooks
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: getNotificationSettings,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
};

