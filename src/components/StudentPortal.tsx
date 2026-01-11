
import React, { useState, useEffect, useCallback } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { BrainIcon } from './icons/BrainIcon';
import ScheduleView from './ScheduleView';
import ELibrary from './ELibrary';
import AcademicGrades from './AcademicGrades';
import AttendanceView from './AttendanceView';
import StudentInsights from './StudentInsights';
import OsisEvents from './OsisEvents';
import { ToastType } from './Toast';
import { UserExtraRole, Student } from '../types';
import { UserRole, UserExtraRole as PermUserExtraRole } from '../types/permissions';
import { authAPI, studentsAPI } from '../services/apiService';
import { permissionService } from '../services/permissionService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { usePushNotifications } from '../hooks/usePushNotifications';

import ErrorMessage from './ui/ErrorMessage';
import DashboardActionCard from './ui/DashboardActionCard';
import Badge from './ui/Badge';
import SmallActionButton from './ui/SmallActionButton';
import { CardSkeleton } from './ui/Skeleton';
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import type { VoiceCommand } from '../types';
import VoiceInputButton from './VoiceInputButton';
import VoiceCommandsHelp from './VoiceCommandsHelp';
import Button from './ui/Button';

interface StudentPortalProps {
    onShowToast: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type PortalView = 'home' | 'schedule' | 'library' | 'grades' | 'attendance' | 'insights' | 'osis';

const StudentPortal: React.FC<StudentPortalProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  // Initialize push notifications
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, isSlow } = useNetworkStatus();

  // Check permissions for student role with extra role
  const checkPermission = (permission: string) => {
    const result = permissionService.hasPermission('student' as UserRole, extraRole as PermUserExtraRole, permission);
    return result.granted;
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!isOnline) {
        setError(getOfflineMessage());
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const currentUser = authAPI.getCurrentUser();
        if (currentUser) {
          const studentResponse = await studentsAPI.getByUserId(currentUser.id);
          if (studentResponse.success && studentResponse.data) {
            setStudentData(studentResponse.data);
          } else {
            setError('Data siswa tidak ditemukan');
          }
        }
      } catch (err) {
        logger.error('Failed to fetch student data:', err);
        setError('Gagal memuat data siswa. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [isOnline]);

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
          logger.info('Student notifications enabled');
          await showNotification(
            createNotification(
              'system',
              'Notifikasi Siswa Aktif',
              'Sistem notifikasi siswa telah diaktifkan'
            )
          );
        }
      } catch (error) {
        logger.error('Failed to initialize student notifications:', error);
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
    userRole: 'student',
    extraRole,
    onNavigate: (view: string) => {
      const validViews: PortalView[] = ['schedule', 'library', 'grades', 'attendance', 'insights', 'osis'];
      if (validViews.includes(view as PortalView)) {
        setCurrentView(view as PortalView);
        onShowToast(`Navigasi ke ${view}`, 'success');
      }
    },
    onAction: (action: string) => {
      switch (action) {
        case 'show_my_grades':
          setCurrentView('grades');
          onShowToast('Menampilkan nilai siswa', 'success');
          break;
        case 'check_attendance':
          setCurrentView('attendance');
          onShowToast('Menampilkan absensi siswa', 'success');
          break;
        case 'view_insights':
          setCurrentView('insights');
          onShowToast('Menampilkan insight akademik', 'success');
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

  const allMenuItems = [
    {
      title: 'Jadwal Pelajaran',
      description: 'Lihat jadwal kelas mingguan Anda.',
      icon: <DocumentTextIcon />,
      colorTheme: 'blue' as const,
      action: () => setCurrentView('schedule'),
      permission: 'academic.schedule',
      active: true
    },
    {
      title: 'E-Library',
      description: 'Akses buku digital dan materi pelajaran.',
      icon: <BuildingLibraryIcon />,
      colorTheme: 'purple' as const,
      action: () => setCurrentView('library'),
      permission: 'content.read',
      active: true
    },
    {
      title: 'Nilai Akademik',
      description: 'Pantau hasil belajar dan transkrip nilai.',
      icon: <ClipboardDocumentCheckIcon />,
      colorTheme: 'green' as const,
      action: () => setCurrentView('grades'),
      permission: 'content.read',
      active: true
    },
{
       title: 'Kehadiran',
       description: 'Cek rekapitulasi absensi semester ini.',
       icon: <UsersIcon />,
       colorTheme: 'orange' as const,
       action: () => setCurrentView('attendance'),
       permission: 'content.read',
       active: true
     },
     {
       title: 'My Insights',
       description: 'Analisis AI performa akademik personal.',
       icon: <BrainIcon />,
       colorTheme: 'purple' as const,
       action: () => setCurrentView('insights'),
       permission: 'content.read',
       active: true
     },
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => checkPermission(item.permission));

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!isOnline && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-card p-4 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <ErrorMessage 
              title="Offline Mode" 
              message={getOfflineMessage()} 
              variant="inline" 
            />
          </div>
        )}

        {isSlow && isOnline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-card p-4 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">{getSlowConnectionMessage()}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
               ))}
             </div>
           </div>
         ) : error ? (
           <>
             <ErrorMessage
               title="Error Loading Portal"
               message={error}
               variant="card"
             />
             <div className="text-center">
               <Button
                 onClick={() => window.location.reload()}
                 variant="red-solid"
                 size="md"
                 className="mt-4"
               >
                 Coba Lagi
               </Button>
             </div>
           </>
         ) : (
          <>
         {currentView === 'home' && (
            <>
                {/* Welcome Banner */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">Portal Siswa</h1>
                      <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-lg">
                        Selamat datang kembali, <strong>{loading ? 'Loading...' : studentData?.className || 'Siswa'}</strong>!
                        {extraRole === 'osis' && (
                          <Badge variant="orange" size="sm" className="block mt-1">
                            ⭐ Pengurus OSIS
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {!loading && studentData && `NIS: ${studentData.nis} • Kelas ${studentData.className}`}
                        {loading && 'Memuat data...'}
                      </p>
                    </div>
                    <div className="hidden md:block text-right">
                       <Badge variant="primary" size="lg" className="mb-2">
                           Semester Ganjil 2024/2025
                       </Badge>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
</div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {menuItems.map((item) => (
                     <DashboardActionCard
                        key={item.title}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        colorTheme={item.colorTheme}
                        statusBadge={item.active ? 'Aktif' : undefined}
                        isOnline={isOnline}
                        onClick={item.action}
                        ariaLabel={`Buka ${item.title}`}
                     />
                   ))}

                    {extraRole === 'osis' && checkPermission('osis.events') && (
                      <DashboardActionCard
                         icon={<CalendarDaysIcon />}
                         title="Kegiatan OSIS"
                         description="Kelola event dan proker sekolah."
                         colorTheme="orange"
                         variant="gradient"
                         gradient={{ from: 'from-orange-50', to: 'to-red-50' }}
                         statusBadge="Aktif"
                         isExtraRole={true}
                         extraRoleBadge="Extra"
                         isOnline={isOnline}
                         onClick={() => setCurrentView('osis')}
                         ariaLabel="Buka Kegiatan OSIS"
                      />
                    )}
                   </div>
            </>
        )}
        </>
        )}

        {currentView === 'schedule' && <ScheduleView onBack={() => setCurrentView('home')} />}
        {currentView === 'library' && <ELibrary onBack={() => setCurrentView('home')} onShowToast={onShowToast} userId={authAPI.getCurrentUser()?.id || ''} />}
        {currentView === 'grades' && <AcademicGrades onBack={() => setCurrentView('home')} onShowToast={onShowToast} />}
        {currentView === 'attendance' && <AttendanceView onBack={() => setCurrentView('home')} />}
        {currentView === 'insights' && <StudentInsights onBack={() => setCurrentView('home')} onShowToast={onShowToast} />}
        {currentView === 'osis' && <OsisEvents onBack={() => setCurrentView('home')} onShowToast={onShowToast} />}

        {/* Voice Commands Help Modal */}
        <VoiceCommandsHelp
          isOpen={showVoiceHelp}
          onClose={() => setShowVoiceHelp(false)}
          userRole="student"
          availableCommands={getAvailableCommands()}
        />

      </div>
    </main>
  );
};

export default StudentPortal;
