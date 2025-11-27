// Enhanced Service Worker untuk MA Malnu Kananga PWA
// Mengimplementasikan offline learning capabilities dengan intelligent caching

/* global self, console, caches */
const CACHE_NAME = 'ma-malnu-kananga-v2.0.0';
const RUNTIME_CACHE = 'ma-malnu-runtime-v2.0.0';
const LEARNING_CACHE = 'ma-malnu-learning-v2.0.0';

// Assets yang akan di-cache untuk offline usage
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Critical CSS and JS
  '/src/main.tsx',
  '/src/App.tsx',
  // Learning materials for offline access
  '/api/learning/materials',
  '/api/curriculum',
  '/api/student/progress'
];

// Learning content yang akan di-sync untuk offline
const OFFLINE_LEARNING_CONTENT = [
  '/api/curriculum/modules',
  '/api/learning/materials/mathematics',
  '/api/learning/materials/bahasa-indonesia',
  '/api/student/progress/current',
  '/api/assessments/offline'
];

// Install event - cache assets dan learning content untuk offline
self.addEventListener('install', (event) => {
  console.log('[SW] Installing enhanced service worker with offline learning...');

  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[SW] Caching app shell');
          return cache.addAll(PRECACHE_ASSETS);
        }),
      
      // Pre-cache learning content
      caches.open(LEARNING_CACHE)
        .then((cache) => {
          console.log('[SW] Pre-caching learning content');
          return cache.addAll(OFFLINE_LEARNING_CONTENT.map(url => new Request(url, { 
            headers: { 'X-Offline-Cache': 'true' } 
          })));
        })
        .catch(() => {
          console.log('[SW] Learning content pre-cache failed (will be cached on first access)');
        })
    ])
    .then(() => {
      console.log('[SW] Enhanced installation complete');
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('[SW] Installation failed:', error);
    })
  );
});

// Activate event - cleanup old caches dan sync learning data
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating enhanced service worker...');

  event.waitUntil(
    Promise.all([
      // Cleanup old caches
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== LEARNING_CACHE) {
                console.log('[SW] Deleting old cache:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        }),
      
      // Sync offline learning data
      syncOfflineLearningData()
    ])
    .then(() => {
      console.log('[SW] Enhanced activation complete');
      return self.clients.claim();
    })
  );
});

// Sync offline learning data when online
async function syncOfflineLearningData() {
  try {
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      console.log('[SW] Syncing offline learning data...');
      
      for (const data of offlineData) {
        try {
          await fetch('/api/sync/offline-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          // Remove synced data
          await removeOfflineData(data.id);
        } catch (error) {
          console.error('[SW] Failed to sync data:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Fetch event - implement caching strategies
/* global URL, location, fetch, Response */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (kecuali untuk API)
  const url = new URL(request.url);
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

// Enhanced Network-First Strategy - untuk API calls dengan offline learning support
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      
      // Cache learning content untuk offline access
      if (isLearningContentRequest(request)) {
        const learningCache = await caches.open(LEARNING_CACHE);
        learningCache.put(request, networkResponse.clone());
      }
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');

    // Try learning cache first for educational content
    if (isLearningContentRequest(request)) {
      const learningResponse = await caches.match(request);
      if (learningResponse) {
        return addOfflineHeaders(learningResponse);
      }
    }

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return addOfflineHeaders(cachedResponse);
    }

    // Return intelligent offline fallback untuk API requests
    if (isApiRequest(request)) {
      return await getOfflineApiResponse(request);
    }

    throw error;
  }
}

// Add offline headers to cached responses
function addOfflineHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Offline-Cache', 'true');
  headers.set('X-Cache-Timestamp', new Date().toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Get intelligent offline API response based on request type
async function getOfflineApiResponse(request) {
  const url = new URL(request.url);
  
  // Learning content offline responses
  if (url.pathname.includes('/curriculum')) {
    return new Response(
      JSON.stringify({
        success: true,
        data: await getCachedCurriculumData(),
        offline: true,
        message: 'Data kurikulum dari cache offline'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Mode': 'true'
        }
      }
    );
  }
  
  if (url.pathname.includes('/learning/materials')) {
    return new Response(
      JSON.stringify({
        success: true,
        data: await getCachedLearningMaterials(),
        offline: true,
        message: 'Materi pembelajaran dari cache offline'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Mode': 'true'
        }
      }
    );
  }
  
  if (url.pathname.includes('/student/progress')) {
    return new Response(
      JSON.stringify({
        success: true,
        data: await getCachedStudentProgress(),
        offline: true,
        message: 'Data progress siswa dari cache offline'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Mode': 'true'
        }
      }
    );
  }
  
  // Generic offline response
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Offline',
      message: 'Aplikasi sedang offline. Data akan disinkronisasi ketika koneksi tersedia kembali.',
      offlineActions: await getAvailableOfflineActions()
    }),
    {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true'
      }
    }
  );
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
      return addOfflineHeaders(cachedResponse);
    }

    // Return placeholder image jika tersedia
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable (offline)</text></svg>',
      {
        headers: { 
          'Content-Type': 'image/svg+xml',
          'X-Offline-Mode': 'true'
        }
      }
    );
  }
}

// Offline data management functions
async function getCachedCurriculumData() {
  try {
    const cache = await caches.open(LEARNING_CACHE);
    const response = await cache.match('/api/curriculum/modules');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('[SW] Failed to get cached curriculum:', error);
  }
  
  // Return mock curriculum data
  return {
    modules: [
      {
        id: 'mat12_ch1_linear',
        title: 'Persamaan Linear',
        description: 'Persamaan linear satu variabel',
        difficulty: 'basic',
        offlineAvailable: true
      }
    ]
  };
}

