import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GoogleAnalytics, pageview } from '@/utils/analytics';
import { useUserBehavior } from '@/hooks/useUserBehavior';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const { trackError } = useUserBehavior();

  useEffect(() => {
    // Sayfa değişikliklerini izle
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    // Hata izleme
    const handleError = (event: ErrorEvent) => {
      trackError('runtime_error', event.message || 'Unknown error');
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [trackError]);

  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  );
} 