import React, { useState, useEffect } from 'react';
import { UserIcon } from './icons/UserIcon';
import ParentScheduleView from './ParentScheduleView';
import ParentGradesView from './ParentGradesView';
import ParentAttendanceView from './ParentAttendanceView';
import ELibrary from './ELibrary';
import OsisEvents from './OsisEvents';
import { GRADIENT_CLASSES } from '../config/gradients';
import ConsolidatedReportsView from './ConsolidatedReportsView';
import ParentMessagingView from './ParentMessagingView';
import ParentPaymentsView from './ParentPaymentsView';
import ParentMeetingsView from './ParentMeetingsView';
import { ToastType } from './Toast';
import type { ParentChild, Grade } from '../types';
import { parentsAPI, authAPI, gradesAPI, attendanceAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { validateMultiChildDataIsolation } from '../utils/parentValidation';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useEventNotifications } from '../hooks/useEventNotifications';
import { parentGradeNotificationService } from '../services/parentGradeNotificationService';
import BackButton from './ui/BackButton';
import Card from './ui/Card';
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import { useOfflineDataService, useOfflineData, type CachedParentData, type CachedStudentData } from '../services/offlineDataService';

import VoiceCommandsHelp from './VoiceCommandsHelp';
import ParentNotificationSettings from './ParentNotificationSettings';
import NotificationHistory from './NotificationHistory';

interface ParentDashboardProps {
  onShowToast: (msg: string, type: ToastType) => void;
}

