import React, { useState, useEffect, useCallback } from 'react';
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
import { parentsAPI, authAPI, gradesAPI, attendanceAPI, schedulesAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage } from '../utils/networkStatus';
import { validateParentChildDataAccess, validateChildDataIsolation, validateGradeVisibilityRestriction, validateOfflineDataIntegrity } from '../utils/parentValidation';
import { usePushNotifications } from '../hooks/useUnifiedNotifications';
import { useEventNotifications } from '../hooks/useEventNotifications';
import { parentGradeNotificationService } from '../services/parentGradeNotificationService';
import BackButton from './ui/BackButton';
import Card from './ui/Card';
import OfflineBanner from './ui/OfflineBanner';
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import { useOfflineDataService, useOfflineData, type CachedParentData, type CachedStudentData } from '../services/offlineDataService';
import { STORAGE_KEYS, TIME_MS } from '../constants';

import VoiceCommandsHelp from './VoiceCommandsHelp';
import ParentNotificationSettings from './ParentNotificationSettings';
import NotificationHistory from './NotificationHistory';
import SuspenseLoading from './ui/SuspenseLoading';
import ActivityFeed, { type Activity } from './ActivityFeed';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import { RealTimeEventType } from '../services/webSocketService';

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
  const [_refreshingData, setRefreshingData] = useState<Record<string, boolean>>({});
  
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
          const integrityValidation = validateOfflineDataIntegrity(cachedData, cachedData.children || []);
          if (!integrityValidation.isValid) {
            logger.warn('Offline data integrity issues:', integrityValidation.errors);
            onShowToast('Peringatan integritas data: ' + integrityValidation.errors.join(', '), 'error');
          } else if (integrityValidation.warnings.length > 0) {
            logger.info('Offline data warnings:', integrityValidation.warnings);
          }

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
            setChildren(response.data);
          if (response.data.length > 0) {
            setSelectedChild(response.data[0]);
          }

          // Cache children data for offline access
          try {
            const childrenData: Record<string, CachedStudentData> = {};
            const now = Date.now();
            const CACHE_DURATION = TIME_MS.ONE_DAY; // 24 hours

            // Fetch schedules once for all children
            const schedulesResponse = await schedulesAPI.getAll();
            const allSchedules = schedulesResponse.success && schedulesResponse.data ? schedulesResponse.data : [];

            // Fetch data for each child
            await Promise.all(response.data.map(async (child: ParentChild) => {
              try {
                const [gradesResponse, attendanceResponse] = await Promise.all([
                  gradesAPI.getByStudent(child.studentId),
                  attendanceAPI.getByStudent(child.studentId)
                ]);

                if (gradesResponse.success && attendanceResponse.success) {
                  // Validate data isolation for each child
                  const gradesIsolation = validateChildDataIsolation(child.studentId, gradesResponse.data || [], 'grades');
                  const attendanceIsolation = validateChildDataIsolation(child.studentId, attendanceResponse.data || [], 'attendance');
                  
                  if (!gradesIsolation.isValid) {
                    logger.error('Grades data isolation breach:', gradesIsolation.errors);
                  }
                  if (!attendanceIsolation.isValid) {
                    logger.error('Attendance data isolation breach:', attendanceIsolation.errors);
                  }

                  // Validate grade visibility restrictions
                  const gradesVisibility = validateGradeVisibilityRestriction(gradesResponse.data || [], child.studentId, 'parent');
                  if (!gradesVisibility.isValid) {
                    logger.warn('Grade visibility restrictions:', gradesVisibility.errors);
                  }

                  // Filter schedules for child's class
                  const classSchedule = allSchedules.filter(s => s.classId === (child.className || ''));

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
                    schedule: classSchedule,
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
  useMonitorLocalStorage(STORAGE_KEYS.GRADES, (newValue: unknown, oldValue: unknown) => {
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
      }, TIME_MS.SIX_HOURS);

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
    // Validate parent access to this child before selection
    const accessValidation = validateParentChildDataAccess(child.studentId, children);
    if (!accessValidation.isValid) {
      onShowToast('Akses ditolak: ' + accessValidation.errors.join(', '), 'error');
      return;
    }

    if (accessValidation.warnings.length > 0) {
      logger.warn('Child selection warnings:', accessValidation.warnings);
    }

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

  const refreshChildData = useCallback(async (childId: string) => {
    if (!networkStatus.isOnline) return;

    try {
      setRefreshingData(prev => ({ ...prev, [`child-${childId}`]: true }));

      const [gradesResponse, attendanceResponse] = await Promise.all([
        gradesAPI.getByStudent(childId),
        attendanceAPI.getByStudent(childId)
      ]);

      if (gradesResponse.success && attendanceResponse.success && offlineData) {
        const updatedChildrenData = { ...offlineData.childrenData };
        if (offlineData.childrenData[childId]) {
          updatedChildrenData[childId] = {
            ...offlineData.childrenData[childId],
            grades: gradesResponse.data || [],
            attendance: attendanceResponse.data || [],
          };
        }

        offlineDataService.cacheParentData({
          children: offlineData.children,
          childrenData: updatedChildrenData,
        });

        onShowToast('Data anak diperbarui', 'success');
        logger.info(`Child ${childId} data refreshed from real-time event`);
      }
    } catch (error) {
      logger.error('Failed to refresh child data:', error);
    } finally {
      setRefreshingData(prev => ({ ...prev, [`child-${childId}`]: false }));
    }
  }, [networkStatus.isOnline, offlineData, offlineDataService, onShowToast]);

  const { isConnected: _isConnected, isConnecting: _isConnecting } = useRealtimeEvents({
    eventTypes: [
      'grade_updated',
      'grade_created',
      'attendance_marked',
      'attendance_updated',
      'announcement_created',
      'announcement_updated',
      'event_created',
      'event_updated',
    ] as RealTimeEventType[],
    enabled: networkStatus.isOnline,
    onEvent: useCallback((event: unknown) => {
      const typedEvent = event as { entity: string; data: { studentId: string } };
      if (typedEvent.entity === 'grade' || typedEvent.entity === 'attendance') {
        if (selectedChild && typedEvent.data.studentId === selectedChild.studentId) {
          refreshChildData(selectedChild.studentId);
        }
      }
    }, [selectedChild, refreshChildData]),
  });

  

  if (loading) {
    return (
      <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SuspenseLoading message="Memuat data portal wali murid..." size="lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Offline Banner */}
        <OfflineBanner
          mode={(!networkStatus.isOnline && networkStatus.isSlow) ? 'both' : !networkStatus.isOnline ? 'offline' : 'slow'}
          show={!networkStatus.isOnline || networkStatus.isSlow}
          syncStatus={syncStatus.needsSync || syncStatus.pendingActions > 0 ? syncStatus : undefined}
          onSync={handleSync}
          isSyncLoading={syncInProgress}
          cachedDataAvailable={isCached}
          cachedDataInfo={isCached && offlineData ? `Data offline tersedia untuk ${offlineData.children.length} anak` : undefined}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <>
            {/* Welcome Banner */}
            <Card className="p-6 sm:p-8 mb-8 animate-fade-in-up relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-64 sm:w-48 h-64 sm:h-48 ${GRADIENT_CLASSES.PRIMARY_DECORATIVE_SOFT} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50`}></div>
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Portal Wali Murid</h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-lg">
                  Selamat datang, <strong>Orang Tua</strong>!
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

            {/* Current Child Indicator */}
            {selectedChild && (
              <Card className="mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <UserIcon />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Data Saat Ini</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Menampilkan data untuk <strong>{selectedChild.studentName}</strong> - {selectedChild.className || 'Tanpa Kelas'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Activity Feed */}
            <Card className="mb-8 animate-fade-in-up">
              <ActivityFeed
                userId={authAPI.getCurrentUser()?.id || ''}
                userRole="parent"
                eventTypes={[
                  'grade_updated',
                  'grade_created',
                  'attendance_marked',
                  'attendance_updated',
                  'announcement_created',
                  'announcement_updated',
                  'event_created',
                  'event_updated',
                ]}
                showFilter
                maxActivities={50}
                onActivityClick={(activity: Activity) => {
                  if (activity.type === 'grade_updated' || activity.type === 'grade_created') {
                    setCurrentView('grades');
                    onShowToast('Navigasi ke nilai anak', 'success');
                  } else if (activity.type === 'attendance_marked' || activity.type === 'attendance_updated') {
                    setCurrentView('attendance');
                    onShowToast('Navigasi ke absensi anak', 'success');
                  } else if (activity.type === 'announcement_created' || activity.type === 'announcement_updated') {
                    setCurrentView('events');
                    onShowToast('Navigasi ke pengumuman', 'success');
                  } else if (activity.type === 'event_created' || activity.type === 'event_updated') {
                    setCurrentView('events');
                    onShowToast('Navigasi ke acara', 'success');
                  }
                }}
              />
            </Card>
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