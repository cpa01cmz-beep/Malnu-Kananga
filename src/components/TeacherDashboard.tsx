
import React, { useState, useEffect } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import GradingManagement from './GradingManagement';
import ClassManagement from './ClassManagement';
import MaterialUpload from './MaterialUpload';
import SchoolInventory from './SchoolInventory';
import { ToastType } from './Toast';
import { UserExtraRole, UserRole } from '../types/permissions';
import { permissionService } from '../services/permissionService';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { logger } from '../utils/logger';
import Card from './ui/Card';

interface TeacherDashboardProps {
    onShowToast?: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type ViewState = 'home' | 'grading' | 'class' | 'upload' | 'inventory';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  // Initialize push notifications
  const { 
    showNotification, 
    createNotification,
    requestPermission 
  } = usePushNotifications();

  const handleToast = (msg: string, type: ToastType) => {
      if (onShowToast) onShowToast(msg, type);
  };

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

  // Check permissions for teacher role with extra role
  const checkPermission = (permission: string) => {
    const result = permissionService.hasPermission('teacher' as UserRole, extraRole, permission);
    return result.granted;
  };

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {currentView === 'home' && (
            <>
                <Card padding="lg" className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">Portal Guru</h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                        Selamat datang, Bapak/Ibu Guru.
                        {extraRole === 'staff' && <span className="font-semibold text-primary-600 dark:text-primary-400"> (Mode Staff Aktif)</span>}
                    </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {checkPermission('academic.classes') && (
                    <Card
                        onClick={() => setCurrentView('class')}
                        aria-label="Buka manajemen Wali Kelas"
                        variant="interactive"
                    >
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300"><UsersIcon /></div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Wali Kelas</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Kelola data siswa di kelas perwalian Anda.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">Aktif</span>
                    </Card>
                    )}


                    {checkPermission('academic.grades') && (
                    <Card
                        onClick={() => setCurrentView('grading')}
                        aria-label="Buka Input Nilai"
                        variant="interactive"
                    >
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300"><ClipboardDocumentCheckIcon /></div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Input Nilai</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Masukkan nilai tugas, UTS, dan UAS.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">Aktif</span>
                    </Card>
                    )}

                    {checkPermission('content.create') && (
                    <Card
                        onClick={() => setCurrentView('upload')}
                        aria-label="Buka Upload Materi"
                        variant="interactive"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300"><DocumentTextIcon /></div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Upload Materi</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Bagikan modul dan bahan ajar digital.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">Aktif</span>
                    </Card>
                    )}

                    {extraRole === 'staff' && checkPermission('inventory.manage') && (
                        <Card
                            onClick={() => setCurrentView('inventory')}
                            aria-label="Buka Inventaris"
                            variant="gradient"
                            gradient={{ from: 'from-blue-50', to: 'to-indigo-50' }}
                        >
                            <div className="bg-blue-200 dark:bg-blue-800 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 text-blue-700 dark:text-blue-300"><ArchiveBoxIcon /></div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Inventaris</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Manajemen aset dan sarana prasarana sekolah.</p>
                            <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">Tugas Tambahan</span>
                        </Card>
                    )}
                </div>
            </>
        )}

        {currentView === 'grading' && <GradingManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'class' && <ClassManagement onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'upload' && <MaterialUpload onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}
        {currentView === 'inventory' && <SchoolInventory onBack={() => setCurrentView('home')} onShowToast={handleToast}/>}

      </div>
    </main>
  );
};

export default TeacherDashboard;
