import logger from '@/utils/logger';
/**
 * Service Worker Utility
 * PWA (Progressive Web App) özellikleri için service worker yönetimi
 * 
 * @module utils/serviceWorker
 * @description Service worker kaydı ve yönetimi için yardımcı fonksiyonlar
 */

/**
 * Service Worker'ı kaydeder ve güncellemeleri dinler
 * PWA özellikleri için gerekli (offline mode, push notifications, vb.)
 * 
 * @example
 * ```typescript
 * // app/layout.tsx içinde
 * import { registerServiceWorker } from '@/utils/serviceWorker';
 * 
 * useEffect(() => {
 *   registerServiceWorker();
 * }, []);
 * ```
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Service Worker'ı kaydet
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            logger.info('ServiceWorker registration successful:', registration.scope);
          }

          // Service Worker güncellemelerini kontrol et
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Yeni service worker hazır, kullanıcıya bildir
                  if (process.env.NODE_ENV === 'development') {
                    logger.info('New service worker available');
                  }
                }
              });
            }
          });
        })
        .catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            logger.error('ServiceWorker registration failed:', err);
          }
        });
    });

    // Online olduğunda: queue flush tetikle (Background Sync yoksa bile çalışsın)
    window.addEventListener('online', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKPRO_FLUSH_QUEUE' });
      }
    });

    // Service Worker mesajlarını dinle
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (process.env.NODE_ENV === 'development') {
        logger.info('Service Worker message:', event.data);
      }
    });
  }
}

/**
 * Service Worker'ı kayıttan çıkarır
 * Development veya test amaçlı kullanılabilir
 * 
 * @example
 * ```typescript
 * // Test sonrası temizlik için
 * unregisterServiceWorker();
 * ```
 */
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        logger.error(error.message);
      });
  }
} 