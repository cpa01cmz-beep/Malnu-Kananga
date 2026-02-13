
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UsersIcon } from './icons/UsersIcon';

import { ChartBarIcon } from './icons/ChartBarIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import PPDBManagement from './PPDBManagement';
import PermissionManager from './admin/PermissionManager';
import AICacheManager from './AICacheManager';
import AnnouncementManager from './AnnouncementManager';
import MegaphoneIcon from './icons/MegaphoneIcon';
import { ToastType } from './Toast';
import { STORAGE_KEYS, OPACITY_TOKENS, RETRY_CONFIG } from '../constants';
import { logger } from '../utils/logger';
import { usePushNotifications } from '../hooks/useUnifiedNotifications';
import { useOfflineDataService, useOfflineData, type CachedAdminData } from '../services/offlineDataService';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { getGradientClass } from '../config/gradients';
import ErrorMessage from './ui/ErrorMessage';
import DashboardActionCard from './ui/DashboardActionCard';
import Card from './ui/Card';
import { CardSkeleton } from './ui/Skeleton';
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import { useOfflineActionQueue } from '../services/offlineActionQueueService';
import { retryWithBackoff, classifyError, ErrorType } from '../utils/errorHandler';
import type { VoiceCommand } from '../types';
import VoiceInputButton from './VoiceInputButton';
import VoiceCommandsHelp from './VoiceCommandsHelp';
import SmallActionButton from './ui/SmallActionButton';
import { useCanAccess } from '../hooks/useCanAccess';
import AccessDenied from './AccessDenied';
import ActivityFeed, { type Activity } from './ActivityFeed';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import { usePresence } from '../hooks/usePresence';
import { RealTimeEventType } from '../services/webSocketService';
import { WebSocketStatus } from './WebSocketStatus';
import PresenceIndicator from './ui/PresenceIndicator';
import { useSchoolInsights } from '../hooks/useSchoolInsights';

interface AdminDashboardProps {
    onOpenEditor: () => void;
    // New Prop to pass toast function down
    onShowToast: (msg: string, type: ToastType) => void;
}

type DashboardView = 'home' | 'users' | 'stats' | 'ppdb' | 'permissions' | 'ai-cache' | 'announcements';
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

interface PPDBRegistrant {
  status: 'pending' | 'approved' | 'rejected';
}

