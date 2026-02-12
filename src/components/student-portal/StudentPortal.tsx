import React, { useState, useEffect, lazy, Suspense } from 'react';
import { UserExtraRole } from '../../types';
import { useNetworkStatus, getSlowConnectionMessage } from '../../utils/networkStatus';
import { logger } from '../../utils/logger';
import { usePushNotifications } from '../../hooks/useUnifiedNotifications';
import { useOfflineDataService } from '../../services/offlineDataService';
import { useDashboardVoiceCommands } from '../../hooks/useDashboardVoiceCommands';
import ScheduleView from '../ScheduleView';
import AcademicGrades from '../AcademicGrades';
import AttendanceView from '../AttendanceView';
import StudentInsights from '../StudentInsights';
import StudentAssignments from '../StudentAssignments';
import { GroupChat } from '../GroupChat';
import VoiceCommandsHelp from '../VoiceCommandsHelp';
import { CardSkeleton } from '../ui/Skeleton';

// BroCula: Lazy load heavy components to reduce initial bundle size
// These components are only loaded when user navigates to specific views
const ELibrary = lazy(() => import('../ELibrary'));
const OsisEvents = lazy(() => import('../OsisEvents'));
const StudyPlanGenerator = lazy(() => import('../StudyPlanGenerator'));
const StudyPlanAnalytics = lazy(() => import('../StudyPlanAnalytics'));
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import { authAPI } from '../../services/apiService';
import { useStudentPortalData } from './useStudentPortalData';
import { StudentPortalHome } from './StudentPortalHome';
import { useFilteredMenuItems } from './StudentPortalMenu';
import { StudentPortalOffline } from './StudentPortalOffline';
import { useStudentPortalRealtime } from './StudentPortalRealtime';
import { StudentPortalQuiz } from './StudentPortalQuiz';

type ToastType = 'success' | 'info' | 'error' | 'warning';

interface StudentPortalProps {
    onShowToast: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type PortalView = 'home' | 'schedule' | 'library' | 'grades' | 'assignments' | 'attendance' | 'insights' | 'osis' | 'groups' | 'study-plan' | 'study-analytics' | 'quiz' | 'quiz-history';

const StudentPortal: React.FC<StudentPortalProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [_refreshingData, setRefreshingData] = useState<Record<string, boolean>>({});
  const [selectedQuiz, setSelectedQuiz] = useState<import('../../types').Quiz | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

  const offlineDataService = useOfflineDataService();
  const { isOnline, isSlow } = useNetworkStatus();

  const {
    studentData,
    offlineData,
    loading,
    error,
    syncInProgress,
    validationResults,
    cacheFreshness,
    syncStatus: syncStatusObj,
    isCached,
    handleSync,
    refreshData: _refreshData,
    setValidationResults,
  } = useStudentPortalData({
    isOnline,
    onShowToast,
    offlineDataService,
  });

  const { isConnected, isConnecting } = useStudentPortalRealtime({
    studentData,
    offlineData,
    offlineDataService,
    isOnline,
    setValidationResults,
    onSetRefreshingData: setRefreshingData,
  });

  const syncStatus = syncStatusObj.syncStatus;

