const CACHE_NAME = 'skproduction-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/images/logo.png',
  '/images/hero-bg.jpg',
  '/css/main.css',
  '/js/main.js',
];

const API_ENDPOINTS = [
  '/api/forms',
  '/api/sync',
  '/api/media/upload',
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE).then((cache) => cache.addAll(API_ENDPOINTS)),
    ])
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith('skproduction-') &&
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            );
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch olaylarını yakala
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API istekleri için özel strateji
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Statik dosyalar için önbellek stratejisi
  event.respondWith(handleStaticRequest(event.request));
});

// API isteklerini yönet
async function handleApiRequest(request) {
  try {
    // Önce ağdan dene
    const networkResponse = await fetch(request);
    const cache = await caches.open(API_CACHE);

    // Başarılı yanıtı önbelleğe al
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Ağ hatası durumunda önbellekten yanıt ver
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Önbellekte yoksa offline yanıtı döndür
    return new Response(
      JSON.stringify({
        error: 'Offline mode',
        message: 'You are currently offline. Your request will be synced when you are back online.',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Statik dosya isteklerini yönet
async function handleStaticRequest(request) {
  try {
    // Önce önbellekten dene
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Önbellekte yoksa ağdan al
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);

    // Başarılı yanıtı önbelleğe al
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Ağ hatası durumunda offline sayfasını göster
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Push bildirimlerini yönet
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/images/logo.png',
    badge: '/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Detayları Gör',
      },
      {
        action: 'close',
        title: 'Kapat',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('SK Production', options)
  );
});

// Bildirim tıklamalarını yönet
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync olaylarını yönet
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Form senkronizasyonu
async function syncForms() {
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    if (request.method === 'POST' && request.url.includes('/api/forms')) {
      try {
        const response = await fetch(request.clone());
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Form sync failed:', error);
      }
    }
  }
} 