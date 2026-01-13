import { useState, useEffect } from 'react';
import { pushNotifications, NotificationOptions } from '@/utils/pushNotifications';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        const isSupported = pushNotifications.isSupported();
        const isSubscribed = pushNotifications.isSubscribed();

        setState({
          isSupported,
          isSubscribed,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          isSupported: false,
          isSubscribed: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Push notification initialization failed',
        });
      }
    };

    initPushNotifications();
  }, []);

  const subscribe = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const success = await pushNotifications.subscribe();

      if (success) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          isLoading: false,
        }));
      } else {
        throw new Error('Failed to subscribe to push notifications');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Subscription failed',
      }));
    }
  };

  const unsubscribe = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const success = await pushNotifications.unsubscribe();

      if (success) {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
        }));
      } else {
        throw new Error('Failed to unsubscribe from push notifications');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unsubscription failed',
      }));
    }
  };

  const showNotification = async (options: NotificationOptions) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await pushNotifications.show(options);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to show notification',
      }));
    }
  };

  return {
    ...state,
    subscribe,
    unsubscribe,
    showNotification,
  };
} 