type PortalView = 'home' | 'profile' | 'schedule' | 'library' | 'grades' | 'attendance' | 'events' | 'messaging' | 'payments' | 'meetings' | 'reports';

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onShowToast }) => {
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [offlineData, setOfflineData] = useState<CachedParentData | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  const networkStatus = useNetworkStatus();

  // Initialize offline services
  const offlineDataService = useOfflineDataService();
  const { syncStatus, isCached } = useOfflineData('parent');

  // Initialize push notifications
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

  // Initialize event notifications for automated grade monitoring
  const { useMonitorLocalStorage } = useEventNotifications();

  

  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);

      // Try offline cache first
      if (!networkStatus.isOnline) {
        const cachedData = offlineDataService.getCachedParentData();
        if (cachedData) {
          setChildren(cachedData.children);
          setOfflineData(cachedData);
          if (cachedData.children.length > 0) {
            setSelectedChild(cachedData.children[0]);
          }
          onShowToast('Menggunakan data offline', 'info');
          setLoading(false);
          return;
        }
      }

      // Online: fetch fresh data
      try {
        const response = await parentsAPI.getChildren();
        if (response.success && response.data) {
          const validation = validateMultiChildDataIsolation(response.data, '');
          if (!validation.isValid) {
            logger.error('Parent child data validation failed:', validation.errors);
            onShowToast('Validasi data anak gagal: ' + validation.errors.join(', '), 'error');
          }

          setChildren(response.data);
          if (response.data.length > 0) {
            setSelectedChild(response.data[0]);
          }

          // Cache children data for offline access
          try {
            const childrenData: Record<string, CachedStudentData> = {};
            const now = Date.now();
            const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
            // Fetch data for each child
            await Promise.all(response.data.map(async (child: ParentChild) => {
              try {
                const [gradesResponse, attendanceResponse] = await Promise.all([
                  gradesAPI.getByStudent(child.studentId),
                  attendanceAPI.getByStudent(child.studentId)
                ]);

                if (gradesResponse.success && attendanceResponse.success) {
                  childrenData[child.studentId] = {
                    student: {
                      id: child.studentId,
                      userId: child.studentId,
                      nisn: '',
                      nis: child.studentId,
                      class: child.className || '',
                      className: child.className || '',
                      address: '',
                      phoneNumber: '',
                      parentName: '',
                      parentPhone: '',
                      dateOfBirth: '',
                      enrollmentDate: '',
                    },
                    grades: gradesResponse.data || [],
                    attendance: attendanceResponse.data || [],
                    schedule: [], // TODO: Fetch schedule when API is available
                    lastUpdated: now,
                    expiresAt: now + CACHE_DURATION,
                  };
                }
              } catch (error) {
                logger.warn(`Failed to fetch data for child ${child.studentId}:`, error);
              }
            }));

            offlineDataService.cacheParentData({
              children: response.data,
              childrenData,
            });
          } catch (error) {
            logger.warn('Failed to cache parent data:', error);
          }
        } else {
          // Fallback to cache if available
          const cachedData = offlineDataService.getCachedParentData();
          if (cachedData) {
            setChildren(cachedData.children);
            setOfflineData(cachedData);
            if (cachedData.children.length > 0) {
              setSelectedChild(cachedData.children[0]);
            }
            onShowToast('Server tidak tersedia, menggunakan data offline', 'info');
          } else {
            onShowToast('Data anak tidak ditemukan', 'error');
          }
        }
      } catch (error) {
        logger.error('Failed to fetch children:', error);
        
        // Fallback to cache on error
        const cachedData = offlineDataService.getCachedParentData();
        if (cachedData) {
          setChildren(cachedData.children);
          setOfflineData(cachedData);
          if (cachedData.children.length > 0) {
            setSelectedChild(cachedData.children[0]);
          }
          onShowToast('Gagal memuat data, menggunakan data offline', 'info');
        } else {
          if (!networkStatus.isOnline) {
            onShowToast(getOfflineMessage(), 'error');
          } else {
            onShowToast('Gagal memuat data anak', 'error');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [onShowToast, networkStatus.isOnline, offlineDataService]);

  // Request notification permission on first load
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const granted = await requestPermission();
        if (granted) {
          logger.info('Parent notifications enabled');
          await showNotification(
            createNotification(
              'system',
              'Notifikasi Orang Tua Aktif',
              'Sistem notifikasi orang tua telah diaktifkan'
            )
          );
        }
      } catch (error) {
        logger.error('Failed to initialize parent notifications:', error);
      }
    };

    initializeNotifications();
  }, [requestPermission, showNotification, createNotification]);

  // Initialize grade notification monitoring  
  useMonitorLocalStorage('malnu_grades', (newValue: unknown, oldValue: unknown) => {
    // Check if any grades belong to this parent's children
    if (children.length > 0) {
      const childIds = children.map(child => child.studentId);
      if (newValue && Array.isArray(newValue)) {
        newValue.forEach((grade: unknown) => {
          const gradeObj = grade as { studentId: string; id: string };
          if (childIds.includes(gradeObj.studentId)) {
            const child = children.find(c => c.studentId === gradeObj.studentId);
            if (child) {
              // Find previous grade to detect changes
              const previousGrade = oldValue && Array.isArray(oldValue) 
                ? oldValue.find((g: unknown) => (g as { id: string }).id === gradeObj.id)
                : null;

              parentGradeNotificationService.processGradeUpdate(
                child, 
                gradeObj as Grade, 
                previousGrade as Grade | undefined
              );
            }
          }
        });
      }
    }
  });

  // Check for missing grades periodically
  useEffect(() => {
    if (children.length > 0) {
      // Check every 6 hours
      const interval = setInterval(() => {
        parentGradeNotificationService.checkMissingGrades(children);
      }, 6 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [children, useMonitorLocalStorage]);

  // Initialize voice commands
  const {
    getAvailableCommands,
  } = useDashboardVoiceCommands({
    userRole: 'parent',
    onNavigate: (view: string) => {
      const validViews: PortalView[] = ['profile', 'schedule', 'grades', 'attendance', 'events', 'messaging', 'payments', 'meetings', 'reports'];
      if (validViews.includes(view as PortalView)) {
        setCurrentView(view as PortalView);
        onShowToast(`Navigasi ke ${view}`, 'success');
      }
    },
    onAction: (action: string) => {
      switch (action) {
        case 'view_child_grades':
          setCurrentView('grades');
          onShowToast('Menampilkan nilai anak', 'success');
          break;
        case 'view_child_attendance':
          setCurrentView('attendance');
          onShowToast('Menampilkan absensi anak', 'success');
          break;
        case 'view_child_schedule':
          setCurrentView('schedule');
          onShowToast('Menampilkan jadwal anak', 'success');
          break;
        case 'see_notifications':
          onShowToast('Menampilkan notifikasi', 'info');
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

  const handleSelectChild = (child: ParentChild) => {
    setSelectedChild(child);
    setCurrentView('home');
  };

  // Handle manual sync
  const handleSync = async () => {
    if (!networkStatus.isOnline) {
      onShowToast('Memerlukan koneksi internet untuk sinkronisasi', 'error');
      return;
    }

    setSyncInProgress(true);
    onShowToast('Menyinkronkan data...', 'info');

    try {
      await offlineDataService.forceSync();
      
      // Re-fetch data
      window.location.reload(); // Simple refresh to get fresh data
    } catch (error) {
      logger.error('Failed to sync:', error);
      onShowToast('Sinkronisasi gagal, silakan coba lagi', 'error');
    } finally {
      setSyncInProgress(false);
    }
  };

  

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Network Status Bar */}
        {!networkStatus.isOnline && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-card p-4 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {getOfflineMessage()}
              </p>
              {isCached && offlineData && (
                <p className="text-red-600 dark:text-red-400 text-xs">
                  📦 Data offline tersedia untuk {offlineData.children.length} anak
                </p>
              )}
            </div>
          </div>
        )}

        {networkStatus.isSlow && networkStatus.isOnline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-card p-4 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">{getSlowConnectionMessage()}</p>
          </div>
        )}

        {/* Sync Status Bar */}
        {networkStatus.isOnline && (syncStatus.needsSync || syncStatus.pendingActions > 0) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-card p-4 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div className="flex-1">
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                {syncStatus.pendingActions > 0 
                  ? `${syncStatus.pendingActions} aksi pending perlu disinkronkan` 
                  : 'Data perlu diperbarui'
                }
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs">
                Terakhir diperbarui: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString('id-ID') : 'Belum pernah'}
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncInProgress}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncInProgress ? 'Menyinkronkan...' : 'Sinkronkan'}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <>
            {/* Welcome Banner */}
            <Card className="p-6 sm:p-8 mb-8 animate-fade-in-up relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-64 h-64 ${GRADIENT_CLASSES.PRIMARY_DECORATIVE_SOFT} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50`}></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Portal Wali Murid</h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-lg">
                  Selamat datang, <strong>{loading ? 'Loading...' : 'Orang Tua'}</strong>!
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Pantau perkembangan pendidikan anak Anda dengan mudah.
                </p>
              </div>
            </Card>

            {/* Child Selection */}
            {children.length > 1 && (
              <Card className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Pilih Anak</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {children.map((child) => (
                    <button
                      key={child.studentId}
                      onClick={() => handleSelectChild(child)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedChild?.studentId === child.studentId
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserIcon />
                        </div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{child.studentName}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{child.className || 'Tanpa Kelas'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
        {currentView === 'schedule' && selectedChild && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ParentScheduleView onShowToast={onShowToast} child={selectedChild} />
          </div>
        )}

        {currentView === 'grades' && selectedChild && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ParentGradesView onShowToast={onShowToast} child={selectedChild} />
          </div>
        )}

        {currentView === 'attendance' && selectedChild && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ParentAttendanceView onShowToast={onShowToast} child={selectedChild} />
          </div>
        )}

        {currentView === 'library' && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ELibrary onBack={() => setCurrentView('home')} onShowToast={onShowToast} userId={authAPI.getCurrentUser()?.id || ''} />
          </div>
        )}

        {currentView === 'events' && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <OsisEvents onBack={() => setCurrentView('home')} onShowToast={onShowToast} />
          </div>
        )}

        {currentView === 'reports' && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ConsolidatedReportsView onShowToast={onShowToast} children={children} />
          </div>
        )}

        {currentView === 'messaging' && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ParentMessagingView onShowToast={onShowToast} children={children} />
          </div>
        )}

        {currentView === 'payments' && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ParentPaymentsView onShowToast={onShowToast} children={children} />
          </div>
        )}

        {currentView === 'meetings' && (
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} variant="green" />
            </div>
            <ParentMeetingsView onShowToast={onShowToast} children={children} />
          </div>
        )}

        {/* Voice Commands Help Modal */}
        <VoiceCommandsHelp
          isOpen={showVoiceHelp}
          onClose={() => setShowVoiceHelp(false)}
          userRole="parent"
          availableCommands={getAvailableCommands()}
        />

        {/* Parent Notification Settings Modal */}
        {showNotificationSettings && (
          <ParentNotificationSettings
            onShowToast={onShowToast}
            onClose={() => setShowNotificationSettings(false)}
          />
        )}

        {/* Notification History Modal */}
        {showNotificationHistory && selectedChild && (
          <NotificationHistory
            onShowToast={onShowToast}
            child={selectedChild}
            onClose={() => setShowNotificationHistory(false)}
          />
        )}

        {/* Offline Status Indicator */}
        {!networkStatus.isOnline && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-800 rounded-lg p-3 shadow-lg max-w-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">Offline Mode</span>
            </div>
            {offlineData && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                Data {offlineData.children.length} anak tersimpan hingga {new Date(offlineData.lastUpdated).toLocaleDateString('id-ID')}
              </div>
            )}
          </div>
        )}

        {/* Sync Complete Toast */}
        {syncStatus.lastSync > 0 && !syncStatus.needsSync && (
          <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 shadow-lg max-w-xs animate-fade-in-up">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">Data Terkini</span>
            </div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              Terakhir sinkron: {new Date(syncStatus.lastSync).toLocaleTimeString('id-ID')}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ParentDashboard;
