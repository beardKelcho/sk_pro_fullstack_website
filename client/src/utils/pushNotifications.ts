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
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Önce VAPID public key'i al
        await this.loadVapidKey();
        
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        await this.checkSubscription();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Push notification initialization failed:', error);
      }
    }
  }

  private async loadVapidKey(): Promise<void> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/push/vapid-key`);
      
      if (response.ok) {
        const data = await response.json();
        this.vapidPublicKey = data.publicKey;
      } else {
        // Fallback: environment variable'dan al
        this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
      }
    } catch (error) {
      // Fallback: environment variable'dan al
      this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
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
      if (!this.swRegistration) {
        throw new Error('Service Worker not available');
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/push/subscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...subscriptionData,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription on server');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Update subscription on server failed:', error);
      }
    }
  }

  private async deleteSubscriptionFromServer(): Promise<void> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/push/unsubscribe`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription from server');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete subscription from server failed:', error);
      }
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