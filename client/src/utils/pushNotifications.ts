import apiClient from '@/services/api/axios';
import logger from '@/utils/logger';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: globalThis.PushSubscription | null = null;
  private vapidPublicKey: string | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private async init(): Promise<void> {
    // SSR check
    if (typeof window === 'undefined') return;

    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Önce VAPID public key'i al
        await this.loadVapidKey();

        const existing = await navigator.serviceWorker.getRegistration('/');
        this.swRegistration = existing || (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));

        // SW mesajları: subscription değişimi vs.
        navigator.serviceWorker.addEventListener('message', async (event) => {
          if (event?.data?.type === 'SKPRO_PUSH_SUBSCRIPTION_CHANGED') {
            await this.checkSubscription();
          }
        });

        await this.checkSubscription();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Push notification initialization failed:', error);
      }
    }
  }

  private async loadVapidKey(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const res = await apiClient.get('/push/vapid-key');
      this.vapidPublicKey = res.data?.publicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
    } catch (error) {
      // Fallback: environment variable'dan al
      this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
    }
  }

  private async checkSubscription(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      if (!this.swRegistration) return;

      const subscription = await this.swRegistration.pushManager.getSubscription();
      this.subscription = subscription;

      if (subscription) {
        await this.updateSubscriptionOnServer(subscription);
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
    }
  }

  async subscribe(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker not available');
      }

      // Permission
      if ('Notification' in window) {
        if (Notification.permission === 'denied') {
          throw new Error('Bildirim izni reddedildi. Tarayıcı ayarlarından izin verin.');
        }
        if (Notification.permission === 'default') {
          const p = await Notification.requestPermission();
          if (p !== 'granted') {
            throw new Error('Bildirim izni gerekli');
          }
        }
      }

      // VAPID key yoksa yükle
      if (!this.vapidPublicKey) {
        await this.loadVapidKey();
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not available');
      }

      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      this.subscription = subscription;
      await this.updateSubscriptionOnServer(subscription);
      return true;
    } catch (error) {
      logger.error('Push notification subscription failed:', error);
      return false;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.subscription) return false;

      await this.subscription.unsubscribe();
      this.subscription = null;
      await this.deleteSubscriptionFromServer();
      return true;
    } catch (error) {
      console.error('Push notification unsubscription failed:', error);
      return false;
    }
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      if (!this.swRegistration) return;

      await this.swRegistration.showNotification(options.title, {
        ...options,
        icon: options.icon || '/images/sk-logo.png',
        badge: options.badge || '/images/sk-logo.png',
        ...(options.vibrate && { vibrate: options.vibrate }),
        data: {
          ...options.data,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error('Show notification failed:', error);
    }
  }

  private async updateSubscriptionOnServer(subscription: globalThis.PushSubscription): Promise<void> {
    try {
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')),
        },
      };

      await apiClient.post('/push/subscribe', {
        ...subscriptionData,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_ENV === 'development' && console.error('Update subscription on server failed:', error);
      }
    }
  }

  private async deleteSubscriptionFromServer(): Promise<void> {
    try {
      await apiClient.post('/push/unsubscribe', {});
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete subscription from server failed:', error);
      }
    }
  }

  private arrayBufferToBase64(buf: ArrayBuffer | null): string {
    if (!buf) return '';
    const bytes = new Uint8Array(buf);
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    // SSR check for btoa
    if (typeof window !== 'undefined') {
      return window.btoa(binary);
    }
    // Node.js fallback (if needed, though this method is mostly client)
    return Buffer.from(binary, 'binary').toString('base64');
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    if (typeof window === 'undefined') return new Uint8Array(0);

    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  isSubscribed(): boolean {
    return !!this.subscription;
  }
}

// Singleton instance only if on client, otherwise null/mock or handle in usage
const pushNotificationServiceStub = {
  subscribe: async () => false,
  unsubscribe: async () => false,
  showNotification: async () => { },
  isSupported: () => false,
  isSubscribed: () => false
} as any;

export const pushNotificationService = typeof window !== 'undefined'
  ? PushNotificationService.getInstance()
  : pushNotificationServiceStub;

// Push notification için yardımcı fonksiyonlar
export const pushNotifications = {
  subscribe: () => pushNotificationService.subscribe(),
  unsubscribe: () => pushNotificationService.unsubscribe(),
  show: (options: NotificationOptions) => pushNotificationService.showNotification(options),
  isSupported: () => pushNotificationService.isSupported(),
  isSubscribed: () => pushNotificationService.isSubscribed(),
}; 