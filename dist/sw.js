// Service Worker untuk MA Malnu Kananga PWA
// Mengimplementasikan caching strategies untuk offline functionality

/* global self, console, caches */
const CACHE_NAME = 'ma-malnu-kananga-v1.0.0';
const RUNTIME_CACHE = 'ma-malnu-runtime-v1.0.0';

// Assets yang akan di-cache untuk offline usage
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache assets untuk offline
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
/* global URL, location, fetch, Response */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (kecuali untuk API)
  if (url.origin !== location.origin && !url.hostname.includes('malnu-api')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler dengan different strategies
async function handleRequest(request) {

  try {
    // Strategy 1: Cache-First untuk static assets
    if (isStaticAsset(request)) {
      return await cacheFirstStrategy(request);
    }

    // Strategy 2: Network-First untuk API calls
    if (isApiRequest(request)) {
      return await networkFirstStrategy(request);
    }

    // Strategy 3: Stale-While-Revalidate untuk HTML pages
    if (isHtmlRequest(request)) {
      return await staleWhileRevalidateStrategy(request);
    }

    // Strategy 4: Network-First dengan cache fallback untuk images
    if (isImageRequest(request)) {
      return await networkFirstWithCacheFallback(request);
    }

    // Default: Network-First strategy
    return await networkFirstStrategy(request);

  } catch (error) {
    console.error('[SW] Request failed:', error);

    // Return offline fallback untuk navigation requests
    if (request.mode === 'navigate') {
      return await getOfflineFallback();
    }

    throw error;
  }
}

// Cache-First Strategy - untuk static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    throw error;
  }
}

// Network-First Strategy - untuk API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback untuk API requests
    if (isApiRequest(request)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offline',
          message: 'Aplikasi sedang offline. Data akan disinkronisasi ketika koneksi tersedia kembali.'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    throw error;
  }
}

// Stale-While-Revalidate Strategy - untuk HTML pages
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  // Start network request (don't await)
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(RUNTIME_CACHE)
          .then((cache) => cache.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', error);
      return null;
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // If no cache, wait for network
  return await networkPromise || await getOfflineFallback();
}

// Network-First dengan Cache Fallback - untuk images
async function networkFirstWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch {
    console.log('[SW] Image network failed, trying cache...');

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return placeholder image jika tersedia
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Helper functions untuk determine request type
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/i);
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || url.hostname.includes('malnu-api');
}

function isHtmlRequest(request) {
  const acceptHeader = request.headers.get('accept');
  return acceptHeader && acceptHeader.includes('text/html');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);
}

// Offline fallback untuk navigation
async function getOfflineFallback() {
  const cache = await caches.open(CACHE_NAME);
  const offlineResponse = await cache.match('/index.html');

  if (offlineResponse) {
    return offlineResponse;
  }

  // Return basic offline page jika cache tidak tersedia
  return new Response(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - MA Malnu Kananga</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center;
          padding: 2rem;
          background: #f9fafb;
          color: #374151;
        }
        .offline-container {
          max-width: 400px;
          margin: 4rem auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .offline-message {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        .retry-btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
        .retry-btn:hover {
          background: #16a34a;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">Offline</h1>
        <p class="offline-message">
          Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
          Data akan disinkronisasi ketika koneksi tersedia kembali.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
          Coba Lagi
        </button>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background sync untuk form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncFormData());
  }

  if (event.tag === 'background-sync-chat') {
    event.waitUntil(syncChatMessages());
  }
});

// Sync form data ketika online kembali
async function syncFormData() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingForms = await getPendingForms();

    for (const form of pendingForms) {
      try {
        const response = await fetch(form.url, {
          method: form.method,
          headers: form.headers,
          body: form.body
        });

        if (response.ok) {
          await removePendingForm(form.id);
          console.log('[SW] Form synced successfully:', form.id);
        }
      } catch (error) {
        console.error('[SW] Form sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync chat messages ketika online kembali
async function syncChatMessages() {
  try {
    // Get pending chat messages from IndexedDB
    /* global getPendingChatMessages, removePendingChatMessage */
    const pendingMessages = await getPendingChatMessages();

    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.content })
        });

        if (response.ok) {
          await removePendingChatMessage(message.id);
          console.log('[SW] Chat message synced successfully:', message.id);
        }
      } catch (error) {
        console.error('[SW] Chat sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Chat sync failed:', error);
  }
}

// IndexedDB helpers untuk offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    /* global indexedDB */
    const request = indexedDB.open('MA-Malnu-Offline-DB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Pending forms store
      if (!db.objectStoreNames.contains('pendingForms')) {
        const formsStore = db.createObjectStore('pendingForms', { keyPath: 'id' });
        formsStore.createIndex('timestamp', 'timestamp');
      }

      // Pending chat messages store
      if (!db.objectStoreNames.contains('pendingChatMessages')) {
        const chatStore = db.createObjectStore('pendingChatMessages', { keyPath: 'id' });
        chatStore.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

async function getPendingForms() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingForms'], 'readonly');
    const store = transaction.objectStore('pendingForms');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingForm(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingForms'], 'readwrite');
    const store = transaction.objectStore('pendingForms');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  const options = {
    body: event.data ? event.data.text() : 'Notifikasi baru dari MA Malnu Kananga',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Buka Aplikasi',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MA Malnu Kananga', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      /* global clients */
      clients.openWindow('/')
    );
  }
});

// Message handling dari main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (jika didukung)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

// Content sync untuk update berita dan pengumuman
async function syncContent() {
  try {
    const response = await fetch('/api/content/latest');
    if (response.ok) {
      const content = await response.json();

      // Show notification jika ada konten baru
      if (content.length > 0) {
        self.registration.showNotification('Konten Baru Tersedia', {
          body: `${content.length} berita dan pengumuman baru`,
          icon: '/icons/icon-192x192.png',
          tag: 'content-update'
        });
      }
    }
  } catch (error) {
    console.error('[SW] Content sync failed:', error);
  }
}

console.log('[SW] Service Worker loaded successfully');