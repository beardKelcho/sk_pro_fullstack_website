import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GoogleAnalytics, pageview } from '@/utils/analytics';
import { useUserBehavior } from '@/hooks/useUserBehavior';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const router = useRouter();
  const { trackError } = useUserBehavior();

  useEffect(() => {
    // Sayfa değişikliklerini izle
    const handleRouteChange = (url: string) => {
      pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Hata izleme
    const handleError = (event: ErrorEvent) => {
      trackError('runtime_error', event.message || 'Unknown error');
    };

    window.addEventListener('error', handleError);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('error', handleError);
    };
  }, [router.events, trackError]);

  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  );
} 