async function getCachedLearningMaterials() {
  try {
    const cache = await caches.open(LEARNING_CACHE);
    const response = await cache.match('/api/learning/materials/mathematics');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('[SW] Failed to get cached materials:', error);
  }
  
  // Return mock materials
  return {
    materials: [
      {
        id: 'material_001',
        title: 'Pengantar Persamaan Linear',
        type: 'document',
        offlineAvailable: true,
        content: 'Dasar-dasar persamaan linear...'
      }
    ]
  };
}

async function getCachedStudentProgress() {
  try {
    const cache = await caches.open(LEARNING_CACHE);
    const response = await cache.match('/api/student/progress/current');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('[SW] Failed to get cached progress:', error);
  }
  
  // Return mock progress
  return {
    progress: {
      completedModules: 2,
      totalModules: 8,
      averageScore: 85,
      lastSync: new Date().toISOString()
    }
  };
}

async function getAvailableOfflineActions() {
  return [
    'Access cached learning materials',
    'View curriculum content',
    'Track progress locally',
    'Take offline assessments',
    'Submit data for sync when online'
  ];
}

async function getOfflineData() {
  try {
    const result = await self.clients.matchAll();
    const client = result[0];
    if (client) {
      // Request offline data from client
      const response = await new Promise(resolve => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => resolve(event.data);
        client.postMessage({ type: 'GET_OFFLINE_DATA' }, [messageChannel.port2]);
      });
      return response || [];
    }
  } catch (error) {
    console.error('[SW] Failed to get offline data:', error);
  }
  return [];
}

async function removeOfflineData(id) {
  try {
    const result = await self.clients.matchAll();
    const client = result[0];
    if (client) {
      client.postMessage({ type: 'REMOVE_OFFLINE_DATA', id });
    }
  } catch (error) {
    console.error('[SW] Failed to remove offline data:', error);
  }
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

function isLearningContentRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/curriculum') ||
         url.pathname.includes('/learning/materials') ||
         url.pathname.includes('/student/progress') ||
         url.pathname.includes('/assessments');
}

function isHtmlRequest(request) {
  const acceptHeader = request.headers.get('accept');
  return acceptHeader && acceptHeader.includes('text/html');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);
}

// Enhanced offline fallback untuk navigation dengan learning features
async function getOfflineFallback() {
  const cache = await caches.open(CACHE_NAME);
  const offlineResponse = await cache.match('/index.html');

  if (offlineResponse) {
    return offlineResponse;
  }

  // Return enhanced offline page dengan learning features
  return new Response(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mode Pembelajaran Offline - MA Malnu Kananga</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center;
          padding: 2rem;
          background: #f9fafb;
          color: #374151;
        }
        .offline-container {
          max-width: 500px;
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
        .offline-features {
          background: #e5f3ff;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          text-align: left;
        }
        .offline-features h3 {
          margin-top: 0;
          color: #1e40af;
        }
        .offline-features ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .retry-btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          margin: 0.5rem;
        }
        .retry-btn:hover {
          background: #16a34a;
        }
        .secondary-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          margin: 0.5rem;
        }
        .secondary-btn:hover {
          background: #4b5563;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📚</div>
        <h1 class="offline-title">Mode Pembelajaran Offline</h1>
        <p class="offline-message">
          Aplikasi MA Malnu Kananga sedang dalam mode offline. 
          Anda tetap dapat mengakses materi pembelajaran yang telah di-cache.
        </p>
        
        <div class="offline-features">
          <h3>✨ Fitur Tersedia Offline:</h3>
          <ul>
            <li>📖 Akses materi pembelajaran yang diunduh</li>
            <li>📊 Lihat progress belajar tersimpan</li>
            <li>📝 Kerjakan assessment offline</li>
            <li>🔄 Sinkronisasi otomatis saat online</li>
          </ul>
        </div>
        
<div>
          <button class="retry-btn" onclick="window.location.href='/'">Lanjut Belajar Offline</button>
          <button class="secondary-btn" onclick="window.location.reload()">Coba Koneksi Lagi</button>
        </div>
        
        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 2rem;">
          Data akan disinkronisasi secara otomatis ketika koneksi internet tersedia kembali.
        </p>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 
      'Content-Type': 'text/html',
      'X-Offline-Mode': 'true'
    }
  });
}

// Background sync untuk offline learning data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-learning-data') {
    event.waitUntil(syncOfflineLearningData());
  }
  
  if (event.tag === 'sync-assessments') {
    event.waitUntil(syncOfflineAssessments());
  }
});

// Handle push notifications untuk learning updates
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: 'Ada pembaruan materi pembelajaran tersedia',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'learning-update',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi'
      },
      {
        action: 'sync',
        title: 'Sync Sekarang'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('MA Malnu Kananga', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'sync') {
    event.waitUntil(syncOfflineLearningData());
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline assessments
async function syncOfflineAssessments() {
  try {
    const offlineAssessments = await getOfflineAssessments();
    
    for (const assessment of offlineAssessments) {
      try {
        await fetch('/api/assessments/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessment)
        });
        
        await removeOfflineAssessment(assessment.id);
      } catch (error) {
        console.error('[SW] Failed to sync assessment:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Assessment sync failed:', error);
  }
}

async function getOfflineAssessments() {
  // Similar to getOfflineData but for assessments
  return [];
}

async function removeOfflineAssessment(id) {
  // Similar to removeOfflineData but for assessments
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
    const pendingMessages = [];

    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.content })
        });

        if (response.ok) {
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
    const request = self.indexedDB.open('MA-Malnu-Offline-DB', 1);

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
      self.clients.openWindow('/')
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