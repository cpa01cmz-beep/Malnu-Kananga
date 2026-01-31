
import React, { useState, useEffect, useCallback } from 'react';
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
import { STORAGE_KEYS, OPACITY_TOKENS } from '../constants';
import { logger } from '../utils/logger';
import { usePushNotifications } from '../hooks/useUnifiedNotifications';
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenEditor, onShowToast }) => {
  const { user: _user, canAccess } = useCanAccess();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [pendingPPDB, setPendingPPDB] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<{ lastSync?: string; stats?: Record<string, unknown> } | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

  const { isOnline, isSlow } = useNetworkStatus();
  
  const {
     getPendingCount,
     getFailedCount,
     sync,
     isSyncing: isActionQueueSyncing
   } = useOfflineActionQueue();

  const { isConnected, isConnecting } = useRealtimeEvents({
    eventTypes: [
      'user_role_changed',
      'user_status_changed',
      'announcement_created',
      'announcement_updated',
      'notification_created',
      'grade_updated',
      'attendance_updated',
      'message_created',
      'message_updated',
    ],
    enabled: isOnline,
  });

  const getCurrentUserId = (): string => {
    const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
    if (userJSON) {
      const user = JSON.parse(userJSON);
      return user.id || '';
    }
    return '';
  };

  // Load dashboard data with offline support and automatic retry
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isOnline) {
        const cachedData = localStorage.getItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE);
        if (cachedData) {
          try {
            setDashboardData(JSON.parse(cachedData));
            setError({ type: ErrorType.OFFLINE_ERROR, message: getOfflineMessage() });
          } catch (parseError) {
            logger.error('Failed to parse cached dashboard data:', parseError);
            setError({ type: ErrorType.OFFLINE_ERROR, message: 'Data cache tidak tersedia. ' + getOfflineMessage() });
          }
        } else {
          setError({ type: ErrorType.OFFLINE_ERROR, message: 'Data cache tidak tersedia. ' + getOfflineMessage() });
        }
        setLoading(false);
        setSyncStatus('idle');
        return;
      }

      setLoading(true);
      setError(null);
      setSyncStatus('syncing');

      try {
        await retryWithBackoff(
          async () => {
            const freshData = { lastSync: new Date().toISOString(), stats: {} };
            setDashboardData(freshData);
            localStorage.setItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE, JSON.stringify(freshData));
          },
          'loadDashboardData',
          { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 5000, backoffMultiplier: 2 }
        );
        setSyncStatus('synced');
      } catch (err) {
        logger.error('Failed to load admin dashboard data:', err);
        const appError = classifyError(err, { operation: 'loadDashboardData', timestamp: Date.now() });
        
        setError({ type: appError.type, message: appError.message });
        
        const cachedData = localStorage.getItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE);
        if (cachedData) {
          try {
            setDashboardData(JSON.parse(cachedData));
            setError({ 
              type: appError.type, 
              message: `Data terakhir dari cache. ${appError.type === ErrorType.NETWORK_ERROR ? getOfflineMessage() : 'Silakan cek koneksi atau coba lagi nanti.'}` 
            });
          } catch (parseError) {
            logger.error('Failed to parse cached dashboard data:', parseError);
          }
        }
        setSyncStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isOnline]);

  // Show slow connection warning
  useEffect(() => {
    if (isSlow && isOnline) {
      onShowToast(getSlowConnectionMessage(), 'info');
    }
  }, [isSlow, isOnline, onShowToast]);

  // Request notification permission on first load
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const granted = await requestPermission();
        if (granted) {
          logger.info('Admin notifications enabled');
          await showNotification(
            createNotification(
              'system',
              'Notifikasi Aktif',
              'Sistem notifikasi admin telah diaktifkan'
            )
          );
        }
      } catch (error) {
        logger.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, [requestPermission, showNotification, createNotification]);

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
                <div className={`bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 ${!isOnline ? 'animate-pulse' : 'animate-fade-in-up'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                Dashboard Administrator
                                {!isOnline && <span className="ml-2 text-sm font-normal text-amber-600 dark:text-amber-400">(Offline)</span>}
                            </h1>
                            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                                Selamat datang, Admin. Kelola konten website dan pengguna dari sini.
                                {dashboardData?.lastSync && (
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-1">
                                        Terakhir diperbarui: {new Date(dashboardData.lastSync).toLocaleString('id-ID')}
                                    </span>
                                )}
                            </p>
                        </div>
                        
                        {/* Sync Controls */}
                        <div className="flex items-center gap-3">
                            {/* Sync Status Indicator */}
                            {syncStatus !== 'idle' && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                    syncStatus === 'syncing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                    syncStatus === 'synced' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                }`}>
                                    {syncStatus === 'syncing' && (
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {syncStatus === 'synced' && '✓ Sinkronisasi Selesai'}
                                    {syncStatus === 'failed' && '✕ Gagal Sinkronisasi'}
                                </div>
                            )}
                            
                            {/* Offline Action Queue Badge */}
                            {(getPendingCount() > 0 || getFailedCount() > 0) && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                                    <span className="flex items-center gap-1">
                                        {getPendingCount() > 0 && `${getPendingCount()} menunggu`}
                                        {getPendingCount() > 0 && getFailedCount() > 0 && ' • '}
                                        {getFailedCount() > 0 && `${getFailedCount()} gagal`}
                                    </span>
                                </div>
                            )}
                            
                            {/* Manual Sync Button */}
                            <SmallActionButton
                                onClick={handleManualSync}
                                disabled={syncStatus === 'syncing' || isActionQueueSyncing || !isOnline}
                                title={isOnline ? 'Sinkronisasi manual' : 'Memerlukan koneksi internet'}
                                className="flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Sync
                            </SmallActionButton>
                        </div>
                    </div>
                </div>

                {/* Voice Commands Section */}
                {voiceSupported && (
                    <div className={`bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Perintah Suara
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    Gunakan suara untuk navigasi cepat dashboard
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <SmallActionButton
                                    onClick={() => setShowVoiceHelp(true)}
                                >
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {canAccess('content.update').canAccess && (
                        <button
                            onClick={onOpenEditor}
                            aria-label="Buka AI Site Editor"
                             className={`${getGradientClass('INDIGO_MAIN')} rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900`}
                        >
                            <div className={`${OPACITY_TOKENS.WHITE_20} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:${OPACITY_TOKENS.WHITE_30.replace('bg-white/', '')} group-hover:scale-110 transition-all duration-300 ease-out`}>
                                <SparklesIcon className="w-6 h-6 text-white" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">AI Site Editor</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed">Edit konten Program Unggulan dan Berita menggunakan bantuan AI.</p>
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
                                onClick={() => isOnline ? setCurrentView('ppdb') : onShowToast('Memerlukan koneksi internet untuk mengakses PPDB Management', 'error')}
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
                            onClick={() => setCurrentView('users')}
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
                            onClick={() => setCurrentView('stats')}
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
                            onClick={() => setCurrentView('announcements')}
                            ariaLabel="Buka Manajemen Pengumuman"
                        />
                    )}

                    {canAccess('system.admin').canAccess && (
                        <button
                            onClick={() => setCurrentView('ai-cache')}
                            aria-label="Buka AI Cache Manager"
                             className={`${getGradientClass('GREEN_TEAL')} rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}
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
                            onClick={() => setCurrentView('permissions')}
                            aria-label="Buka Permission System"
                             className={`${getGradientClass('PURPLE_MAIN')} rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}
                        >
                            <div className={`${OPACITY_TOKENS.WHITE_20} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:${OPACITY_TOKENS.WHITE_30.replace('bg-white/', '')} group-hover:scale-110 transition-all duration-300 ease-out`}>
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">Permission System</h3>
                            <p className="text-purple-100 text-sm leading-relaxed">Kelola sistem perizinan peran dan audit log akses.</p>
                        </button>
                    )}
                </div>

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
