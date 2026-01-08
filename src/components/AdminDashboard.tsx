
import React, { useState, useEffect, useCallback } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UsersIcon } from './icons/UsersIcon';

import { ChartBarIcon } from './icons/ChartBarIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import PPDBManagement from './PPDBManagement'; // Import PPDB Component
import PermissionManager from './admin/PermissionManager'; // Import Permission Manager
import AICacheManager from './AICacheManager'; // Import AI Cache Manager
import { ToastType } from './Toast';
import { STORAGE_KEYS } from '../constants'; // Import constants
import { logger } from '../utils/logger';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { getGradientClass } from '../config/gradients';
import ErrorMessage from './ui/ErrorMessage';
import DashboardActionCard from './ui/DashboardActionCard';
import { CardSkeleton } from './ui/Skeleton';
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import type { VoiceCommand } from '../types';
import VoiceInputButton from './VoiceInputButton';
import VoiceCommandsHelp from './VoiceCommandsHelp';
import SmallActionButton from './ui/SmallActionButton';
import { useCanAccess } from '../hooks/useCanAccess';
import AccessDenied from './AccessDenied';

interface AdminDashboardProps {
    onOpenEditor: () => void;
    // New Prop to pass toast function down
    onShowToast: (msg: string, type: ToastType) => void;
}

type DashboardView = 'home' | 'users' | 'stats' | 'ppdb' | 'permissions' | 'ai-cache'; // Add 'ai-cache' view

interface PPDBRegistrant {
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenEditor, onShowToast }) => {
  // ALL hooks first
  const { user: _user, canAccess } = useCanAccess();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [pendingPPDB, setPendingPPDB] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{ lastSync?: string; stats?: Record<string, unknown> } | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  // Initialize push notifications
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

  const { isOnline, isSlow } = useNetworkStatus();

  // Load dashboard data with offline support
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isOnline) {
        // Try to load cached data
        const cachedData = localStorage.getItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE);
        if (cachedData) {
          setDashboardData(JSON.parse(cachedData));
          setError(getOfflineMessage());
        } else {
          setError(getOfflineMessage());
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load fresh data and cache for offline use
        const freshData = { lastSync: new Date().toISOString(), stats: {} };
        setDashboardData(freshData);
        localStorage.setItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE, JSON.stringify(freshData));
      } catch (err) {
        logger.error('Failed to load admin dashboard data:', err);
        setError('Gagal memuat data dashboard. Silakan coba lagi.');
        
        // Try cached data as fallback
        const cachedData = localStorage.getItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE);
        if (cachedData) {
          setDashboardData(JSON.parse(cachedData));
          setError('Data terakhir dari cache. ' + getOfflineMessage());
        }
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
            message={error}
            variant="card"
            className="mb-6"
          />
        )}

        {currentView === 'home' && (
            <>
                <div className={`bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 ${!isOnline ? 'animate-pulse' : 'animate-fade-in-up'}`}>
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
                            className={`${getGradientClass('INDIGO_MAIN')} rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}
                        >
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 ease-out">
                                <SparklesIcon className="w-6 h-6 text-white" />
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

                    {canAccess('system.admin').canAccess && (
                        <button
                            onClick={() => setCurrentView('ai-cache')}
                            aria-label="Buka AI Cache Manager"
                            className={`${getGradientClass('GREEN_TEAL')} rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}
                        >
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 ease-out">
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
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 ease-out">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">Permission System</h3>
                            <p className="text-purple-100 text-sm leading-relaxed">Kelola sistem perizinan peran dan audit log akses.</p>
                        </button>
                    )}
                </div>
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
