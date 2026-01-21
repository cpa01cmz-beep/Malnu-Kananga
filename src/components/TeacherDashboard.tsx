
import React, { useState, useEffect, useCallback } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ChartLineIcon } from './icons/ChartLineIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import GradingManagement from './GradingManagement';
import ClassManagement from './ClassManagement';
import MaterialUpload from './MaterialUpload';
import SchoolInventory from './SchoolInventory';
import AssignmentCreation from './AssignmentCreation';
import AssignmentGrading from './AssignmentGrading';
import GradeAnalytics from './GradeAnalytics';
import { QuizGenerator } from './QuizGenerator';
import { DirectMessage } from './DirectMessage';
import { GroupChat } from './GroupChat';
import { ToastType } from './Toast';
import { UserExtraRole, UserRole } from '../types/permissions';
import { permissionService } from '../services/permissionService';
import { usePushNotifications } from '../hooks/useUnifiedNotifications';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { STORAGE_KEYS } from '../constants';
import Card from './ui/Card';
import DashboardActionCard from './ui/DashboardActionCard';
import ErrorMessage from './ui/ErrorMessage';
import { CardSkeleton } from './ui/Skeleton';
import OfflineBanner from './ui/OfflineBanner';
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

interface TeacherDashboardProps {
    onShowToast?: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type ViewState = 'home' | 'grading' | 'class' | 'upload' | 'inventory' | 'assignments' | 'assignment-grading' | 'analytics' | 'quiz-generator' | 'messages' | 'groups';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{ lastSync?: string } | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [isExportingConsolidated, setIsExportingConsolidated] = useState(false);
  const [_refreshingData, setRefreshingData] = useState<Record<string, boolean>>({});

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

  const getCurrentUserId = (): string => {
    const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
    if (userJSON) {
      const user = JSON.parse(userJSON);
      return user.id || '';
    }
    return '';
  };

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

  // Initialize voice commands
  const {
    isSupported: voiceSupported,
    handleVoiceCommand,
    getAvailableCommands,
  } = useDashboardVoiceCommands({
    userRole: 'teacher',
    extraRole,
    onNavigate: (view: string) => {
      const validViews: ViewState[] = ['grading', 'class', 'upload', 'inventory', 'analytics', 'quiz-generator', 'messages', 'groups'];
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

  const { isConnected, isConnecting } = useRealtimeEvents({
    eventTypes: [
      'grade_updated',
      'grade_created',
      'announcement_created',
      'announcement_updated',
      'event_created',
      'event_updated',
      'message_created',
      'message_updated',
    ] as RealTimeEventType[],
    enabled: isOnline,
    onEvent: useCallback((event: unknown) => {
      const typedEvent = event as { entity: string; type: string };
      if (typedEvent.entity === 'grade' || typedEvent.entity === 'announcement' || typedEvent.entity === 'event') {
        refreshDashboardData();
      } else if (typedEvent.entity === 'message' && typedEvent.type === 'message_created') {
        handleToast('Pesan baru diterima', 'success');
      }
    }, [refreshDashboardData, handleToast]),
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
                            onClick={() => setCurrentView('class')}
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
                            onClick={() => setCurrentView('grading')}
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
                            onClick={() => setCurrentView('upload')}
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
                            onClick={() => setCurrentView('assignments')}
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
                            onClick={() => setCurrentView('assignment-grading')}
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
                            onClick={() => setCurrentView('analytics')}
                            ariaLabel="Buka Analitik Nilai"
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
                            onClick={() => setCurrentView('quiz-generator')}
                            ariaLabel="Buka Pembuat Kuis AI"
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
                            onClick={() => setCurrentView('messages')}
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
                            onClick={() => setCurrentView('groups')}
                            ariaLabel="Buka Grup Diskusi"
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

        {currentView === 'grading' && <GradingManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'class' && <ClassManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'upload' && <MaterialUpload onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'inventory' && <SchoolInventory onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'assignments' && <AssignmentCreation onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'assignment-grading' && <AssignmentGrading onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'analytics' && <GradeAnalytics onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'quiz-generator' && <QuizGenerator onSuccess={() => { handleToast('Kuis berhasil dibuat!', 'success'); setCurrentView('home'); }} onCancel={() => setCurrentView('home')} />}
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
            <DirectMessage
              currentUser={{
                id: getCurrentUserId(),
                name: getCurrentUserName(),
                email: getCurrentUserEmail(),
                role: 'teacher',
                status: 'active',
              }}
            />
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
            <GroupChat
              currentUser={{
                id: getCurrentUserId(),
                name: getCurrentUserName(),
                email: getCurrentUserEmail(),
                role: 'teacher',
                status: 'active',
              }}
            />
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
