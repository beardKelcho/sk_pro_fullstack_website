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
  private readonly VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

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
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        await this.checkSubscription();
      }
    } catch (error) {
      console.error('Push notification initialization failed:', error);
    }
  }

  private async checkSubscription(): Promise<void> {
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
    try {
      if (!this.swRegistration || !this.VAPID_PUBLIC_KEY) {
        throw new Error('Service Worker or VAPID key not available');
      }

      const applicationServerKey = this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY);
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      this.subscription = subscription;
      await this.updateSubscriptionOnServer(subscription);
      return true;
    } catch (error) {
      console.error('Push notification subscription failed:', error);
      return false;
    }
  }

  async unsubscribe(): Promise<boolean> {
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
    try {
      if (!this.swRegistration) return;

      await this.swRegistration.showNotification(options.title, {
        ...options,
        icon: options.icon || '/images/logo.png',
        badge: options.badge || '/images/badge.png',
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
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      };
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription on server');
      }
    } catch (error) {
      console.error('Update subscription on server failed:', error);
    }
  }

  private async deleteSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription from server');
      }
    } catch (error) {
      console.error('Delete subscription from server failed:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  isSubscribed(): boolean {
    return !!this.subscription;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();

// Push notification için yardımcı fonksiyonlar
export const pushNotifications = {
  subscribe: () => pushNotificationService.subscribe(),
  unsubscribe: () => pushNotificationService.unsubscribe(),
  show: (options: NotificationOptions) => pushNotificationService.showNotification(options),
  isSupported: () => pushNotificationService.isSupported(),
  isSubscribed: () => pushNotificationService.isSubscribed(),
}; 