const CACHE_NAME = 'skproduction-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/images/sk-logo.png',
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
  let notificationData = {
    title: 'SK Production',
    body: '',
    icon: '/images/sk-logo.png',
    badge: '/images/sk-logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: '/admin/notifications',
    },
    actions: [
      {
        action: 'view',
        title: 'Görüntüle',
      },
      {
        action: 'dismiss',
        title: 'Kapat',
      },
    ],
    requireInteraction: false,
    tag: 'default',
  };

  // Eğer event.data varsa ve JSON ise parse et
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: {
          ...notificationData.data,
          ...data.data,
        },
        actions: data.actions || notificationData.actions,
        requireInteraction: data.requireInteraction || notificationData.requireInteraction,
        tag: data.tag || notificationData.tag,
      };
    } catch (e) {
      // JSON değilse text olarak kullan
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Bildirim tıklamalarını yönet
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const url = notificationData.url || '/admin/notifications';

  if (event.action === 'view' || event.action === '') {
    // Bildirime tıklandığında veya "Görüntüle" butonuna tıklandığında
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Açık bir pencere varsa ona odaklan
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Açık pencere yoksa yeni pencere aç
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // "Kapat" butonuna tıklandığında sadece bildirimi kapat
    // Zaten event.notification.close() çağrıldı
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