
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ChartLineIcon } from './icons/ChartLineIcon';
import { SparklesIcon } from './icons/SparklesIcon';

// Lazy load heavy dashboard components to reduce initial bundle size
const GradingManagement = lazy(() => import('./grading/GradingManagement'));
const ClassManagement = lazy(() => import('./ClassManagement'));
const MaterialUpload = lazy(() => import('./MaterialUpload'));
const SchoolInventory = lazy(() => import('./SchoolInventory'));
const AssignmentCreation = lazy(() => import('./AssignmentCreation'));
const AssignmentGrading = lazy(() => import('./AssignmentGrading'));
const GradeAnalytics = lazy(() => import('./GradeAnalytics'));
const QuizGenerator = lazy(() => import('./QuizGenerator').then(m => ({ default: m.QuizGenerator })));
const QuizIntegrationDashboard = lazy(() => import('./QuizIntegrationDashboard'));
const CommunicationDashboard = lazy(() => import('./CommunicationDashboard'));
const DirectMessage = lazy(() => import('./DirectMessage').then(m => ({ default: m.DirectMessage })));
const GroupChat = lazy(() => import('./GroupChat').then(m => ({ default: m.GroupChat })));

import { ToastType } from './Toast';
import { UserExtraRole, UserRole } from '../types/permissions';
import { permissionService } from '../services/permissionService';
import { usePushNotifications } from '../hooks/useUnifiedNotifications';
import { useOfflineDataService, useOfflineData, type CachedTeacherData } from '../services/offlineDataService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { USER_ROLES, USER_STATUS, TIME_MS, LOADING_MESSAGES } from '../constants';
import { classifyError } from '../utils/errorHandler';
import { STORAGE_KEYS } from '../constants';
import Card from './ui/Card';
import DashboardActionCard from './ui/DashboardActionCard';
import ErrorMessage from './ui/ErrorMessage';
import { CardSkeleton } from './ui/Skeleton';
import OfflineBanner from './ui/OfflineBanner';
import SuspenseLoading from './ui/SuspenseLoading';
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import type { VoiceCommand } from '../types';
import VoiceInputButton from './VoiceInputButton';
import VoiceCommandsHelp from './VoiceCommandsHelp';
import Badge from './ui/Badge';
import SmallActionButton from './ui/SmallActionButton';
import { pdfExportService } from '../services/pdfExportService';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import ActivityFeed, { type Activity } from './ActivityFeed';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import { RealTimeEventType } from '../services/webSocketService';
import { useStudentInsights } from '../hooks/useStudentInsights';

interface TeacherDashboardProps {
    onShowToast?: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type ViewState = 'home' | 'grading' | 'class' | 'upload' | 'inventory' | 'assignments' | 'assignment-grading' | 'analytics' | 'student-insights' | 'quiz-generator' | 'quiz-integration' | 'messages' | 'groups' | 'communication-log';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{ lastSync?: string } | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [isExportingConsolidated, setIsExportingConsolidated] = useState(false);
  const [_refreshingData, setRefreshingData] = useState<Record<string, boolean>>({});
  const [_offlineData, setOfflineData] = useState<CachedTeacherData | null>(null);
  const [navigatingView, setNavigatingView] = useState<string | null>(null);

  // Initialize push notifications
  const {
    showNotification,
    createNotification
  } = usePushNotifications();

  const { isOnline, isSlow } = useNetworkStatus();

  const {
    insights: classInsights,
    loading: insightsLoading,
    error: insightsError,
    refreshInsights: refreshClassInsights,
    enabled: insightsEnabled,
    setEnabled: setInsightsEnabled
  } = useStudentInsights({
    autoRefresh: true,
    refreshInterval: TIME_MS.ONE_DAY,
    enabled: true
  });

  const handleToast = useCallback((msg: string, type: ToastType) => {
      if (onShowToast) onShowToast(msg, type);
  }, [onShowToast]);

  const getCurrentUserId = (): string => {
    const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
    if (userJSON) {
      const user = JSON.parse(userJSON);
      return user.id || '';
    }
    return '';
  };