  useEffect(() => {
    if (isSlow && isOnline) {
      onShowToast(getSlowConnectionMessage(), 'info');
    }
  }, [isSlow, isOnline, onShowToast]);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const granted = await requestPermission();
        if (granted) {
          await showNotification(
            createNotification(
              'system',
              'Notifikasi Siswa Aktif',
              'Sistem notifikasi siswa telah diaktifkan'
            )
          );
        }
      } catch (error) {
        logger.error('Failed to initialize student notifications', error);
      }
    };

    initializeNotifications();
  }, [requestPermission, showNotification, createNotification]);

  const {
    isSupported: voiceSupported,
    handleVoiceCommand,
    getAvailableCommands,
  } = useDashboardVoiceCommands({
    userRole: 'student',
    extraRole,
    onNavigate: (view: string) => {
      const validViews: PortalView[] = ['schedule', 'library', 'assignments', 'grades', 'attendance', 'insights', 'osis', 'groups', 'study-plan', 'study-analytics', 'quiz', 'quiz-history'];
      if (validViews.includes(view as PortalView)) {
        setCurrentView(view as PortalView);
        onShowToast(`Navigasi ke ${view}`, 'success');
      }
    },
    onAction: (action: string) => {
      switch (action) {
        case 'show_my_assignments':
          setCurrentView('assignments');
          onShowToast('Menampilkan tugas siswa', 'success');
          break;
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

  const menuItems = useFilteredMenuItems(extraRole).map(item => ({
    ...item,
    action: () => setCurrentView(item.action as unknown as PortalView),
  }));

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
        <StudentPortalOffline
          bannerMode={bannerMode}
          showBanner={showBanner}
          syncStatus={syncStatus}
          onSync={handleSync}
          isSyncLoading={syncInProgress}
          cachedDataAvailable={isCached}
          validationResults={validationResults}
          cacheFreshness={cacheFreshness}
          showValidationDetails={showValidationDetails}
          onToggleValidationDetails={() => setShowValidationDetails(!showValidationDetails)}
        />

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
               <StudentPortalHome
                 studentData={studentData}
                 loading={loading}
                 extraRole={extraRole}
                 isOnline={isOnline}
                 isSlow={isSlow}
                 isConnected={isConnected}
                 isConnecting={isConnecting}
                 voiceSupported={voiceSupported}
                 menuItems={menuItems}
                 onNavigate={(view) => setCurrentView(view as PortalView)}
                 onShowToast={onShowToast}
                 onVoiceCommand={handleVoiceCommand}
                 onShowVoiceHelp={() => setShowVoiceHelp(true)}
               />
             )}

             {currentView === 'schedule' && <ScheduleView onBack={() => setCurrentView('home')} />}
              {currentView === 'library' && (
                <Suspense fallback={<CardSkeleton />}>
                  <ELibrary onBack={() => setCurrentView('home')} onShowToast={onShowToast} userId={authAPI.getCurrentUser()?.id || ''} />
                </Suspense>
              )}
              {currentView === 'grades' && <AcademicGrades onBack={() => setCurrentView('home')} onShowToast={onShowToast} />}
              {currentView === 'assignments' && <StudentAssignments onBack={() => setCurrentView('home')} onShowToast={onShowToast} studentId={studentData?.id || ''} studentName={studentData?.nis || ''} />}
              {currentView === 'groups' && (
                <div className="animate-fade-in-up">
                  <GroupChat
                    currentUser={{
                      id: studentData?.userId || '',
                      name: studentData?.nis || 'Siswa',
                      email: '',
                      role: 'student',
                      status: 'active',
                    }}
                  />
                </div>
              )}
              {currentView === 'attendance' && <AttendanceView onBack={() => setCurrentView('home')} />}
              {currentView === 'insights' && <StudentInsights onBack={() => setCurrentView('home')} onShowToast={onShowToast} />}
              {currentView === 'osis' && (
                <Suspense fallback={<CardSkeleton />}>
                  <OsisEvents onBack={() => setCurrentView('home')} onShowToast={onShowToast} />
                </Suspense>
              )}
              {currentView === 'study-plan' && (
                <Suspense fallback={<CardSkeleton />}>
                  <StudyPlanGenerator onBack={() => setCurrentView('home')} onShowToast={onShowToast} />
                </Suspense>
              )}
              {currentView === 'study-analytics' && (
                <Suspense fallback={<CardSkeleton />}>
                  <StudyPlanAnalytics onBack={() => setCurrentView('home')} onShowToast={onShowToast} />
                </Suspense>
              )}

            <StudentPortalQuiz
              selectedQuiz={selectedQuiz}
              currentView={currentView}
              onSubmit={(_attempt) => {
                onShowToast('Kuis berhasil dikirim!', 'success');
                setCurrentView('quiz-history');
              }}
              onCancel={() => setSelectedQuiz(null)}
              onSetCurrentView={(view) => setCurrentView(view as PortalView)}
            />
           </>
         )}

        <VoiceCommandsHelp
          isOpen={showVoiceHelp}
          onClose={() => setShowVoiceHelp(false)}
          userRole="student"
          availableCommands={getAvailableCommands()}
        />

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
