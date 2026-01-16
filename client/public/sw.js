const CACHE_PREFIX = 'skproduction';
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`;
const API_CACHE = `${CACHE_PREFIX}-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/images/sk-logo.png',
];

// Not: API endpoint'lerini install sırasında cache'lemiyoruz (auth/CSRF vb. sebebiyle).

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((n) => n.startsWith(CACHE_PREFIX) && !n.endsWith(CACHE_VERSION)).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

// Fetch olaylarını yakala
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Sadece same-origin handle edelim
  if (url.origin !== self.location.origin) return;

  // Navigation: offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request));
    return;
  }

  // API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApi(event.request));
    return;
  }

  // Statik içerik
  event.respondWith(handleAsset(event.request));
});

async function handleNavigation(request) {
  try {
    const res = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

async function handleAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (e) {
    // asset yoksa boş dön
    return cached || new Response('', { status: 504 });
  }
}

async function handleApi(request) {
  const url = new URL(request.url);

  // GET: network-first + cache fallback
  if (request.method === 'GET') {
    try {
      const res = await fetch(request);
      const cache = await caches.open(API_CACHE);
      if (res.ok) cache.put(request, res.clone());
      return res;
    } catch (e) {
      const cached = await caches.match(request);
      return (
        cached ||
        new Response(JSON.stringify({ success: false, message: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
  }

  // Background sync: sadece same-origin contact form
  if (request.method === 'POST' && url.pathname === '/api/contact') {
    return queueOrSendContact(request);
  }

  // Diğer non-GET: network only
  try {
    return await fetch(request);
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// -------------------------
// Background queue (IDB)
// -------------------------
const DB_NAME = 'skpro-sw';
const DB_VERSION = 1;
const STORE = 'queue';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addToQueue(item) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(item);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllQueue() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromQueue(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function queueOrSendContact(request) {
  try {
    // online ise direkt dene
    const res = await fetch(request.clone());
    return res;
  } catch (e) {
    // offline -> body'yi alıp kuyruğa koy
    let bodyText = '';
    try {
      bodyText = await request.clone().text();
    } catch {
      bodyText = '';
    }
    await addToQueue({
      url: request.url,
      method: request.method,
      headers: { 'Content-Type': request.headers.get('Content-Type') || 'application/json' },
      body: bodyText,
      ts: Date.now(),
    });

    if (self.registration.sync) {
      try {
        await self.registration.sync.register('skpro-sync-contact');
      } catch {
        // ignore
      }
    }

    return new Response(JSON.stringify({ success: true, queued: true }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
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
  if (event.tag === 'skpro-sync-contact') {
    event.waitUntil(flushQueue());
  }
});

// Sayfadan manuel flush tetikleme
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKPRO_FLUSH_QUEUE') {
    event.waitUntil(flushQueue());
  }
});

async function flushQueue() {
  const items = await getAllQueue();
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (res.ok) {
        await deleteFromQueue(item.id);
      }
    } catch (e) {
      // offline devam ediyor: bırak
    }
  }
}