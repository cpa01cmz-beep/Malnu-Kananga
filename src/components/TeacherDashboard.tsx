
import React, { useState, useEffect, useCallback } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import GradingManagement from './GradingManagement';
import ClassManagement from './ClassManagement';
import MaterialUpload from './MaterialUpload';
import SchoolInventory from './SchoolInventory';
import { ToastType } from './Toast';
import { UserExtraRole, UserRole } from '../types/permissions';
import { permissionService } from '../services/permissionService';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { STORAGE_KEYS } from '../constants';
import Card from './ui/Card';
import ErrorMessage from './ui/ErrorMessage';

interface TeacherDashboardProps {
    onShowToast?: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type ViewState = 'home' | 'grading' | 'class' | 'upload' | 'inventory';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{ lastSync?: string } | null>(null);

  // Initialize push notifications
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

  const { isOnline, isSlow } = useNetworkStatus();

  const handleToast = useCallback((msg: string, type: ToastType) => {
      if (onShowToast) onShowToast(msg, type);
  }, [onShowToast]);

  // Load dashboard data with offline support
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isOnline) {
        // Try to load cached data
        const cachedData = localStorage.getItem(STORAGE_KEYS.TEACHER_DASHBOARD_CACHE);
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
        // Load fresh data (implementation depends on your API)
        // const freshData = await teacherAPI.getDashboardData();
        // setDashboardData(freshData);
        // Cache the data for offline use
        // localStorage.setItem(STORAGE_KEYS.TEACHER_DASHBOARD_CACHE, JSON.stringify(freshData));
        
        // For now, set minimal dashboard data
        setDashboardData({ lastSync: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.TEACHER_DASHBOARD_CACHE, JSON.stringify({ lastSync: new Date().toISOString() }));
      } catch (err) {
        logger.error('Failed to load dashboard data:', err);
        setError('Gagal memuat data dashboard. Silakan coba lagi.');
        
        // Try to load cached data as fallback
        const cachedData = localStorage.getItem(STORAGE_KEYS.TEACHER_DASHBOARD_CACHE);
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
      handleToast(getSlowConnectionMessage(), 'info');
    }
  }, [isSlow, isOnline, handleToast]);

  // Request notification permission on first load
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const granted = await requestPermission();
        if (granted) {
          logger.info('Teacher notifications enabled');
          await showNotification(
            createNotification(
              'system',
              'Notifikasi Guru Aktif',
              'Sistem notifikasi guru telah diaktifkan'
            )
          );
        }
      } catch (error) {
        logger.error('Failed to initialize teacher notifications:', error);
      }
    };

    initializeNotifications();
  }, [requestPermission, showNotification, createNotification]);

  // Check permissions for teacher role with extra role
  const checkPermission = (permission: string) => {
    const result = permissionService.hasPermission('teacher' as UserRole, extraRole, permission);
    return result.granted;
  };

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
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-neutral-100 dark:bg-neutral-800 h-32 rounded-xl mb-4"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                </div>
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
                <Card padding="lg" className={`mb-8 ${!isOnline ? 'animate-pulse' : 'animate-fade-in-up'}`}>
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                        Portal Guru 
                        {!isOnline && <span className="ml-2 text-sm font-normal text-amber-600 dark:text-amber-400">(Offline)</span>}
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                        Selamat datang, Bapak/Ibu Guru.
                        {extraRole === 'staff' && <span className="font-semibold text-primary-600 dark:text-primary-400"> (Mode Staff Aktif)</span>}
                        {dashboardData?.lastSync && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-1">
                                Terakhir diperbarui: {new Date(dashboardData.lastSync).toLocaleString('id-ID')}
                            </span>
                        )}
                    </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {checkPermission('academic.classes') && (
                    <Card
                        onClick={() => setCurrentView('class')}
                        aria-label="Buka manajemen Wali Kelas"
                        variant={isOnline ? "interactive" : "default"}
                        className={!isOnline ? 'opacity-60 cursor-not-allowed' : ''}
                    >
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300"><UsersIcon /></div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Wali Kelas</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Kelola data siswa di kelas perwalian Anda.</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOnline ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                            {!isOnline ? 'Offline' : 'Aktif'}
                        </span>
                        {!isOnline && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            Memerlukan koneksi internet
                          </p>
                        )}
                    </Card>
                    )}


                    {checkPermission('academic.grades') && (
                    <Card
                        onClick={() => setCurrentView('grading')}
                        aria-label="Buka Input Nilai"
                        variant={isOnline ? "interactive" : "default"}
                        className={!isOnline ? 'opacity-60 cursor-not-allowed' : ''}
                    >
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300"><ClipboardDocumentCheckIcon /></div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Input Nilai</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Masukkan nilai tugas, UTS, dan UAS.</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOnline ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                            {!isOnline ? 'Mode Tertunda' : 'Aktif'}
                        </span>
                        {!isOnline && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            Perubahan akan disinkronkan saat online
                          </p>
                        )}
                    </Card>
                    )}

                    {checkPermission('content.create') && (
                    <Card
                        onClick={() => setCurrentView('upload')}
                        aria-label="Buka Upload Materi"
                        variant={isOnline ? "interactive" : "default"}
                        className={!isOnline ? 'opacity-60 cursor-not-allowed' : ''}
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300"><DocumentTextIcon /></div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Upload Materi</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Bagikan modul dan bahan ajar digital.</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOnline ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                            {!isOnline ? 'Mode Tertunda' : 'Aktif'}
                        </span>
                        {!isOnline && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            Upload akan antri saat online
                          </p>
                        )}
                    </Card>
                    )}

                    {extraRole === 'staff' && checkPermission('inventory.manage') && (
                        <Card
                            onClick={() => setCurrentView('inventory')}
                            aria-label="Buka Inventaris"
                            variant={isOnline ? "gradient" : "default"}
                            gradient={isOnline ? { from: 'from-blue-50', to: 'to-indigo-50' } : undefined}
                            className={!isOnline ? 'opacity-60 cursor-not-allowed' : ''}
                        >
                            <div className="bg-blue-200 dark:bg-blue-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 text-blue-700 dark:text-blue-300"><ArchiveBoxIcon /></div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Inventaris</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Manajemen aset dan sarana prasarana sekolah.</p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOnline ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                                {!isOnline ? 'Mode Tertunda' : 'Tugas Tambahan'}
                            </span>
                            {!isOnline && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                Perubahan akan antri saat online
                              </p>
                            )}
                        </Card>
                    )}
                </div>
            </>
        )}

        {currentView === 'grading' && <GradingManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'class' && <ClassManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'upload' && <MaterialUpload onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'inventory' && <SchoolInventory onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}

      </div>
    </main>
  );
};

export default TeacherDashboard;