  const applyCachedData = useCallback((cachedData: CachedTeacherData, isFallback: boolean = false) => {
    setOfflineData(cachedData);
    setDashboardData({ lastSync: new Date(cachedData.lastUpdated).toISOString() });
    if (isFallback) {
      onShowToast?.('Data terakhir dari cache', 'warning');
    } else {
      onShowToast?.('Menggunakan data offline', 'info');
    }
  }, [onShowToast]);

  const getCurrentUserName = (): string => {
    const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
    if (userJSON) {
      const user = JSON.parse(userJSON);
      return user.name || '';
    }
    return '';
  };

  const getCurrentUserEmail = (): string => {
    const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
    if (userJSON) {
      const user = JSON.parse(userJSON);
      return user.email || '';
    }
    return '';
  };

  // Initialize offline services (Issue #1315)
  const offlineDataService = useOfflineDataService();
  useOfflineData('teacher', getCurrentUserId());

  // Load dashboard data with offline support (Issue #1315)
  useEffect(() => {
    const loadDashboardData = async () => {
      const teacherId = getCurrentUserId();

      // Try offline cache first
      if (!isOnline) {
        const cachedData = offlineDataService.getCachedTeacherData(teacherId);
        if (cachedData) {
          applyCachedData(cachedData);
        } else {
          setError(getOfflineMessage());
        }
        setLoading(false);
        return;
      }

      // Online mode - load fresh data and cache it
      setLoading(true);
      setError(null);

      try {
        // Load fresh data from API (implementation depends on your API)
        // const freshData = await teacherAPI.getDashboardData();
        // setDashboardData(freshData);

        // Cache teacher data for offline use
        // await offlineDataService.cacheTeacherData({
        //   teacherId,
        //   classes: freshData.classes,
        //   students: freshData.students,
        //   recentGrades: freshData.recentGrades,
        //   announcements: freshData.announcements,
        // });

        // For now, set minimal dashboard data
        const freshData = { lastSync: new Date().toISOString() };
        setDashboardData(freshData);

        // Cache minimal data for offline support
        await offlineDataService.cacheTeacherData({
          teacherId,
          classes: [],
          students: [],
          recentGrades: [],
          announcements: [],
        });
      } catch (err) {
        logger.error('Failed to load dashboard data:', err);
        const appError = classifyError(err, { operation: 'loadDashboardData', timestamp: Date.now() });
        setError(appError.message);

        // Try to load cached data as fallback
        const cachedData = offlineDataService.getCachedTeacherData(teacherId);
        if (cachedData) {
          applyCachedData(cachedData, true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isOnline, onShowToast, offlineDataService, applyCachedData]);

  // Show slow connection warning
  useEffect(() => {
    if (isSlow && isOnline) {
      handleToast(getSlowConnectionMessage(), 'info');
    }
  }, [isSlow, isOnline, handleToast]);

  // Check notification permission status without requesting on page load
  // Permission will only be requested after explicit user interaction
  useEffect(() => {
    const checkNotificationStatus = async () => {
      // Only check if permission is already granted, don't request on page load
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        logger.info('Teacher notifications already enabled');
        await showNotification(
          createNotification(
            'system',
            'Notifikasi Guru Aktif',
            'Sistem notifikasi guru telah diaktifkan'
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
    userRole: 'teacher',
    extraRole,
    onNavigate: (view: string) => {
      const validViews: ViewState[] = ['grading', 'class', 'upload', 'inventory', 'analytics', 'quiz-generator', 'quiz-integration', 'messages', 'groups', 'communication-log'];
      if (validViews.includes(view as ViewState)) {
        setCurrentView(view as ViewState);
        handleToast(`Navigasi ke ${view}`, 'success');
      }
    },
    onAction: (action: string) => {
      switch (action) {
        case 'view_attendance':
          handleToast('Fitur absensi akan segera tersedia', 'info');
          break;
        case 'create_announcement':
          handleToast('Fitur pengumuman akan segera tersedia', 'info');
          break;
        case 'view_schedule':
          handleToast('Jadwal akan ditampilkan', 'info');
          break;
        default:
          handleToast(`Menjalankan: ${action}`, 'info');
      }
    },
    onShowHelp: () => {
      setShowVoiceHelp(true);
    },
    onLogout: () => {
      handleToast('Keluar dari sistem...', 'info');
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
      handleToast('Perintah tidak dikenali atau tidak tersedia', 'error');
    }
  }, [handleVoiceCommand, handleToast]);

  const handleViewNavigation = useCallback((view: ViewState) => {
    setNavigatingView(view);
    // Simulate navigation delay to show loading state
    setTimeout(() => {
      setCurrentView(view);
      setNavigatingView(null);
    }, 300);
  }, []);

  const refreshDashboardData = useCallback(async () => {
    if (!isOnline) return;

    try {
      setRefreshingData(prev => ({ ...prev, dashboard: true }));
      const freshData = { lastSync: new Date().toISOString() };
      setDashboardData(freshData);
      localStorage.setItem(STORAGE_KEYS.TEACHER_DASHBOARD_CACHE, JSON.stringify(freshData));
      logger.info('Dashboard data refreshed from real-time event');
    } catch (error) {
      logger.error('Failed to refresh dashboard data:', error);
    } finally {
      setRefreshingData(prev => ({ ...prev, dashboard: false }));
    }
  }, [isOnline]);

  const teacherEventTypes = useMemo(() => [
    'grade_updated',
    'grade_created',
    'announcement_created',
    'announcement_updated',
    'event_created',
    'event_updated',
    'message_created',
    'message_updated',
  ] as RealTimeEventType[], []);

  const handleRealtimeEvent = useCallback((event: unknown) => {
    const typedEvent = event as { entity: string; type: string };
    if (typedEvent.entity === 'grade' || typedEvent.entity === 'announcement' || typedEvent.entity === 'event') {
      refreshDashboardData();
    } else if (typedEvent.entity === 'message' && typedEvent.type === 'message_created') {
      handleToast('Pesan baru diterima', 'success');
    }
  }, [refreshDashboardData, handleToast]);

  const { isConnected, isConnecting } = useRealtimeEvents({
    eventTypes: teacherEventTypes,
    enabled: isOnline,
    onEvent: handleRealtimeEvent,
  });

  // Check permissions for teacher role with extra role
  const checkPermission = (permission: string) => {
    const result = permissionService.hasPermission('teacher' as UserRole, extraRole, permission);
    return result.granted;
  };

  const handleConsolidatedPDFExport = async () => {
    try {
      setIsExportingConsolidated(true);
      
      // Get current user info from localStorage
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);
      const user = userJson ? JSON.parse(userJson) : null;
      
      if (!user) {
        handleToast('Data guru tidak ditemukan', 'error');
        return;
      }

      // Create sample consolidated data (in real implementation, this would fetch actual data)
      const studentInfo = {
        name: user.name || 'Guru',
        id: user.id || 'ID-001',
        className: 'XII IPA 1',
        totalStudents: '32',
        averageGrade: '85.5',
        attendanceRate: '92.3'
      };
      
      // Mock grades data (would fetch from API)
      const grades = Array.from({ length: 5 }, () => ({ 
        grade: Math.floor(Math.random() * 30) + 70 
      }));
      
      // Mock attendance data (would fetch from API)
      const attendance = Array.from({ length: 20 }, () => ({ 
        status: Math.random() > 0.1 ? 'Hadir' : 'Sakit' 
      }));
      
      pdfExportService.createConsolidatedReport(studentInfo, grades, attendance);
      
      handleToast('Laporan konsolidasi berhasil diexport ke PDF', 'success');
    } catch (error) {
      logger.error('Failed to export consolidated PDF:', error);
      handleToast('Gagal melakukan export PDF', 'error');
    } finally {
      setIsExportingConsolidated(false);
    }
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

        {/* Offline Banner */}
        <OfflineBanner
          mode={(!isOnline && isSlow) ? 'both' : !isOnline ? 'offline' : 'slow'}
          show={!isOnline || isSlow}
          cachedDataAvailable={!!localStorage.getItem(STORAGE_KEYS.TEACHER_DASHBOARD_CACHE)}
          cachedDataInfo="Data terakhir dari cache"
        />

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
                        {extraRole === 'staff' && (
                          <>
                            {' '}
                            <Badge variant="info" size="sm">
                              Mode Staff Aktif
                            </Badge>
                          </>
                        )}
                        {dashboardData?.lastSync && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-1">
                                Terakhir diperbarui: {new Date(dashboardData.lastSync).toLocaleString('id-ID')}
                            </span>
                        )}
                    </p>
                </Card>

                 {/* Voice Commands Section */}
                 {voiceSupported && (
                     <Card padding="lg" className={`mb-8 animate-fade-in-up`}>
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
                                      handleToast(`Transkripsi: ${transcript}`, 'info');
                                    }}
                                    onCommand={handleVoiceCommandCallback}
                                    onError={(errorMsg) => handleToast(errorMsg, 'error')}
                                    className="flex-shrink-0"
                                />
                            </div>
                        </div>
                        {isOnline && (
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} ${isConnecting ? 'animate-pulse' : ''}`}></div>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    {isConnected ? 'Real-time Aktif' : isConnecting ? 'Menghubungkan...' : 'Tidak Terhubung'}
                                </span>
                            </div>
                        )}
                    </Card>
                )}

                {/* Activity Feed */}
                <Card padding="lg" className={`mb-8 animate-fade-in-up`}>
                  <ActivityFeed
                    userId={getCurrentUserId()}
                    userRole="teacher"
                    eventTypes={[
                      'grade_updated',
                      'grade_created',
                      'announcement_created',
                      'announcement_updated',
                      'event_created',
                      'event_updated',
                      'message_created',
                      'message_updated',
                    ]}
                    showFilter
                    maxActivities={50}
                    onActivityClick={(activity: Activity) => {
                      if (activity.type === 'grade_updated' || activity.type === 'grade_created') {
                        setCurrentView('analytics');
                        handleToast('Navigasi ke analitik nilai', 'success');
                      } else if (activity.type === 'announcement_created' || activity.type === 'announcement_updated') {
                        handleToast('Pengumuman baru tersedia', 'success');
                      } else if (activity.type === 'event_created' || activity.type === 'event_updated') {
                        handleToast('Acara baru tersedia', 'success');
                      } else if (activity.type === 'message_created' || activity.type === 'message_updated') {
                        setCurrentView('messages');
                        handleToast('Navigasi ke pesan', 'success');
                      }
                    }}
                  />
                </Card>

                {insightsEnabled && (
                    <Card padding="lg" className={`mb-8 animate-fade-in-up`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Wawasan Kelas
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    Analitik AI untuk performa dan rekomendasi belajar
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <SmallActionButton
                                    onClick={() => setInsightsEnabled(false)}
                                    disabled={insightsLoading}
                                >
                                    Sembunyikan
                                </SmallActionButton>
                                <SmallActionButton
                                    onClick={refreshClassInsights}
                                    disabled={insightsLoading}
                                    tooltip="Muat ulang data"
                                    shortcut="Ctrl+R"
                                >
                                    {insightsLoading ? 'Memuat...' : 'Refresh'}
                                </SmallActionButton>
                            </div>
                        </div>

                        {insightsError && (
                            <ErrorMessage
                                message={insightsError}
                                variant="inline"
                                className="mb-4"
                            />
                        )}

                        {insightsLoading && (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
                            </div>
                        )}

                        {classInsights && !insightsLoading && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {classInsights.overallPerformance.gpa.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Rata-rata Nilai</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {classInsights.attendanceInsight.percentage.toFixed(0)}%
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">Kehadiran</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {classInsights.overallPerformance.totalSubjects}
                                        </div>
                                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Mata Pelajaran</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {classInsights.overallPerformance.improvementRate > 0 ? '+' : ''}{classInsights.overallPerformance.improvementRate.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Tingkat Perbaikan</div>
                                    </div>
                                </div>

                                {classInsights.studyRecommendations.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                                            Rekomendasi Pembelajaran
                                        </h3>
                                        <div className="space-y-2">
                                            {classInsights.studyRecommendations.slice(0, 3).map((rec, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                                        rec.priority === 'high' ? 'bg-red-500' :
                                                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            {rec.subject}
                                                        </div>
                                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                                            {rec.recommendation}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                                            {rec.timeAllocation}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {classInsights.aiAnalysis && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                                            Analisis AI
                                        </h3>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                                {classInsights.aiAnalysis}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        {classInsights.motivationalMessage}
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {checkPermission('academic.classes') && (
                        <DashboardActionCard
                            icon={<UsersIcon />}
                            title="Wali Kelas"
                            description="Kelola data siswa di kelas perwalian Anda."
                            colorTheme="orange"
                            statusBadge="Aktif"
                            offlineBadge="Offline"
                            isOnline={isOnline}
                            disabled={navigatingView === 'class'}
                            onClick={() => handleViewNavigation('class')}
                            ariaLabel="Buka manajemen Wali Kelas"
                        />
                    )}

                    {checkPermission('academic.grades') && (
                        <DashboardActionCard
                            icon={<ClipboardDocumentCheckIcon />}
                            title="Input Nilai"
                            description="Masukkan nilai tugas, UTS, dan UAS."
                            colorTheme="primary"
                            statusBadge="Aktif"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            disabled={navigatingView === 'grading'}
                            onClick={() => handleViewNavigation('grading')}
                            ariaLabel="Buka Input Nilai"
                        />
                    )}

                    {checkPermission('content.create') && (
                        <DashboardActionCard
                            icon={<DocumentTextIcon />}
                            title="Upload Materi"
                            description="Bagikan modul dan bahan ajar digital."
                            colorTheme="blue"
                            statusBadge="Aktif"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            disabled={navigatingView === 'upload'}
                            onClick={() => handleViewNavigation('upload')}
                            ariaLabel="Buka Upload Materi"
                        />
                    )}

                    {checkPermission('academic.assignments.create') && (
                        <DashboardActionCard
                            icon={<ClipboardDocumentCheckIcon />}
                            title="Buat Tugas"
                            description="Buat tugas dengan rubrik dan lampiran."
                            colorTheme="green"
                            statusBadge="Baru"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            disabled={navigatingView === 'assignments'}
                            onClick={() => handleViewNavigation('assignments')}
                            ariaLabel="Buka Pembuatan Tugas"
                        />
                    )}

                    {checkPermission('academic.grades') && checkPermission('academic.assignments.create') && (
                        <DashboardActionCard
                            icon={<ClipboardDocumentCheckIcon />}
                            title="Penilaian Tugas"
                            description="Beri nilai dan feedback untuk tugas yang telah dikumpulkan."
                            colorTheme="purple"
                            statusBadge="Baru"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            disabled={navigatingView === 'assignment-grading'}
                            onClick={() => handleViewNavigation('assignment-grading')}
                            ariaLabel="Buka Penilaian Tugas"
                        />
                    )}

                    {checkPermission('academic.grades') && (
                        <DashboardActionCard
                            icon={<ChartLineIcon />}
                            title="Analitik Nilai"
                            description="Analisis performa kelas, distribusi nilai, dan tren performa siswa."
                            colorTheme="blue"
                            statusBadge="Baru"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            disabled={navigatingView === 'analytics'}
                            onClick={() => handleViewNavigation('analytics')}
                            ariaLabel="Buka Analitik Nilai"
                        />
                    )}

                    {checkPermission('academic.grades') && (
                        <DashboardActionCard
                            icon={<SparklesIcon />}
                            title="Wawasan Siswa"
                            description="Analitik AI mendalam untuk performa individual siswa dengan rekomendasi personal."
                            colorTheme="purple"
                            statusBadge="AI"
                            offlineBadge="Mode Terbatas"
                            isOnline={isOnline}
                            disabled={navigatingView === 'student-insights'}
                            onClick={() => setCurrentView('student-insights')}
                            ariaLabel="Buka Wawasan Siswa AI"
                        />
                    )}

                    {checkPermission('academic.assignments.create') && (
                        <DashboardActionCard
                            icon={<SparklesIcon />}
                            title="Buat Kuis AI"
                            description="Buat kuis otomatis dari materi pembelajaran dengan bantuan AI."
                            colorTheme="purple"
                            statusBadge="AI"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            disabled={navigatingView === 'quiz-generator'}
                            onClick={() => handleViewNavigation('quiz-generator')}
                            ariaLabel="Buka Pembuat Kuis AI"
                        />
                    )}

                    {checkPermission('academic.grades') && (
                        <DashboardActionCard
                            icon={<ClipboardDocumentCheckIcon />}
                            title="Integrasi Kuis"
                            description="Integrasikan hasil kuis ke dalam sistem penilaian."
                            colorTheme="indigo"
                            statusBadge="Integrasi"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            disabled={navigatingView === 'quiz-integration'}
                            onClick={() => handleViewNavigation('quiz-integration')}
                            ariaLabel="Buka Dashboard Integrasi Kuis"
                        />
                    )}

                    {checkPermission('communication.messages') && (
                        <DashboardActionCard
                            icon={<ChatBubbleLeftRightIcon />}
                            title="Pesan"
                            description="Kirim dan terima pesan langsung dengan pengguna lain."
                            colorTheme="green"
                            statusBadge="Real-time"
                            offlineBadge="Offline"
                            isOnline={isOnline}
                            disabled={navigatingView === 'messages'}
                            onClick={() => handleViewNavigation('messages')}
                            ariaLabel="Buka Pesan"
                        />
                    )}

                    {checkPermission('communication.messages') && (
                        <DashboardActionCard
                            icon={<UsersIcon />}
                            title="Grup Diskusi"
                            description="Buat dan kelola grup diskusi kelas atau mata pelajaran."
                            colorTheme="blue"
                            statusBadge="Grup"
                            offlineBadge="Offline"
                            isOnline={isOnline}
                            disabled={navigatingView === 'groups'}
                            onClick={() => handleViewNavigation('groups')}
                            ariaLabel="Buka Grup Diskusi"
                        />
                    )}

                    {checkPermission('communication.messages') && (
                        <DashboardActionCard
                            icon={<DocumentTextIcon />}
                            title="Log Komunikasi"
                            description="Lihat riwayat dan analitik komunikasi orang tua-guru."
                            colorTheme="green"
                            statusBadge="Audit"
                            offlineBadge="Offline"
                            isOnline={isOnline}
                            disabled={navigatingView === 'communication-log'}
                            onClick={() => handleViewNavigation('communication-log')}
                            ariaLabel="Buka Log Komunikasi"
                        />
                    )}

                    {extraRole === 'staff' && checkPermission('inventory.manage') && (
                        <DashboardActionCard
                            icon={<ArchiveBoxIcon />}
                            title="Inventaris"
                            description="Manajemen aset dan sarana prasarana sekolah."
                            colorTheme="blue"
                            variant="gradient"
                            gradient={{ from: 'from-blue-50', to: 'to-indigo-50' }}
                            statusBadge="Tugas Tambahan"
                            offlineBadge="Mode Tertunda"
                            isOnline={isOnline}
                            onClick={() => setCurrentView('inventory')}
                            ariaLabel="Buka Inventaris"
                        />
                    )}

                    <DashboardActionCard
                        icon={<DocumentTextIcon />}
                        title="Laporan Konsolidasi"
                        description="Export gabungan nilai, kehadiran, dan jadwal."
                        colorTheme="green"
                        statusBadge={isExportingConsolidated ? "Processing..." : "Ready"}
                        disabled={isExportingConsolidated}
                        onClick={handleConsolidatedPDFExport}
                        ariaLabel="Export laporan konsolidasi ke PDF"
                    />
                </div>
            </>
        )}

        {currentView === 'grading' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.GRADE_MANAGEMENT} />}>
            <GradingManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>
          </Suspense>
        )}
        {currentView === 'class' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.CLASS_MANAGEMENT} />}>
            <ClassManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>
          </Suspense>
        )}
        {currentView === 'upload' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.MATERIAL_UPLOAD} />}>
            <MaterialUpload onBack={() => setCurrentView('home')} onShowToast={handleToast}/>
          </Suspense>
        )}
        {currentView === 'inventory' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.INVENTORY} />}>
            <SchoolInventory onBack={() => setCurrentView('home')} onShowToast={handleToast}/>
          </Suspense>
        )}
        {currentView === 'assignments' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.ASSIGNMENT_CREATION} />}>
            <AssignmentCreation onBack={() => setCurrentView('home')} onShowToast={handleToast}/>
          </Suspense>
        )}
        {currentView === 'assignment-grading' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.ASSIGNMENT_GRADING} />}>
            <AssignmentGrading onBack={() => setCurrentView('home')} onShowToast={handleToast}/>
          </Suspense>
        )}
        {currentView === 'analytics' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.GRADE_ANALYSIS} />}>
            <GradeAnalytics onBack={() => setCurrentView('home')} onShowToast={handleToast}/>
          </Suspense>
        )}

        {currentView === 'student-insights' && (
          <div className="animate-fade-in-up">
            <div className="mb-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wawasan Siswa AI</h2>
            </div>

            <div className="space-y-6">
              {insightsError && (
                <ErrorMessage
                  message={insightsError}
                  variant="card"
                />
              )}

              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Analitik Performa Siswa
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Analisis mendalam dengan AI untuk memberikan wawasan personal
                    </p>
                  </div>
                  <SmallActionButton
                    onClick={refreshClassInsights}
                    disabled={insightsLoading}
                    tooltip="Muat ulang data"
                    shortcut="Ctrl+R"
                  >
                    {insightsLoading ? 'Memuat...' : 'Refresh Data'}
                  </SmallActionButton>
                </div>

                {insightsLoading && (
                  <div className="space-y-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {classInsights && !insightsLoading && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Rata-rata Nilai</span>
                          <ChartLineIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                          {classInsights.overallPerformance.gpa.toFixed(1)}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {classInsights.overallPerformance.classRank}
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Kehadiran</span>
                          <UsersIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                          {classInsights.attendanceInsight.percentage.toFixed(0)}%
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {classInsights.attendanceInsight.present}/{classInsights.attendanceInsight.totalDays} hari
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Mata Pelajaran</span>
                          <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                          {classInsights.overallPerformance.totalSubjects}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          {classInsights.gradePerformance.filter(gp => gp.trend === 'improving').length} meningkat
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Tingkat Perbaikan</span>
                          <SparklesIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                          {classInsights.overallPerformance.improvementRate > 0 ? '+' : ''}{classInsights.overallPerformance.improvementRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          vs periode sebelumnya
                        </div>
                      </div>
                    </div>

                    {classInsights.gradePerformance.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                          Performa per Mata Pelajaran
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {classInsights.gradePerformance.map((subject, index) => (
                            <div key={index} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-neutral-900 dark:text-white">{subject.subject}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  subject.trend === 'improving' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  subject.trend === 'declining' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                }`}>
                                  {subject.trend === 'improving' ? '↑ Meningkat' :
                                   subject.trend === 'declining' ? '↓ Menurun' : '→ Stabil'}
                                </span>
                              </div>
                              <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                                {subject.averageScore.toFixed(1)}
                              </div>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                Nilai: {subject.grade}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {classInsights.studyRecommendations.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                          Rekomendasi Pembelajaran Personal
                        </h4>
                        <div className="space-y-3">
                          {classInsights.studyRecommendations.map((rec, index) => (
                            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-3">
                                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                                  rec.priority === 'high' ? 'bg-red-500' :
                                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-neutral-900 dark:text-white">{rec.subject}</span>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      rec.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                      {rec.priority === 'high' ? 'Prioritas Tinggi' :
                                       rec.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">{rec.recommendation}</p>
                                  <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                                    <span>⏱️ {rec.timeAllocation}</span>
                                    <span>📚 {rec.resources.length} sumber daya</span>
                                  </div>
                                  {rec.resources.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {rec.resources.map((resource, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-white dark:bg-neutral-700 rounded text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600">
                                          {resource}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {classInsights.performanceTrends.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                          Tren Performa 6 Bulan Terakhir
                        </h4>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Rata-rata Nilai</h5>
                              <div className="space-y-2">
                                {classInsights.performanceTrends.map((trend, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{trend.month}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full"
                                          style={{ width: `${(trend.averageScore / 100) * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-neutral-900 dark:text-white w-12 text-right">
                                        {trend.averageScore.toFixed(0)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Tingkat Kehadiran</h5>
                              <div className="space-y-2">
                                {classInsights.performanceTrends.map((trend, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{trend.month}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full"
                                          style={{ width: `${trend.attendanceRate}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-neutral-900 dark:text-white w-12 text-right">
                                        {trend.attendanceRate.toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {classInsights.aiAnalysis && (
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                          Analisis AI Mendalam
                        </h4>
                        <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-start gap-3">
                            <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                            <div>
                              <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                                {classInsights.aiAnalysis}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <SparklesIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                      <p className="text-lg font-medium text-green-800 dark:text-green-200">
                        {classInsights.motivationalMessage}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
        {currentView === 'quiz-generator' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.QUIZ_GENERATOR} />}>
            <QuizGenerator onSuccess={() => { handleToast('Kuis berhasil dibuat!', 'success'); setCurrentView('home'); }} onCancel={() => setCurrentView('home')} />
          </Suspense>
        )}
        {currentView === 'quiz-integration' && (
          <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.QUIZ_INTEGRATION} />}>
            <QuizIntegrationDashboard onBack={() => setCurrentView('home')} onShowToast={handleToast} />
          </Suspense>
        )}
        {currentView === 'messages' && (
          <div className="animate-fade-in-up">
            <div className="mb-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pesan</h2>
            </div>
            <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.MESSAGES} />}>
              <DirectMessage
                currentUser={{
                  id: getCurrentUserId(),
                  name: getCurrentUserName(),
                  email: getCurrentUserEmail(),
                  role: USER_ROLES.TEACHER,
                  status: USER_STATUS.ACTIVE,
                }}
              />
            </Suspense>
          </div>
        )}

        {currentView === 'groups' && (
          <div className="animate-fade-in-up">
            <div className="mb-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Grup Diskusi</h2>
            </div>
            <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.GROUPS} />}>
              <GroupChat
                currentUser={{
                  id: getCurrentUserId(),
                  name: getCurrentUserName(),
                  email: getCurrentUserEmail(),
                  role: USER_ROLES.TEACHER,
                  status: USER_STATUS.ACTIVE,
                }}
              />
            </Suspense>
          </div>
        )}

        {currentView === 'communication-log' && (
          <div className="animate-fade-in-up">
            <div className="mb-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Log Komunikasi</h2>
            </div>
            <Suspense fallback={<SuspenseLoading message={LOADING_MESSAGES.COMMUNICATION_LOG} />}>
              <CommunicationDashboard
                _currentUser={{
                  id: getCurrentUserId(),
                  name: getCurrentUserName(),
                  role: 'teacher',
                }}
              />
            </Suspense>
          </div>
        )}

        {/* Voice Commands Help Modal */}
        <VoiceCommandsHelp
          isOpen={showVoiceHelp}
          onClose={() => setShowVoiceHelp(false)}
          userRole="teacher"
          availableCommands={getAvailableCommands()}
        />

      </div>
    </main>
  );
};

export default TeacherDashboard;
