// PWA Service untuk MA Malnu Kananga
// Mengelola service worker, update detection, dan offline functionality

interface PwaServiceConfig {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onUpdateInstalled?: () => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class PwaService {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable: boolean = false;
  private config: PwaServiceConfig;

  constructor(config: PwaServiceConfig = {}) {
    this.config = config;
    this.init();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service Worker registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                console.log('[PWA] New version available');
                this.config.onUpdateAvailable?.(this.registration!);
              }
            });
          }
        });

        // Listen for controller change (update installed)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Update installed successfully');
          this.config.onUpdateInstalled?.();
        });

        // Handle messages dari service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[PWA] Message from service worker:', event.data);
        });

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[PWA] Connection restored');
      this.config.onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Connection lost');
      this.config.onOffline?.();
    });
  }

  // Check for update
  async checkForUpdate(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return this.updateAvailable;
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
      return false;
    }
  }

  // Install update
  async installUpdate(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    // Send message to service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload page setelah update
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // Get current registration
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // Check if PWA is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Get install prompt support
  isInstallPromptSupported(): boolean {
    return 'onbeforeinstallprompt' in window;
  }

  // Register for background sync
  async registerBackgroundSync(tag: string = 'background-sync'): Promise<boolean> {
    if (!this.registration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return false;
    }

    try {
      await (this.registration as any).sync?.register(tag);
      return true;
    } catch (error) {
      console.error('[PWA] Background sync registration failed:', error);
      return false;
    }
  }

  // Register for periodic sync
  async registerPeriodicSync(tag: string = 'content-sync', minInterval: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    if (!this.registration || !('periodicSync' in this.registration)) {
      return false;
    }

    try {
      await (this.registration as any).periodicSync.register(tag, {
        minInterval
      });
      return true;
    } catch (error) {
      console.error('[PWA] Periodic sync registration failed:', error);
      return false;
    }
  }

  // Get cache status
  async getCacheStatus(): Promise<{
    hasCache: boolean;
    cacheSize?: number;
    cacheNames?: string[];
  }> {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        totalSize += requests.length;
      }

      return {
        hasCache: cacheNames.length > 0,
        cacheSize: totalSize,
        cacheNames
      };
    } catch (error) {
      console.error('[PWA] Cache status check failed:', error);
      return { hasCache: false };
    }
  }

  // Clear all caches
  async clearCache(): Promise<boolean> {
    try {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );

      console.log('[PWA] All caches cleared');
      return true;
    } catch (error) {
      console.error('[PWA] Cache clear failed:', error);
      return false;
    }
  }

  // Queue chat message untuk offline sync
  async queueChatMessage(message: string): Promise<boolean> {
    try {
      // Store in IndexedDB untuk offline sync
      const db = await this.openOfflineDB();
      const transaction = db.transaction(['pendingChatMessages'], 'readwrite');
      const store = transaction.objectStore('pendingChatMessages');

      await store.add({
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message,
        timestamp: Date.now(),
        status: 'pending'
      });

      // Register background sync jika didukung
      await this.registerBackgroundSync('background-sync-chat');

      return true;
    } catch (error) {
      console.error('[PWA] Failed to queue chat message:', error);
      return false;
    }
  }

  // Queue form data untuk offline sync
  async queueFormData(formData: any, url: string, method: string = 'POST'): Promise<boolean> {
    try {
      const db = await this.openOfflineDB();
      const transaction = db.transaction(['pendingForms'], 'readwrite');
      const store = transaction.objectStore('pendingForms');

      await store.add({
        id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        method,
        data: formData,
        timestamp: Date.now(),
        status: 'pending'
      });

      // Register background sync jika didukung
      await this.registerBackgroundSync('background-sync-forms');

      return true;
    } catch (error) {
      console.error('[PWA] Failed to queue form data:', error);
      return false;
    }
  }

  // Open offline database
  private async openOfflineDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('MA-Malnu-Offline-DB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

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

  // Check if service worker is ready
  async isServiceWorkerReady(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller) {
        // Service worker might still be loading
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve(true);
        }, { once: true });

        // Timeout setelah 5 seconds
        setTimeout(() => resolve(false), 5000);
      } else {
        resolve(true);
      }
    });
  }

  // Get PWA installation status
  getInstallStatus(): {
    isInstalled: boolean;
    isInstallPromptSupported: boolean;
    isServiceWorkerSupported: boolean;
    isOfflineCapable: boolean;
  } {
    return {
      isInstalled: this.isInstalled(),
      isInstallPromptSupported: this.isInstallPromptSupported(),
      isServiceWorkerSupported: 'serviceWorker' in navigator,
      isOfflineCapable: 'caches' in window
    };
  }
}

// Export singleton instance
export const pwaService = new PwaService({
  onUpdateAvailable: (registration) => {
    console.log('[PWA] Update available, showing notification...');

    // Show update notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Update Tersedia', {
        body: 'Versi baru aplikasi telah tersedia. Klik untuk memperbarui.',
        icon: '/icons/icon-192x192.png',
        tag: 'app-update',
        requireInteraction: true,
        
      });
    }
  },

  onOffline: () => {
    console.log('[PWA] App went offline');
  },

  onOnline: () => {
    console.log('[PWA] App back online');
  }
});

export default PwaService;