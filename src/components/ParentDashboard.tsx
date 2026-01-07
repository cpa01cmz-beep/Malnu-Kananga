import React, { useState, useEffect } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { UsersIcon } from './icons/UsersIcon';
import { UserIcon } from './icons/UserIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import { SendIcon } from './icons/SendIcon';
import ParentScheduleView from './ParentScheduleView';
import ParentGradesView from './ParentGradesView';
import ParentAttendanceView from './ParentAttendanceView';
import ELibrary from './ELibrary';
import OsisEvents from './OsisEvents';
import ConsolidatedReportsView from './ConsolidatedReportsView';
import ParentMessagingView from './ParentMessagingView';
import ParentPaymentsView from './ParentPaymentsView';
import ParentMeetingsView from './ParentMeetingsView';
import { ToastType } from './Toast';
import type { ParentChild } from '../types';
import { UserRole, UserExtraRole } from '../types/permissions';
import { parentsAPI, authAPI } from '../services/apiService';
import { permissionService } from '../services/permissionService';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { validateMultiChildDataIsolation } from '../utils/parentValidation';
import { usePushNotifications } from '../hooks/usePushNotifications';

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
  const networkStatus = useNetworkStatus();

  // Initialize push notifications
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

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
      color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400',
      action: () => handleToggleConsolidatedView(),
      active: true
    }] : []),
    {
      title: 'Profil Anak',
      description: 'Lihat biodata dan informasi kelas anak.',
      icon: <UserIcon />,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
      action: () => setCurrentView('profile'),
      permission: 'parent.monitor'
    },
    {
      title: 'Jadwal Pelajaran',
      description: 'Lihat jadwal kelas mingguan anak.',
      icon: <DocumentTextIcon />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
      action: () => setCurrentView('schedule'),
      permission: 'academic.schedule'
    },
    {
      title: 'E-Library',
      description: 'Akses buku digital dan materi pelajaran.',
      icon: <BuildingLibraryIcon />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
      action: () => setCurrentView('library'),
      permission: 'content.read'
    },
    {
      title: 'Nilai Akademik',
      description: 'Pantau hasil belajar dan transkrip nilai.',
      icon: <ClipboardDocumentCheckIcon />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
      action: () => setCurrentView('grades'),
      permission: 'parent.monitor'
    },
    {
      title: 'Kehadiran',
      description: 'Cek rekapitulasi absensi semester ini.',
      icon: <UsersIcon />,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
      action: () => setCurrentView('attendance'),
      permission: 'parent.monitor'
    },
    {
      title: 'Kegiatan Sekolah',
      description: 'Lihat agenda dan kegiatan OSIS.',
      icon: <AcademicCapIcon />,
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
      action: () => setCurrentView('events'),
      permission: 'content.read'
    },
    {
      title: 'Laporan Konsolidasi',
      description: 'Pantau semua anak dalam laporan menyeluruh.',
      icon: <DocumentTextIcon />,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
      action: () => setCurrentView('reports'),
      permission: 'parent.reports'
    },
    {
      title: 'Pesan Guru',
      description: 'Komunikasi dengan guru anak.',
      icon: <SendIcon />,
      color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400',
      action: () => setCurrentView('messaging'),
      permission: 'parent.communication'
    },
    {
      title: 'Pembayaran',
      description: 'Pantau status pembayaran SPP dan biaya.',
      icon: <UsersIcon />,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
      action: () => setCurrentView('payments'),
      permission: 'parent.monitor'
    },
    {
      title: 'Jadwal Pertemuan',
      description: 'Atur jadwal temu guru.',
      icon: <AcademicCapIcon />,
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-transparent dark:from-primary-900/20 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
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
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-3xl font-semibold shadow-card">
                      {selectedChild.studentName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  disabled={loading || !selectedChild}
                  className={`group p-6 rounded-xl border-2 transition-all duration-200 ${
                    loading || !selectedChild
                      ? 'border-neutral-200 dark:border-neutral-700 opacity-50 cursor-not-allowed'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-card-hover hover:-translate-y-0.5'
                  } bg-white dark:bg-neutral-800`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {currentView === 'profile' && selectedChild && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Profil Anak</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-3xl font-semibold shadow-card">
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
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ParentScheduleView onShowToast={onShowToast} child={selectedChild} />
          </div>
        )}

        {currentView === 'grades' && selectedChild && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ParentGradesView onShowToast={onShowToast} child={selectedChild} />
          </div>
        )}

        {currentView === 'attendance' && selectedChild && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ParentAttendanceView onShowToast={onShowToast} child={selectedChild} />
          </div>
        )}

        {currentView === 'library' && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ELibrary onBack={() => setCurrentView('home')} onShowToast={onShowToast} userId={authAPI.getCurrentUser()?.id || ''} />
          </div>
        )}

        {currentView === 'events' && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <OsisEvents onBack={() => setCurrentView('home')} onShowToast={onShowToast} />
          </div>
        )}

        {currentView === 'reports' && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ConsolidatedReportsView onShowToast={onShowToast} children={children} />
          </div>
        )}

        {currentView === 'messaging' && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ParentMessagingView onShowToast={onShowToast} children={children} />
          </div>
        )}

        {currentView === 'payments' && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ParentPaymentsView onShowToast={onShowToast} children={children} />
          </div>
        )}

        {currentView === 'meetings' && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <ParentMeetingsView onShowToast={onShowToast} children={children} />
          </div>
        )}
      </div>
    </main>
  );
};

export default ParentDashboard;