const SchoolInsightsContent: React.FC = () => {
  const { insights, loading, error, refreshInsights } = useSchoolInsights({ enabled: true });

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 w-full">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="text-center py-4">
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">
          {error || 'Belum ada data insight'}
        </p>
        <button
          onClick={refreshInsights}
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{insights.overview.totalStudents}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Siswa</p>
        </div>
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{insights.overview.averageGPA.toFixed(1)}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Rata-rata Nilai</p>
        </div>
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{insights.overview.averageAttendance.toFixed(1)}%</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Kehadiran</p>
        </div>
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{insights.overview.atRiskStudents}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Siswa Berisiko</p>
        </div>
      </div>

      {insights.aiAnalysis && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            <span className="font-semibold">AI Insight:</span> {insights.aiAnalysis}
          </p>
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenEditor, onShowToast }) => {
  const { user: _user, canAccess } = useCanAccess();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [pendingPPDB, setPendingPPDB] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<{ lastSync?: string; stats?: Record<string, unknown> } | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [_offlineData, setOfflineData] = useState<CachedAdminData | null>(null);
  const [navigatingView, setNavigatingView] = useState<string | null>(null);

  const {
    showNotification,
    createNotification
  } = usePushNotifications();

  const { isOnline, isSlow } = useNetworkStatus();
  
  const {
     getPendingCount,
     getFailedCount,
     sync,
     isSyncing: isActionQueueSyncing
   } = useOfflineActionQueue();

  const adminEventTypes = useMemo(() => [
    'user_role_changed',
    'user_status_changed',
    'announcement_created',
    'announcement_updated',
    'notification_created',
    'grade_updated',
    'attendance_updated',
    'message_created',
    'message_updated',
  ] as RealTimeEventType[], []);

  const handleAdminRealtimeEvent = useCallback((event: unknown) => {
    const typedEvent = event as { entity: string; type: string; data?: Record<string, unknown> };

    if (typedEvent.entity === 'user') {
      logger.info('Real-time event: user updated');
      setDashboardData(prev => ({ ...prev, lastSync: new Date().toISOString() }));
    } else if (typedEvent.entity === 'announcement') {
      logger.info('Real-time event: announcement updated');
      setDashboardData(prev => ({ ...prev, lastSync: new Date().toISOString() }));
    } else if (typedEvent.type === 'notification_created') {
      logger.info('Real-time event: notification created');
    }
  }, []);

  const { isConnected, isConnecting } = useRealtimeEvents({
    eventTypes: adminEventTypes,
    enabled: isOnline,
    onEvent: handleAdminRealtimeEvent,
  });

  const { onlineUsers, isTracking: isPresenceTracking } = usePresence({
    enabled: isOnline && isConnected,
  });

  const getCurrentUserId = (): string => {
    const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
    if (userJSON) {
      const user = JSON.parse(userJSON);
      return user.id || '';
    }
    return '';
  };

  const applyCachedData = useCallback((cachedData: CachedAdminData, isFallback: boolean = false) => {
    setOfflineData(cachedData);
    setDashboardData({ lastSync: new Date(cachedData.lastUpdated).toISOString(), stats: cachedData.systemStats });
    setPendingPPDB(cachedData.pendingPPDB.filter(p => p.status === 'pending').length);
    if (isFallback) {
      onShowToast?.('Data terakhir dari cache', 'warning');
    } else {
      onShowToast?.('Menggunakan data offline', 'info');
    }
  }, [onShowToast]);

  // Initialize offline services (Issue #1315)
  const offlineDataService = useOfflineDataService();
  useOfflineData('admin', getCurrentUserId());

  // Load dashboard data with offline support and automatic retry (Issue #1315)
  useEffect(() => {
    const loadDashboardData = async () => {
      const adminId = getCurrentUserId();

      // Try offline cache first
      if (!isOnline) {
        const cachedData = offlineDataService.getCachedAdminData(adminId);
        if (cachedData) {
          applyCachedData(cachedData);
          setError({ type: ErrorType.OFFLINE_ERROR, message: getOfflineMessage() });
        } else {
          setError({ type: ErrorType.OFFLINE_ERROR, message: 'Data cache tidak tersedia. ' + getOfflineMessage() });
        }
        setLoading(false);
        setSyncStatus('idle');
        return;
      }

      // Online mode - load fresh data and cache it
      setLoading(true);
      setError(null);
      setSyncStatus('syncing');

      try {
        await retryWithBackoff(
          async () => {
            // Load fresh data from API (implementation depends on your API)
            // const freshData = await adminAPI.getDashboardData();
            // setDashboardData(freshData);
            // setPendingPPDB(freshData.pendingPPDBCount);

            // Cache admin data for offline use
            // await offlineDataService.cacheAdminData({
            //   adminId,
            //   systemStats: freshData.systemStats,
            //   ppdbStats: freshData.ppdbStats,
            //   recentUsers: freshData.recentUsers,
            //   pendingPPDB: freshData.pendingPPDB,
            //   announcements: freshData.announcements,
            // });

            // For now, set minimal dashboard data
            const freshData = { lastSync: new Date().toISOString(), stats: {} };
            setDashboardData(freshData);

            // Cache minimal data for offline support
            await offlineDataService.cacheAdminData({
              adminId,
              systemStats: {},
              ppdbStats: {},
              recentUsers: [],
              pendingPPDB: [],
              announcements: [],
            });
          },
          'loadDashboardData',
          {
            maxAttempts: RETRY_CONFIG.MAX_ATTEMPTS,
            baseDelayMs: RETRY_CONFIG.BASE_DELAY_MS,
            maxDelayMs: RETRY_CONFIG.MAX_DELAY_MS,
            backoffMultiplier: RETRY_CONFIG.BACKOFF_MULTIPLIER,
          }
        );
        setSyncStatus('synced');
      } catch (err) {
        logger.error('Failed to load admin dashboard data:', err);
        const appError = classifyError(err, { operation: 'loadDashboardData', timestamp: Date.now() });

        setError({ type: appError.type, message: appError.message });

        // Try to load cached data as fallback
        const cachedData = offlineDataService.getCachedAdminData(adminId);
        if (cachedData) {
          applyCachedData(cachedData, true);
          setError({
            type: appError.type,
            message: `Data terakhir dari cache. ${appError.type === ErrorType.NETWORK_ERROR ? getOfflineMessage() : 'Silakan cek koneksi atau coba lagi nanti.'}`
          });
        }
        setSyncStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isOnline, onShowToast, offlineDataService, applyCachedData]);

  // Show slow connection warning
  useEffect(() => {
    if (isSlow && isOnline) {
      onShowToast(getSlowConnectionMessage(), 'info');
    }
  }, [isSlow, isOnline, onShowToast]);

  // Check notification permission status without requesting on page load
  // Permission will only be requested after explicit user interaction
  useEffect(() => {
    const checkNotificationStatus = async () => {
      // Only check if permission is already granted, don't request on page load
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        logger.info('Admin notifications already enabled');
        await showNotification(
          createNotification(
            'system',
            'Notifikasi Aktif',
            'Sistem notifikasi admin telah diaktifkan'
          )
        );
      }
    };

    checkNotificationStatus();
  }, [showNotification, createNotification]);

  // Initialize voice commands
  const {
    isSupported: voiceSupported,
    handleVoiceCommand,
    getAvailableCommands,
  } = useDashboardVoiceCommands({
    userRole: 'admin',
    onNavigate: (view: string) => {
      const validViews: DashboardView[] = ['home', 'ppdb', 'stats'];
      if (validViews.includes(view as DashboardView)) {
        setCurrentView(view as DashboardView);
        onShowToast(`Navigasi ke ${view}`, 'success');
      }
    },
    onAction: (action: string) => {
      switch (action) {
        case 'open_library':
          onOpenEditor();
          onShowToast('Membuka perpustakaan', 'success');
          break;
        case 'open_calendar':
          onShowToast('Kalender akan segera tersedia', 'info');
          break;
        default:
          onShowToast(`Menjalankan: ${action}`, 'info');
      }
    },
    onShowHelp: () => {
      setShowVoiceHelp(true);
    },
    onLogout: () => {
      onShowToast('Keluar dari sistem...', 'info');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
  });

  const handleVoiceCommandCallback = useCallback((command: VoiceCommand) => {
    const success = handleVoiceCommand(command);
    if (success) {
      logger.info('Voice command executed:', command.action);
    } else {
      onShowToast('Perintah tidak dikenali atau tidak tersedia', 'error');
    }
  }, [handleVoiceCommand, onShowToast]);

  const handleManualSync = useCallback(async () => {
    if (!isOnline) {
      onShowToast('Tidak dapat sinkronisasi saat offline', 'error');
      return;
    }

    setSyncStatus('syncing');
    try {
      await sync();
      setSyncStatus('synced');
      onShowToast('Sinkronisasi berhasil', 'success');
    } catch (syncError) {
      logger.error('Manual sync failed:', syncError);
      setSyncStatus('failed');
      onShowToast('Sinkronisasi gagal. Silakan coba lagi', 'error');
    }
  }, [isOnline, sync, onShowToast]);

  const handleViewNavigation = useCallback((view: DashboardView) => {
    setNavigatingView(view);
    // Simulate navigation delay to show loading state
    setTimeout(() => {
      setCurrentView(view);
      setNavigatingView(null);
    }, 300);
  }, []);

  // Notify admin of new PPDB registrations
  useEffect(() => {
    if (currentView === 'home') {
        const saved = localStorage.getItem(STORAGE_KEYS.PPDB_REGISTRANTS); // Use Constant
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const count = data.filter((r: PPDBRegistrant) => r.status === 'pending').length;
                
                // Notify if new pending registrations
                if (count > 0 && count !== pendingPPDB && pendingPPDB > 0) {
                  showNotification(
                    createNotification(
                      'ppdb',
                      'Pendaftaran Baru PPDB',
                      `Ada ${count} pendaftaran PPDB yang menunggu persetujuan`
                    )
                  );
                }
                
                setPendingPPDB(count);
            } catch {
                logger.error("Error reading PPDB data");
            }
        }
    }
  }, [currentView, pendingPPDB, showNotification, createNotification]);

  // Permission checks for admin dashboard - AFTER all hooks
  const adminAccess = canAccess('system.admin');
  const _statsAccess = canAccess('system.stats');
  
  if (!adminAccess.canAccess) {
    return (
      <AccessDenied 
        onBack={() => {}} // Admin typically has no back button
        requiredPermission={adminAccess.requiredPermission}
        message="You need administrator privileges to access this dashboard."
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map(i => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Offline/ Error State */}
        {error && (
          <ErrorMessage 
            message={error.message}
            variant="card"
            className="mb-6"
          />
        )}

        {currentView === 'home' && (
            <>
                <div className={`bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 sm:p-8 shadow-lg border border-neutral-200/60 dark:border-neutral-700/60 section-rhythm-lg backdrop-blur-sm ${!isOnline ? 'animate-pulse' : 'animate-fade-in-up'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent tracking-tight">
                                Dashboard Administrator
                                {!isOnline && <span className="ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">(Offline)</span>}
                            </h1>
                            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium max-w-2xl">
                                Selamat datang, Admin. Kelola konten website dan pengguna dari sini dengan kontrol penuh.
                                {dashboardData?.lastSync && (
                                    <span className="text-xs text-neutral-500 dark:text-neutral-500 block mt-2 font-normal">
                                        <span className="inline-flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            Terakhir diperbarui: {new Date(dashboardData.lastSync).toLocaleString('id-ID')}
                                        </span>
                                    </span>
                                )}
                            </p>
                        </div>
                        
                         {/* Enhanced Sync Controls */}
                         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                             {/* Sync Status Indicator */}
                             {syncStatus !== 'idle' && (
                                 <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                                     syncStatus === 'syncing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                                     syncStatus === 'synced' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' :
                                     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                 }`}>
                                     {syncStatus === 'syncing' && (
                                         <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                         </svg>
                                     )}
                                     {syncStatus === 'synced' && (
                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                         </svg>
                                     )}
                                     {syncStatus === 'failed' && (
                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                         </svg>
                                     )}
                                     {syncStatus === 'syncing' ? 'Menyinkronkan...' : syncStatus === 'synced' ? 'Sinkronisasi Selesai' : 'Gagal Sinkronisasi'}
                                 </div>
                             )}
                            
                             {/* Offline Action Queue Badge */}
                             {(getPendingCount() > 0 || getFailedCount() > 0) && (
                                 <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium shadow-sm border border-amber-200 dark:border-amber-800">
                                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                         <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                     </svg>
                                     <span className="flex items-center gap-1">
                                         {getPendingCount() > 0 && `${getPendingCount()} menunggu`}
                                         {getPendingCount() > 0 && getFailedCount() > 0 && ' • '}
                                         {getFailedCount() > 0 && `${getFailedCount()} gagal`}
                                     </span>
                                 </div>
                             )}

                             {/* WebSocket Connection Status */}
                             {isOnline && (
                                 <div className="flex items-center">
                                     <WebSocketStatus compact showReconnectButton={false} className="text-xs" />
                                 </div>
                             )}

                              {/* Manual Sync Button */}
                              <SmallActionButton
                                  onClick={handleManualSync}
                                  disabled={syncStatus === 'syncing' || isActionQueueSyncing || !isOnline}
                                  tooltip="Sinkronisasi manual"
                                  className="flex items-center gap-2 px-4 py-2"
                              >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                 </svg>
                                 <span>Sync</span>
                             </SmallActionButton>
                        </div>
                    </div>
                </div>

                  {/* Enhanced Voice Commands Section */}
                  {voiceSupported && (
                      <div className={`bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 shadow-lg border border-indigo-200/60 dark:border-indigo-800/60 section-rhythm-lg animate-fade-in-up backdrop-blur-sm`}>
                          <div className="flex items-center justify-between gap-4">
                              <div className="space-y-2">
                                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                      </svg>
                                      Perintah Suara
                                  </h2>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                      Kontrol dashboard dengan suara Anda untuk navigasi lebih cepat
                                  </p>
                              </div>
                              <div className="flex items-center gap-3">
                                  <SmallActionButton
                                      onClick={() => setShowVoiceHelp(true)}
                                      className="px-4 py-2"
                                  >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Bantuan
                                  </SmallActionButton>
                                  <VoiceInputButton
                                      onTranscript={(transcript) => {
                                        onShowToast(`Transkripsi: ${transcript}`, 'info');
                                      }}
                                      onCommand={handleVoiceCommandCallback}
                                      onError={(errorMsg) => onShowToast(errorMsg, 'error')}
                                      className="flex-shrink-0"
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 component-rhythm-lg animate-fade-in-up">
                    {canAccess('content.update').canAccess && (
                        <button
                            onClick={onOpenEditor}
                            aria-label="Buka AI Site Editor"
                             className={`${getGradientClass('INDIGO_MAIN')} rounded-2xl p-6 lg:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                            <div className={`${OPACITY_TOKENS.WHITE_20} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:${OPACITY_TOKENS.WHITE_30.replace('bg-white/', '')} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out`}>
                                <SparklesIcon className="w-7 h-7 text-white" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold mb-3 relative z-10">AI Site Editor</h3>
                            <p className="text-indigo-100 text-sm lg:text-base leading-relaxed relative z-10">Edit konten Program Unggulan dan Berita menggunakan bantuan AI yang canggih.</p>
                        </button>
                    )}

                    {canAccess('ppdb.manage').canAccess && (
                        <div className="relative">
                            {pendingPPDB > 0 && (
                                <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-md animate-pulse ring-2 ring-white dark:ring-neutral-800 z-10">
                                    {pendingPPDB}
                                </span>
                            )}
                            <DashboardActionCard
                                icon={<ClipboardDocumentCheckIcon />}
                                title="PPDB Online"
                                description="Verifikasi data calon siswa baru."
                                colorTheme="orange"
                                statusBadge="Aktif"
                                offlineBadge="Mode Tertunda"
                                isOnline={isOnline}
                                disabled={navigatingView === 'ppdb' || !isOnline}
                                onClick={() => isOnline ? handleViewNavigation('ppdb') : onShowToast('Memerlukan koneksi internet untuk mengakses PPDB Management', 'error')}
                                ariaLabel="Buka Manajemen PPDB Online"
                            />
                        </div>
                    )}

                    {canAccess('users.read').canAccess && (
                        <DashboardActionCard
                            icon={<UsersIcon />}
                            title="Manajemen User"
                            description="Kelola akun guru, siswa, dan staff."
                            colorTheme="blue"
                            statusBadge="Aktif"
                            isOnline={isOnline}
                            disabled={navigatingView === 'users'}
                            onClick={() => handleViewNavigation('users')}
                            ariaLabel="Buka Manajemen User"
                        />
                    )}

                        {canAccess('system.stats').canAccess && (
                            <DashboardActionCard
                                icon={<ChartBarIcon />}
                                title="Laporan & Log"
                                description="Pantau statistik sistem dan factory reset."
                                colorTheme="primary"
                                statusBadge="Aktif"
                                isOnline={isOnline}
                                disabled={navigatingView === 'stats'}
                                onClick={() => handleViewNavigation('stats')}
                                ariaLabel="Buka Laporan & Log Sistem"
                            />
                        )}

                        {canAccess('announcements.manage').canAccess && (
                            <DashboardActionCard
                                icon={<MegaphoneIcon />}
                                title="Pengumuman"
                                description="Buat dan kelola pengumuman sekolah."
                                colorTheme="purple"
                                statusBadge="Aktif"
                                isOnline={isOnline}
                                disabled={navigatingView === 'announcements'}
                                onClick={() => handleViewNavigation('announcements')}
                                ariaLabel="Buka Manajemen Pengumuman"
                            />
                        )}



                    {canAccess('system.admin').canAccess && (
                        <button
                            onClick={() => handleViewNavigation('ai-cache')}
                            disabled={navigatingView === 'ai-cache'}
                            aria-label="Buka AI Cache Manager"
                             className={`${getGradientClass('GREEN_TEAL')} rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${navigatingView === 'ai-cache' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`${OPACITY_TOKENS.WHITE_20} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:${OPACITY_TOKENS.WHITE_30.replace('bg-white/', '')} group-hover:scale-110 transition-all duration-300 ease-out`}>
                                <ChartBarIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">AI Cache Manager</h3>
                            <p className="text-green-100 text-sm leading-relaxed">Monitor dan kelola cache respons AI untuk performa optimal.</p>
                        </button>
                    )}

                    {canAccess('system.admin').canAccess && (
                        <button
                            onClick={() => handleViewNavigation('permissions')}
                            disabled={navigatingView === 'permissions'}
                            aria-label="Buka Permission System"
                             className={`${getGradientClass('PURPLE_MAIN')} rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${navigatingView === 'permissions' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`${OPACITY_TOKENS.WHITE_20} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:${OPACITY_TOKENS.WHITE_30.replace('bg-white/', '')} group-hover:scale-110 transition-all duration-300 ease-out`}>
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">Permission System</h3>
                            <p className="text-purple-100 text-sm leading-relaxed">Kelola sistem perizinan peran dan audit log akses.</p>
                        </button>
                    )}
                </div>

                {/* School Insights Section */}
                {canAccess('academic.grades').canAccess && (
                  <Card padding="lg" className="mb-8 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <ChartBarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Insight Sekolah
                          </h2>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Analytics dan performa sekolah secara keseluruhan
                          </p>
                        </div>
                      </div>
                      <SchoolInsightsContent />
                    </div>
                  </Card>
                )}

                {/* Activity Feed */}
                <Card padding="lg" className={`mb-8 animate-fade-in-up`}>
                  <ActivityFeed
                    userId={getCurrentUserId()}
                    userRole="admin"
                    eventTypes={[
                      'user_role_changed',
                      'user_status_changed',
                      'announcement_created',
                      'announcement_updated',
                      'notification_created',
                      'grade_updated',
                      'attendance_updated',
                      'message_created',
                      'message_updated',
                    ]}
                    showFilter
                    maxActivities={50}
                    onActivityClick={(activity: Activity) => {
                      if (activity.entity === 'user') {
                        setCurrentView('users');
                        onShowToast('Navigasi ke manajemen user', 'success');
                      } else if (activity.entity === 'announcement') {
                        setCurrentView('announcements');
                        onShowToast('Navigasi ke pengelolaan pengumuman', 'success');
                      }
                    }}
                  />
                  {isOnline && (
                      <div className="mt-4 flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} ${isConnecting ? 'animate-pulse' : ''}`}></div>
                          <span className="text-neutral-600 dark:text-neutral-400">
                              {isConnected ? 'Real-time Aktif' : isConnecting ? 'Menghubungkan...' : 'Tidak Terhubung'}
                          </span>
                          {isPresenceTracking && onlineUsers.length > 0 && (
                            <div className="ml-auto">
                              <PresenceIndicator
                                users={onlineUsers}
                                variant="badge"
                                showCount
                              />
                            </div>
                          )}
                      </div>
                  )}
                </Card>
            </>
        )}

        {/* User Management View */}
        {currentView === 'users' && (
            <UserManagement 
                onBack={() => setCurrentView('home')} 
                onShowToast={onShowToast}
            />
        )}

        {/* System Stats View */}
        {currentView === 'stats' && (
            <SystemStats 
                onBack={() => setCurrentView('home')} 
                onShowToast={onShowToast}
            />
        )}

        {/* PPDB Management View */}
        {currentView === 'ppdb' && (
            <PPDBManagement 
                onBack={() => setCurrentView('home')} 
                onShowToast={onShowToast}
            />
        )}

        {/* Permission Management View */}
        {currentView === 'permissions' && (
            <PermissionManager
                onShowToast={onShowToast}
            />
        )}

        {/* AI Cache Management View */}
        {currentView === 'ai-cache' && (
                 <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">AI Cache Management</h2>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Monitor dan kelola cache respons AI untuk performa optimal
                        </p>
                    </div>
                    <button
                        onClick={() => setCurrentView('home')}
                        className="px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
                <AICacheManager />
            </div>
        )}

        {currentView === 'announcements' && (
            <AnnouncementManager 
                onBack={() => setCurrentView('home')} 
                onShowToast={onShowToast} 
            />
        )}

        {/* Voice Commands Help Modal */}
        <VoiceCommandsHelp
          isOpen={showVoiceHelp}
          onClose={() => setShowVoiceHelp(false)}
          userRole="admin"
          availableCommands={getAvailableCommands()}
        />

      </div>
    </main>
  );
};

export default AdminDashboard;
