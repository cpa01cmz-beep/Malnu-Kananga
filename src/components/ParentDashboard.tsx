import React, { useState, useEffect, useCallback } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { UsersIcon } from './icons/UsersIcon';
import { UserIcon } from './icons/UserIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import { SendIcon } from './icons/SendIcon';
import { BellIcon } from './icons/BellIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import ParentScheduleView from './ParentScheduleView';
import ParentGradesView from './ParentGradesView';
import ParentAttendanceView from './ParentAttendanceView';
import ELibrary from './ELibrary';
import OsisEvents from './OsisEvents';
import { GRADIENT_CLASSES } from './config/gradients';
import ConsolidatedReportsView from './ConsolidatedReportsView';
import ParentMessagingView from './ParentMessagingView';
import ParentPaymentsView from './ParentPaymentsView';
import ParentMeetingsView from './ParentMeetingsView';
import { ToastType } from './Toast';
import { GRADIENT_CLASSES } from '../config/gradients';
import type { ParentChild, Grade } from '../types';
import { UserRole, UserExtraRole } from '../types/permissions';
import { parentsAPI, authAPI } from '../services/apiService';
import { permissionService } from '../services/permissionService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { validateMultiChildDataIsolation } from '../utils/parentValidation';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useEventNotifications } from '../hooks/useEventNotifications';
import { parentGradeNotificationService } from '../services/parentGradeNotificationService';
import BackButton from './ui/BackButton';
import DashboardActionCard from './ui/DashboardActionCard';
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import type { VoiceCommand } from '../types';
import VoiceInputButton from './VoiceInputButton';
import VoiceCommandsHelp from './VoiceCommandsHelp';
import SmallActionButton from './ui/SmallActionButton';
import ParentNotificationSettings from './ParentNotificationSettings';
import NotificationHistory from './NotificationHistory';

interface ParentDashboardProps {
  onShowToast: (msg: string, type: ToastType) => void;
}

