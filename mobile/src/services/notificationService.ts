import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import http from '../api/http';

// Notification handler configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Push notification izni iste
 */
export const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.warn('Push notifications sadece fiziksel cihazlarda çalışır');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification izni verilmedi');
    return false;
  }

  return true;
};

/**
 * Expo push token al
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      console.warn('Push notifications sadece fiziksel cihazlarda çalışır');
      return null;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    // Expo project ID app.json'da tanımlı olmalı veya environment variable'dan alınmalı
    // Şimdilik undefined bırakıyoruz, Expo otomatik algılayacak
    const tokenData = await Notifications.getExpoPushTokenAsync();

    return tokenData.data;
  } catch (error) {
    console.error('Expo push token alma hatası:', error);
    return null;
  }
};

/**
 * Push token'ı backend'e kaydet
 */
export const registerPushToken = async (token: string): Promise<boolean> => {
  try {
    // Backend'de mobile push token için endpoint eklenmeli
    // Şimdilik mevcut /api/push/subscribe endpoint'ini kullanabiliriz
    // ama Expo push token formatı farklı olduğu için backend'de düzenleme gerekebilir
    await http.post('/push/subscribe', {
      endpoint: token, // Expo push token endpoint olarak kullanılabilir
      keys: {
        p256dh: '', // Expo için gerekli değil
        auth: '', // Expo için gerekli değil
      },
      platform: Platform.OS,
      type: 'expo',
    });
    return true;
  } catch (error) {
    console.error('Push token kaydetme hatası:', error);
    return false;
  }
};

/**
 * Push notification listener'ı başlat
 */
export const setupNotificationListeners = (
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) => {
  // Foreground notification listener
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Notification tap listener
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};

/**
 * Badge sayısını güncelle
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};
