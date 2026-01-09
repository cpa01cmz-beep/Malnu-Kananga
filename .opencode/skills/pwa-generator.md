# PWA Generator Skill

## Description
Generate Progressive Web App (PWA) features for the MA Malnu Kananga project, following the project's PWA patterns and best practices.

## Instructions

When asked to add PWA features:

1. **PWA Service Integration**:
   ```typescript
   // Use existing PWA services
   import { pushNotificationService } from '../services/pushNotificationService';
   import { useNetworkStatus } from '../hooks/useNetworkStatus';
   import { STORAGE_KEYS } from '../constants';
   ```

2. **Offline Data Storage**:
   ```typescript
   // Store data for offline use
   export const storeOfflineData = async (key: string, data: any): Promise<void> => {
     try {
       localStorage.setItem(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`, JSON.stringify(data));
       localStorage.setItem(`${STORAGE_KEYS.OFFLINE_DATA}_${key}_timestamp`, Date.now().toString());
     } catch (error) {
       console.error('Error storing offline data:', error);
     }
   };
   
   export const getOfflineData = async (key: string): Promise<any | null> => {
     try {
       const data = localStorage.getItem(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`);
       return data ? JSON.parse(data) : null;
     } catch (error) {
       console.error('Error retrieving offline data:', error);
       return null;
     }
   };
   
   export const syncOfflineData = async (key: string): Promise<void> => {
     try {
       const offlineData = await getOfflineData(key);
       if (!offlineData) return;
       
       // Sync with API
       const result = await apiService.syncData({ key, data: offlineData });
       
       if (result.success) {
         localStorage.removeItem(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`);
         localStorage.removeItem(`${STORAGE_KEYS.OFFLINE_DATA}_${key}_timestamp`);
       }
     } catch (error) {
       console.error('Error syncing offline data:', error);
     }
   };
   ```

3. **Network Status Component**:
   ```typescript
   import { useNetworkStatus } from '../hooks/useNetworkStatus';
   
   const NetworkStatusIndicator: React.FC = () => {
     const { isOnline, isOffline } = useNetworkStatus();
     
     if (isOnline) return null;
     
     return (
       <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
         You are offline. Some features may be limited.
       </div>
     );
   };
   ```

4. **Push Notifications**:
   ```typescript
   import { pushNotificationService } from '../services/pushNotificationService';
   
   const NotificationComponent: React.FC = () => {
     const [permission, setPermission] = useState<NotificationPermission>('default');
     
     useEffect(() => {
       pushNotificationService.requestPermission().then(setPermission);
     }, []);
     
     const sendTestNotification = async () => {
       await pushNotificationService.showNotification({
         title: 'Test Notification',
         body: 'This is a test notification',
         icon: '/icon-192.png',
       });
     };
     
     return (
       <div>
         {permission === 'granted' ? (
           <button onClick={sendTestNotification}>Send Notification</button>
         ) : (
           <button onClick={() => pushNotificationService.requestPermission()}>
             Enable Notifications
           </button>
         )}
       </div>
     );
   };
   ```

5. **Offline Form Handler**:
   ```typescript
   export const useOfflineForm = <T>(endpoint: string) => {
     const { isOnline } = useNetworkStatus();
     const [pendingData, setPendingData] = useState<T[]>([]);
     
     const submitForm = async (data: T): Promise<void> => {
       if (isOnline) {
         // Submit immediately
         await apiService.submitData(endpoint, data);
       } else {
         // Store for later
         const updated = [...pendingData, data];
         setPendingData(updated);
         await storeOfflineData(`pending_${endpoint}`, updated);
         
         toast.success('Data saved locally. Will sync when online.');
       }
     };
     
     const syncPendingData = async (): Promise<void> => {
       if (!isOnline || pendingData.length === 0) return;
       
       for (const data of pendingData) {
         await apiService.submitData(endpoint, data);
       }
       
      setPendingData([]);
      await localStorage.removeItem(`pending_${endpoint}`);
     };
     
     useEffect(() => {
       if (isOnline && pendingData.length > 0) {
         syncPendingData();
       }
     }, [isOnline]);
     
     return { submitForm, pendingData, syncPendingData };
   };
   ```

6. **Service Worker Events**:
   ```typescript
   // In public/sw.js (if customizing)
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request).then((response) => {
         return response || fetch(event.request);
       })
     );
   });
   
   self.addEventListener('sync', (event) => {
     if (event.tag === 'sync-data') {
       event.waitUntil(syncOfflineData());
     }
   });
   ```

7. **PWA Feature Checklist**:
   - [ ] Test offline functionality
   - [ ] Implement network status detection
   - [ ] Add offline data storage
   - [ ] Create data sync mechanism
   - [ ] Test push notifications
   - [ ] Handle permission requests
   - [ ] Cache critical assets
   - [ ] Update service worker
   - [ ] Test on mobile devices
   - [ ] Verify PWA installation

8. **Best Practices**:
   - Cache API responses for offline use
   - Show network status to users
   - Queue requests when offline
   - Sync data when back online
   - Respect user notification preferences
   - Use appropriate cache strategies
   - Handle service worker updates gracefully
   - Test on multiple browsers
   - Optimize for mobile
   - Provide feedback for offline actions

9. **Cache Strategies**:
   ```typescript
   // Cache First - for static assets
   const cacheFirst = async (request: Request): Promise<Response> => {
     const cached = await caches.match(request);
     if (cached) return cached;
     const response = await fetch(request);
     const cache = await caches.open('v1');
     cache.put(request, response.clone());
     return response;
   };
   
   // Network First - for API calls
   const networkFirst = async (request: Request): Promise<Response> => {
     try {
       const response = await fetch(request);
       const cache = await caches.open('v1');
       cache.put(request, response.clone());
       return response;
     } catch (error) {
       const cached = await caches.match(request);
       if (cached) return cached;
       throw error;
     }
   };
   ```

10. **Testing PWA Features**:
    ```typescript
    // Mock network status for testing
    const mockNetworkStatus = (isOnline: boolean) => {
       Object.defineProperty(navigator, 'onLine', {
         value: isOnline,
         writable: true,
       });
       window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'));
    };
    
    // Test offline data storage
    it('stores data when offline', async () => {
       mockNetworkStatus(false);
       await storeOfflineData('test', { data: 'value' });
       
       const retrieved = await getOfflineData('test');
       expect(retrieved).toEqual({ data: 'value' });
    });
    
    // Test sync when back online
    it('syncs data when online', async () => {
       mockNetworkStatus(false);
       await storeOfflineData('test', { data: 'value' });
       
       mockNetworkStatus(true);
       await syncOfflineData('test');
       
       const retrieved = await getOfflineData('test');
       expect(retrieved).toBeNull();
    });
    ```

## Examples

See existing PWA patterns:
- `src/services/pushNotificationService.ts` - Push notification patterns
- `src/hooks/useNetworkStatus.ts` - Network status patterns
- Check existing components for offline handling
- `vite.config.ts` - Service worker configuration

## Notes

- Use existing PWA services when possible
- Test offline functionality thoroughly
- Consider data conflicts when syncing
- Provide clear user feedback
- Handle quota limits for storage
- Cache strategies depend on data type
- Push notifications require HTTPS
- Service worker updates need testing
- Mobile testing is crucial for PWA
- Monitor PWA usage and performance
