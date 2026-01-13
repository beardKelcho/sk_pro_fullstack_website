import { useEffect } from 'react';
import { GoogleAnalytics } from '@/utils/analytics';
import { performanceMonitoringService } from '@/utils/performance';
// Error tracking is handled by ErrorBoundary and AnalyticsProvider
import { useUserBehavior } from '@/hooks/useUserBehavior';

export const MonitoringProvider = ({ children }: { children: React.ReactNode }) => {
  const { trackButtonClick, trackFormSubmission } = useUserBehavior();

  useEffect(() => {
    // Performans izleme - performanceMonitoringService constructor'da zaten başlatılıyor
    // Web Vitals otomatik olarak izleniyor

    // Hata izleme - ErrorBoundary ve AnalyticsProvider tarafından yönetiliyor

    // Cleanup - performanceMonitoringService singleton olduğu için cleanup gerekmiyor
  }, []);

  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  );
}; 