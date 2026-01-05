import React, { useState, useEffect } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import UsersIcon from './icons/UsersIcon';
import UserIcon from './icons/UserIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import ParentScheduleView from './ParentScheduleView';
import ParentGradesView from './ParentGradesView';
import ParentAttendanceView from './ParentAttendanceView';
import ELibrary from './ELibrary';
import OsisEvents from './OsisEvents';
import { ToastType } from './Toast';
import type { ParentChild } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';

interface ParentDashboardProps {
  onShowToast: (msg: string, type: ToastType) => void;
}

type PortalView = 'home' | 'profile' | 'schedule' | 'library' | 'grades' | 'attendance' | 'events';

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onShowToast }) => {
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await parentsAPI.getChildren();
        if (response.success && response.data) {
          setChildren(response.data);
          if (response.data.length > 0) {
            setSelectedChild(response.data[0]);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch children:', error);
        onShowToast('Gagal memuat data anak', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [onShowToast]);

  const handleSelectChild = (child: ParentChild) => {
    setSelectedChild(child);
    setCurrentView('home');
  };

  const menuItems = [
    {
      title: 'Profil Anak',
      description: 'Lihat biodata dan informasi kelas anak.',
      icon: <UserIcon />,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
      action: () => setCurrentView('profile'),
      active: true
    },
    {
      title: 'Jadwal Pelajaran',
      description: 'Lihat jadwal kelas mingguan anak.',
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
    {
      title: 'Kegiatan Sekolah',
      description: 'Lihat agenda dan kegiatan OSIS.',
      icon: <AcademicCapIcon />,
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
      action: () => setCurrentView('events'),
      active: true
    },
  ];

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <>
            {/* Welcome Banner */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-transparent dark:from-green-900/20 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portal Wali Murid</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-lg">
                  Selamat datang, <strong>{loading ? 'Loading...' : 'Orang Tua'}</strong>!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Pantau perkembangan pendidikan anak Anda dengan mudah.
                </p>
              </div>
            </div>

            {/* Child Selection */}
            {children.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pilih Anak</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {children.map((child) => (
                    <button
                      key={child.studentId}
                      onClick={() => handleSelectChild(child)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedChild?.studentId === child.studentId
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserIcon />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{child.studentName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{child.className || 'Tanpa Kelas'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Child Info */}
            {selectedChild && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in-up">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedChild.studentName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">NISN</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedChild.nisn || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">NIS</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedChild.nis || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Kelas</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedChild.className || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Tahun Ajaran</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedChild.academicYear || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
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
                  className={`group p-6 rounded-2xl border-2 transition-all duration-200 ${
                    loading || !selectedChild
                      ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg transform hover:-translate-y-1'
                  } bg-white dark:bg-gray-800`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profil Anak</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {selectedChild.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedChild.studentName}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedChild.className || 'Tanpa Kelas'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">NISN</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedChild.nisn || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">NIS</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedChild.nis || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kelas</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedChild.className || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tahun Ajaran</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedChild.academicYear || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Semester</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedChild.semester || '-'}</p>
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
            <ELibrary onBack={() => setCurrentView('home')} onShowToast={onShowToast} />
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
      </div>
    </main>
  );
};

export default ParentDashboard;