type PortalView = 'home' | 'profile' | 'schedule' | 'library' | 'grades' | 'attendance' | 'events' | 'messaging' | 'payments' | 'meetings' | 'reports';

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onShowToast }) => {
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  const [showConsolidatedView, setShowConsolidatedView] = useState(false);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const networkStatus = useNetworkStatus();

  // Initialize push notifications
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

  // Initialize event notifications for automated grade monitoring
  const { useMonitorLocalStorage } = useEventNotifications();

  // Check permissions for parent role
  const checkPermission = (permission: string) => {
    const result = permissionService.hasPermission('parent' as UserRole, null as UserExtraRole, permission);
    return result.granted;
  };

  useEffect(() => {
    const fetchChildren = async () => {
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
        }
      } catch (error) {
        logger.error('Failed to fetch children:', error);
        if (!networkStatus.isOnline) {
          onShowToast(getOfflineMessage(), 'error');
        } else {
          onShowToast('Gagal memuat data anak', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [onShowToast, networkStatus.isOnline]);

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
    isSupported: voiceSupported,
    handleVoiceCommand,
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

  const handleVoiceCommandCallback = useCallback((command: VoiceCommand) => {
    const success = handleVoiceCommand(command);
    if (success) {
      logger.info('Voice command executed:', command.action);
    } else {
      onShowToast('Perintah tidak dikenali atau tidak tersedia', 'error');
    }
  }, [handleVoiceCommand, onShowToast]);

  const handleSelectChild = (child: ParentChild) => {
    setSelectedChild(child);
    setShowConsolidatedView(false);
    setCurrentView('home');
  };

  const handleToggleConsolidatedView = () => {
    setShowConsolidatedView(!showConsolidatedView);
    setCurrentView('home');
  };

  const allMenuItems = [
    ...(children.length > 1 ? [{
      title: showConsolidatedView ? 'Tinjau Per Anak' : 'Tinjau Konsolidasi',
      description: showConsolidatedView ? 'Lihat per anak' : 'Lihat semua anak dalam satu tampilan',
      icon: <UsersIcon />,
      colorTheme: 'teal' as const,
      action: () => handleToggleConsolidatedView(),
      active: true
    }] : []),
    {
      title: 'Pengaturan Notifikasi',
      description: 'Konfigurasi notifikasi nilai dan update.',
      icon: <BellIcon />,
      colorTheme: 'indigo' as const,
      action: () => setShowNotificationSettings(true),
      permission: 'parent.monitor'
    },
    {
      title: 'Riwayat Notifikasi',
      description: 'Lihat semua notifikasi yang telah diterima.',
      icon: <CalendarDaysIcon />,
      colorTheme: 'purple' as const,
      action: () => setShowNotificationHistory(true),
      permission: 'parent.monitor'
    },
    {
      title: 'Profil Anak',
      description: 'Lihat biodata dan informasi kelas anak.',
      icon: <UserIcon />,
      colorTheme: 'indigo' as const,
      action: () => setCurrentView('profile'),
      permission: 'parent.monitor'
    },
    {
      title: 'Jadwal Pelajaran',
      description: 'Lihat jadwal kelas mingguan anak.',
      icon: <DocumentTextIcon />,
      colorTheme: 'blue' as const,
      action: () => setCurrentView('schedule'),
      permission: 'academic.schedule'
    },
    {
      title: 'E-Library',
      description: 'Akses buku digital dan materi pelajaran.',
      icon: <BuildingLibraryIcon />,
      colorTheme: 'purple' as const,
      action: () => setCurrentView('library'),
      permission: 'content.read'
    },
    {
      title: 'Nilai Akademik',
      description: 'Pantau hasil belajar dan transkrip nilai.',
      icon: <ClipboardDocumentCheckIcon />,
      colorTheme: 'green' as const,
      action: () => setCurrentView('grades'),
      permission: 'parent.monitor'
    },
    {
      title: 'Kehadiran',
      description: 'Cek rekapitulasi absensi semester ini.',
      icon: <UsersIcon />,
      colorTheme: 'orange' as const,
      action: () => setCurrentView('attendance'),
      permission: 'parent.monitor'
    },
    {
      title: 'Kegiatan Sekolah',
      description: 'Lihat agenda dan kegiatan OSIS.',
      icon: <AcademicCapIcon />,
      colorTheme: 'pink' as const,
      action: () => setCurrentView('events'),
      permission: 'content.read'
    },
    {
      title: 'Laporan Konsolidasi',
      description: 'Pantau semua anak dalam laporan menyeluruh.',
      icon: <DocumentTextIcon />,
      colorTheme: 'emerald' as const,
      action: () => setCurrentView('reports'),
      permission: 'parent.reports'
    },
    {
      title: 'Pesan Guru',
      description: 'Komunikasi dengan guru anak.',
      icon: <SendIcon />,
      colorTheme: 'cyan' as const,
      action: () => setCurrentView('messaging'),
      permission: 'parent.communication'
    },
    {
      title: 'Pembayaran',
      description: 'Pantau status pembayaran SPP dan biaya.',
      icon: <UsersIcon />,
      colorTheme: 'yellow' as const,
      action: () => setCurrentView('payments'),
      permission: 'parent.monitor'
    },
    {
      title: 'Jadwal Pertemuan',
      description: 'Atur jadwal temu guru.',
      icon: <AcademicCapIcon />,
      colorTheme: 'rose' as const,
      action: () => setCurrentView('meetings'),
      permission: 'parent.communication'
    },
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => !item.permission || checkPermission(item.permission));

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(!networkStatus.isOnline || networkStatus.isSlow) && (
          <div className={`rounded-card p-4 mb-6 border-2 ${
            !networkStatus.isOnline
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <p className={`text-sm font-medium ${
              !networkStatus.isOnline
                ? 'text-red-700 dark:text-red-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {!networkStatus.isOnline ? '⚠️ ' : '⚡ '}
              {!networkStatus.isOnline ? getOfflineMessage() : getSlowConnectionMessage()}
            </p>
          </div>
        )}
        {currentView === 'home' && (
          <>
            {/* Welcome Banner */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up relative overflow-hidden">
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
            </div>

            {/* Child Selection */}
            {children.length > 1 && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8">
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
              </div>
            )}

            {/* Selected Child Info */}
            {selectedChild && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                      {selectedChild.studentName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">NISN</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{selectedChild.nisn || '-'}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">NIS</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{selectedChild.nis || '-'}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">Kelas</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{selectedChild.className || '-'}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">Tahun Ajaran</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{selectedChild.academicYear || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <div className={`${GRADIENT_CLASSES.PRIMARY_MEDIUM} w-20 h-20 rounded-xl flex items-center justify-center text-white text-3xl font-semibold shadow-card`}>
                      {selectedChild.studentName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Commands Section */}
            {voiceSupported && (
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Perintah Suara
                            </h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                Gunakan suara untuk navigasi cepat portal
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

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item, index) => (
                <DashboardActionCard
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  colorTheme={item.colorTheme}
                  layout="horizontal"
                  disabled={loading || !selectedChild}
                  onClick={item.action}
                  ariaLabel={item.title}
                  className={`[animation-delay:${index * 0.1}s]`}
                />
              ))}
            </div>
          </>
        )}

        {currentView === 'profile' && selectedChild && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 animate-fade-in-up">
            <div className="mb-6">
              <BackButton label="Kembali ke Beranda" onClick={() => setCurrentView('home')} />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Profil Anak</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`w-20 h-20 ${GRADIENT_CLASSES.PRIMARY_DECORATIVE} rounded-xl flex items-center justify-center text-white text-3xl font-semibold shadow-card`}>
                    {selectedChild.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{selectedChild.studentName}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">{selectedChild.className || 'Tanpa Kelas'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">NISN</p>
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">{selectedChild.nisn || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">NIS</p>
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">{selectedChild.nis || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Kelas</p>
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">{selectedChild.className || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Tahun Ajaran</p>
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">{selectedChild.academicYear || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Semester</p>
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">{selectedChild.semester || '-'}</p>
                </div>
              </div>
            </div>
          </div>
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

      </div>
    </main>
  );
};

export default ParentDashboard;
