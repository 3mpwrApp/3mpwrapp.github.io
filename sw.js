// 3mpwrApp Service Worker v2.1
// Implements offline-first caching for PWA functionality

const CACHE_NAME = '3mpwr-v2.1';
const OFFLINE_URL = '/offline.html';

// Resources to cache on installation
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about/',
  '/features/',
  '/user-guide/',
  '/faq/',
  '/privacy/',
  '/terms/',
  '/accessibility/',
  '/contact/',
  '/fr/',
  '/fr/about/',
  '/fr/features/',
  '/fr/user-guide/',
  '/fr/faq/',
  '/offline.html',
  '/manifest.json',
  '/assets/css/style.css',
  '/public/logo-192.png',
  '/public/logo-512.png'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v2.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v2.0...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Chrome extensions and other schemes
  if (!event.request.url.startsWith('http')) return;

  // 1) Network-first for navigation requests (pages/HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Cache a copy of the fresh HTML for offline use
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return networkResponse;
        })
        .catch(async () => {
          // Fall back to cached page, else offline page
          const cached = await caches.match(event.request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 2) Cache-first for other GETs (CSS/JS/images), with background update
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, copy);
              }
            });
          }
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Background sync for offline form submissions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(syncForms());
  }
});

async function syncForms() {
  // Future: sync form submissions made while offline
  console.log('[Service Worker] Syncing offline form data...');
}

// Push notification support (future enhancement)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/public/logo-192.png',
    badge: '/public/logo-192.png',
    vibrate: [200, 100, 200],
    tag: '3mpwr-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('3mpwrApp', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[Service Worker] v2.1 loaded successfully');
