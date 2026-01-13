import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackUserBehavior } from '@/utils/analytics';

export function useUserBehavior() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);

  useEffect(() => {
    // Sayfa görüntüleme süresini izle
    const handleBeforeUnload = () => {
      const duration = Date.now() - startTimeRef.current;
      trackUserBehavior.trackPageViewDuration(duration);
    };

    // Scroll derinliğini izle
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      );
      if (scrollDepth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = scrollDepth;
        trackUserBehavior.trackScrollDepth(scrollDepth);
      }
    };

    // Video etkileşimlerini izle
    const handleVideoPlay = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      trackUserBehavior.trackVideoInteraction(video.id, 'play');
    };

    const handleVideoPause = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      trackUserBehavior.trackVideoInteraction(video.id, 'pause');
    };

    const handleVideoEnded = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      trackUserBehavior.trackVideoInteraction(video.id, 'complete');
    };

    // Event listener'ları ekle
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll);
    document.querySelectorAll('video').forEach(video => {
      video.addEventListener('play', handleVideoPlay);
      video.addEventListener('pause', handleVideoPause);
      video.addEventListener('ended', handleVideoEnded);
    });

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      document.querySelectorAll('video').forEach(video => {
        video.removeEventListener('play', handleVideoPlay);
        video.removeEventListener('pause', handleVideoPause);
        video.removeEventListener('ended', handleVideoEnded);
      });
    };
  }, []);

  // Form gönderimi izleme
  const trackFormSubmission = (formId: string, formData: any) => {
    trackUserBehavior.trackFormSubmission(formId, formData);
  };

  // Buton tıklaması izleme
  const trackButtonClick = (buttonId: string, buttonText: string) => {
    trackUserBehavior.trackButtonClick(buttonId, buttonText);
  };

  // Arama izleme
  const trackSearch = (searchTerm: string, resultCount: number) => {
    trackUserBehavior.trackSearch(searchTerm, resultCount);
  };

  // Dosya indirme izleme
  const trackFileDownload = (fileName: string, fileType: string) => {
    trackUserBehavior.trackFileDownload(fileName, fileType);
  };

  // Hata izleme
  const trackError = (errorType: string, errorMessage: string) => {
    trackUserBehavior.trackError(errorType, errorMessage);
  };

  return {
    trackFormSubmission,
    trackButtonClick,
    trackSearch,
    trackFileDownload,
    trackError,
  };
} 