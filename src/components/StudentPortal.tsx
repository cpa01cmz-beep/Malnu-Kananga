import React from 'react'


import { useState, useEffect, useCallback } from 'react';
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
import { authAPI, studentsAPI, gradesAPI, attendanceAPI } from '../services/apiService';
import { permissionService } from '../services/permissionService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { usePushNotifications } from '../hooks/useUnifiedNotifications';
import { useOfflineDataService, useOfflineData, type CachedStudentData } from '../services/offlineDataService';
import { StudentPortalValidator, type CacheFreshnessInfo, type ValidationResult } from '../utils/studentPortalValidator';

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
import OfflineBanner from './ui/OfflineBanner';
import Alert from './ui/Alert';

interface StudentPortalProps {
    onShowToast: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type PortalView = 'home' | 'schedule' | 'library' | 'grades' | 'attendance' | 'insights' | 'osis';

const StudentPortal: React.FC<StudentPortalProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [offlineData, setOfflineData] = useState<CachedStudentData | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [cacheFreshness, setCacheFreshness] = useState<CacheFreshnessInfo | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  // Initialize push notifications and offline services
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();
  
  const offlineDataService = useOfflineDataService();
  const { syncStatus, isCached } = useOfflineData('student', studentData?.id);
  
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
      setLoading(true);
      setError(null);

      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) {
        setError('Pengguna tidak ditemukan');
        setLoading(false);
        return;
      }

      // Try offline cache first
      if (!isOnline) {
        const cachedData = offlineDataService.getCachedStudentData(currentUser.id);
        if (cachedData) {
          setStudentData(cachedData.student);
          setOfflineData(cachedData);

          const freshness = StudentPortalValidator.getCacheFreshnessInfo(
            cachedData.lastUpdated,
            cachedData.expiresAt
          );
          setCacheFreshness(freshness);

          const studentValidation = StudentPortalValidator.validatePersonalInformation(cachedData.student);
          const gradesValidation = StudentPortalValidator.validateGradeCalculation(cachedData.grades || []);
          const attendanceValidation = (cachedData.attendance || []).map(att =>
            StudentPortalValidator.validateAttendanceRecord(att)
          );

          setValidationResults({
            student: studentValidation,
            grades: gradesValidation,
            attendance: {
              isValid: attendanceValidation.every(v => v.isValid),
              errors: attendanceValidation.flatMap(v => v.errors),
              warnings: attendanceValidation.flatMap(v => v.warnings)
            }
          });

          onShowToast('Menggunakan data offline', 'info');
          setLoading(false);
          return;
        } else {
          setError(getOfflineMessage());
          setLoading(false);
          return;
        }
      }

      // Online: fetch fresh data
      try {
        const studentResponse = await studentsAPI.getByUserId(currentUser.id);
        if (studentResponse.success && studentResponse.data) {
          setStudentData(studentResponse.data);
          
          // Fetch additional data for offline caching
          try {
            const [gradesResponse, attendanceResponse] = await Promise.all([
              gradesAPI.getByStudent(studentResponse.data.id),
              attendanceAPI.getByStudent(studentResponse.data.id)
            ]);

            if (gradesResponse.success && attendanceResponse.success) {
              const cachedData = {
                student: studentResponse.data,
                grades: gradesResponse.data || [],
                attendance: attendanceResponse.data || [],
                schedule: [], // TODO: Fetch schedule when API is available
              };

              offlineDataService.cacheStudentData(cachedData);

              const studentValidation = StudentPortalValidator.validatePersonalInformation(studentResponse.data);
              const gradesValidation = StudentPortalValidator.validateGradeCalculation(gradesResponse.data || []);
              const attendanceValidation = (attendanceResponse.data || []).map(att =>
                StudentPortalValidator.validateAttendanceRecord(att)
              );

              setValidationResults({
                student: studentValidation,
                grades: gradesValidation,
                attendance: {
                  isValid: attendanceValidation.every(v => v.isValid),
                  errors: attendanceValidation.flatMap(v => v.errors),
                  warnings: attendanceValidation.flatMap(v => v.warnings)
                }
              });
            }
          } catch (error) {
            logger.warn('Failed to fetch data for offline caching:', error);
          }
        } else {
          // Fallback to cache if available
          const cachedData = offlineDataService.getCachedStudentData(currentUser.id);
          if (cachedData) {
            setStudentData(cachedData.student);
            setOfflineData(cachedData);

            const freshness = StudentPortalValidator.getCacheFreshnessInfo(
              cachedData.lastUpdated,
              cachedData.expiresAt
            );
            setCacheFreshness(freshness);

            const studentValidation = StudentPortalValidator.validatePersonalInformation(cachedData.student);
            const gradesValidation = StudentPortalValidator.validateGradeCalculation(cachedData.grades || []);
            const attendanceValidation = (cachedData.attendance || []).map(att =>
              StudentPortalValidator.validateAttendanceRecord(att)
            );

            setValidationResults({
              student: studentValidation,
              grades: gradesValidation,
              attendance: {
                isValid: attendanceValidation.every(v => v.isValid),
                errors: attendanceValidation.flatMap(v => v.errors),
                warnings: attendanceValidation.flatMap(v => v.warnings)
              }
            });

            onShowToast('Server tidak tersedia, menggunakan data offline', 'info');
          } else {
            setError('Data siswa tidak ditemukan');
          }
        }
      } catch (err) {
        logger.error('Failed to fetch student data:', err);
        
        // Fallback to cache on error
        const cachedData = offlineDataService.getCachedStudentData(currentUser.id);
        if (cachedData) {
          setStudentData(cachedData.student);
          setOfflineData(cachedData);

          const freshness = StudentPortalValidator.getCacheFreshnessInfo(
            cachedData.lastUpdated,
            cachedData.expiresAt
          );
          setCacheFreshness(freshness);

          const studentValidation = StudentPortalValidator.validatePersonalInformation(cachedData.student);
          const gradesValidation = StudentPortalValidator.validateGradeCalculation(cachedData.grades || []);
          const attendanceValidation = (cachedData.attendance || []).map(att =>
            StudentPortalValidator.validateAttendanceRecord(att)
          );

          setValidationResults({
            student: studentValidation,
            grades: gradesValidation,
            attendance: {
              isValid: attendanceValidation.every(v => v.isValid),
              errors: attendanceValidation.flatMap(v => v.errors),
              warnings: attendanceValidation.flatMap(v => v.warnings)
            }
          });

          onShowToast('Gagal memuat data, menggunakan data offline', 'info');
        } else {
          setError('Gagal memuat data siswa. Silakan coba lagi.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [isOnline, offlineDataService, onShowToast]);

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

  // Handle manual sync
  const handleSync = async () => {
    if (!isOnline) {
      onShowToast('Memerlukan koneksi internet untuk sinkronisasi', 'error');
      return;
    }

    setSyncInProgress(true);
    onShowToast('Menyinkronkan data...', 'info');

    try {
      await offlineDataService.forceSync();
      
      // Re-fetch data
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        window.location.reload(); // Simple refresh to get fresh data
      }
    } catch (error) {
      logger.error('Failed to sync:', error);
      onShowToast('Sinkronisasi gagal, silakan coba lagi', 'error');
    } finally {
      setSyncInProgress(false);
    }
  };

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

  // Determine offline banner mode
  const getBannerMode = () => {
    if (!isOnline && isSlow) return 'both';
    if (!isOnline) return 'offline';
    if (isSlow) return 'slow';
    return 'offline';
  };

  const bannerMode = getBannerMode();
  const showBanner = !isOnline || isSlow;

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Offline Banner */}
        <OfflineBanner
          mode={bannerMode}
          show={showBanner}
          syncStatus={syncStatus.needsSync || syncStatus.pendingActions > 0 ? syncStatus : undefined}
          onSync={handleSync}
          isSyncLoading={syncInProgress}
          cachedDataAvailable={isCached}
          cachedDataInfo={isCached ? 'Data Offline Tersedia' : undefined}
        />

        {/* Validation Status Alert */}
        {!loading && validationResults.student && (
          <div className="mb-4">
            {cacheFreshness && !cacheFreshness.isFresh && (
              <Alert variant="warning" size="md" fullWidth>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">Status Data Offline</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{cacheFreshness.message}</p>
                  </div>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={handleSync}
                    disabled={syncInProgress}
                  >
                    {syncInProgress ? 'Sinkronisasi...' : 'Sinkronkan'}
                  </Button>
                </div>
              </Alert>
            )}

            {(validationResults.grades?.warnings.length > 0 ||
              validationResults.attendance?.warnings.length > 0) && (
              <Alert variant="info" size="md" fullWidth className="mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Validasi Data</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {validationResults.grades?.warnings.length || 0} peringatan nilai, {validationResults.attendance?.warnings.length || 0} peringatan kehadiran
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowValidationDetails(!showValidationDetails)}
                  >
                    {showValidationDetails ? 'Tutup Detail' : 'Lihat Detail'}
                  </Button>
                </div>
              </Alert>
            )}

            {showValidationDetails && (
              <div className="mt-2 space-y-2">
                {validationResults.grades?.warnings.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">Peringatan Nilai</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                      {validationResults.grades.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResults.attendance?.warnings.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">Peringatan Kehadiran</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                      {validationResults.attendance.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {(validationResults.student?.errors.length > 0 ||
              validationResults.grades?.errors.length > 0 ||
              validationResults.attendance?.errors.length > 0) && (
              <Alert variant="error" size="md" fullWidth className="mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">Error Validasi Data</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {validationResults.student?.errors.length || 0} error siswa, {validationResults.grades?.errors.length || 0} error nilai, {validationResults.attendance?.errors.length || 0} error kehadiran
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowValidationDetails(!showValidationDetails)}
                  >
                    {showValidationDetails ? 'Tutup Detail' : 'Lihat Detail'}
                  </Button>
                </div>
              </Alert>
            )}

            {showValidationDetails && (validationResults.student?.errors.length > 0 ||
              validationResults.grades?.errors.length > 0 ||
              validationResults.attendance?.errors.length > 0) && (
              <div className="mt-2 space-y-2">
                {validationResults.student?.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-2">Error Data Siswa</h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                      {validationResults.student.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResults.grades?.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-2">Error Data Nilai</h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                      {validationResults.grades.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResults.attendance?.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-2">Error Data Kehadiran</h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                      {validationResults.attendance.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
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
                      <h1 className="text-4xl sm:text-3xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Portal Siswa</h1>
                      <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-lg">
                        Selamat datang kembali, <strong>{loading ? 'Loading...' : studentData?.className || 'Siswa'}</strong>!
                        {extraRole === 'osis' && (
                          <Badge variant="warning" size="sm" className="block mt-1">
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
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 sm:w-24 h-32 sm:h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
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

        {/* Offline Status Indicator */}
        {!isOnline && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-800 rounded-lg p-3 shadow-lg max-w-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">Offline Mode</span>
            </div>
            {offlineData && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                Data tersimpan hingga {new Date(offlineData.lastUpdated).toLocaleDateString('id-ID')}
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

export default StudentPortal;
