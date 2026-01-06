
import React, { useState } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon'; // New Icon
import GradingManagement from './GradingManagement';
import ClassManagement from './ClassManagement';
import MaterialUpload from './MaterialUpload';
import SchoolInventory from './SchoolInventory'; // New Component
import { ToastType } from './Toast';
import { UserExtraRole, UserRole } from '../types/permissions';
import { permissionService } from '../services/permissionService';

interface TeacherDashboardProps {
    onShowToast?: (msg: string, type: ToastType) => void;
    extraRole: UserExtraRole;
}

type ViewState = 'home' | 'grading' | 'class' | 'upload' | 'inventory';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onShowToast, extraRole }) => {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  const handleToast = (msg: string, type: ToastType) => {
      if (onShowToast) onShowToast(msg, type);
  };

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
                <div className="bg-white dark:bg-neutral-800 rounded-card-lg p-8 shadow-card border border-neutral-100 dark:border-neutral-700 mb-8 animate-fade-in-up">
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">Portal Guru</h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                        Selamat datang, Bapak/Ibu Guru.
                        {extraRole === 'staff' && <span className="font-semibold text-primary-600 dark:text-primary-400"> (Mode Staff Aktif)</span>}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {checkPermission('academic.classes') && (
                    <div onClick={() => setCurrentView('class')} className="bg-white dark:bg-neutral-800 p-6 rounded-card shadow-card border border-neutral-100 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-card w-fit mb-4 group-hover:bg-orange-200 transition-colors"><UsersIcon /></div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Wali Kelas</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Kelola data siswa di kelas perwalian Anda.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-pill">Aktif</span>
                    </div>
                    )}

                    {checkPermission('academic.grades') && (
                    <div onClick={() => setCurrentView('grading')} className="bg-white dark:bg-neutral-800 p-6 rounded-card shadow-card border border-neutral-100 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-card w-fit mb-4 group-hover:bg-primary-200 transition-colors"><ClipboardDocumentCheckIcon /></div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Input Nilai</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Masukkan nilai tugas, UTS, dan UAS.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-pill">Aktif</span>
                    </div>
                    )}

                    {checkPermission('content.create') && (
                    <div onClick={() => setCurrentView('upload')} className="bg-white dark:bg-neutral-800 p-6 rounded-card shadow-card border border-neutral-100 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-card w-fit mb-4 group-hover:bg-blue-200 transition-colors"><DocumentTextIcon /></div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Upload Materi</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Bagikan modul dan bahan ajar digital.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-pill">Aktif</span>
                    </div>
                    )}

                    {/* INVENTORY MANAGEMENT (STAFF ONLY) */}
                    {extraRole === 'staff' && checkPermission('inventory.manage') && (
                        <div onClick={() => setCurrentView('inventory')} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-card shadow-card border border-blue-100 dark:border-blue-800 hover:shadow-card-hover transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group">
                            <div className="bg-blue-200 dark:bg-blue-800 p-3 rounded-card w-fit mb-4 text-blue-700 dark:text-blue-300 group-hover:scale-110 transition-transform"><ArchiveBoxIcon /></div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Inventaris</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Manajemen aset dan sarana prasarana sekolah.</p>
                            <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-pill">Tugas Tambahan</span>
                        </div>
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
