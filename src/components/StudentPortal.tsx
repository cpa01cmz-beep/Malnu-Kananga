
import React, { useState, useEffect } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import ScheduleView from './ScheduleView';
import ELibrary from './ELibrary';
import AcademicGrades from './AcademicGrades';
import AttendanceView from './AttendanceView';
import OsisEvents from './OsisEvents';
import { ToastType } from './Toast';
import { UserExtraRole, Student } from '../types';
import { authAPI, studentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';

interface StudentPortalProps {
    onShowToast: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type PortalView = 'home' | 'schedule' | 'library' | 'grades' | 'attendance' | 'osis';

const StudentPortal: React.FC<StudentPortalProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, isSlow } = useNetworkStatus();

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

  const menuItems = [
    {
      title: 'Jadwal Pelajaran',
      description: 'Lihat jadwal kelas mingguan Anda.',
      icon: <DocumentTextIcon />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
      action: () => setCurrentView('schedule'),
      active: true
    },
    {
      title: 'E-Library',
      description: 'Akses buku digital dan materi pelajaran.',
      icon: <BuildingLibraryIcon />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
      action: () => setCurrentView('library'),
      active: true
    },
    {
      title: 'Nilai Akademik',
      description: 'Pantau hasil belajar dan transkrip nilai.',
      icon: <ClipboardDocumentCheckIcon />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
      action: () => setCurrentView('grades'),
      active: true
    },
    {
      title: 'Kehadiran',
      description: 'Cek rekapitulasi absensi semester ini.',
      icon: <UsersIcon />,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
      action: () => setCurrentView('attendance'),
      active: true
    },
  ];

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!isOnline && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">{getOfflineMessage()}</p>
          </div>
        )}

        {isSlow && isOnline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">{getSlowConnectionMessage()}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
        {currentView === 'home' && (
            <>
                {/* Welcome Banner */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in-up relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portal Siswa</h1>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 text-lg">
                        Selamat datang kembali, <strong>{loading ? 'Loading...' : studentData?.className || 'Siswa'}</strong>!
                        {extraRole === 'osis' && <span className="block mt-1 font-semibold text-orange-500">⭐ Pengurus OSIS</span>}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {!loading && studentData && `NIS: ${studentData.nis} • Kelas ${studentData.className}`}
                        {loading && 'Memuat data...'}
                      </p>
                    </div>
                    <div className="hidden md:block text-right">
                       <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mb-2">
                          Semester Ganjil 2024/2025
                       </span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {menuItems.map((item) => (
                    <div key={item.title} onClick={item.action} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col items-start cursor-pointer group transform hover:-translate-y-1">
                      <div className={`p-3 rounded-2xl ${item.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                         <div className="w-8 h-8">{item.icon}</div>
                      </div>
                      <div className="flex justify-between w-full items-start">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                         {item.active && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Aktif</span>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  ))}

                  {/* OSIS Special Menu */}
                  {extraRole === 'osis' && (
                      <div onClick={() => setCurrentView('osis')} className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-800 hover:shadow-md transition-shadow flex flex-col items-start cursor-pointer group transform hover:-translate-y-1">
                          <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                             <div className="w-8 h-8"><CalendarDaysIcon /></div>
                          </div>
                          <div className="flex justify-between w-full items-start">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Kegiatan OSIS</h3>
                             <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Extra</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola event dan proker sekolah.</p>
                      </div>
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
        {currentView === 'osis' && <OsisEvents onBack={() => setCurrentView('home')} onShowToast={onShowToast} />}
      </div>
    </main>
  );
};

export default StudentPortal;
