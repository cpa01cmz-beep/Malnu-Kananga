
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UsersIcon } from './icons/UsersIcon';

import { ChartBarIcon } from './icons/ChartBarIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import PPDBManagement from './PPDBManagement'; // Import PPDB Component
import PermissionManager from './admin/PermissionManager'; // Import Permission Manager
import { ToastType } from './Toast';
import { STORAGE_KEYS } from '../constants'; // Import constants
import { logger } from '../utils/logger';
import { permissionService } from '../services/permissionService';

interface AdminDashboardProps {
    onOpenEditor: () => void;
    // New Prop to pass toast function down
    onShowToast: (msg: string, type: ToastType) => void;
}

type DashboardView = 'home' | 'users' | 'stats' | 'ppdb' | 'permissions'; // Add 'permissions' view

interface PPDBRegistrant {
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenEditor, onShowToast }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [pendingPPDB, setPendingPPDB] = useState(0);

  // Refresh stats when view changes to home
  useEffect(() => {
    if (currentView === 'home') {
        const saved = localStorage.getItem(STORAGE_KEYS.PPDB_REGISTRANTS); // Use Constant
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const count = data.filter((r: PPDBRegistrant) => r.status === 'pending').length;
                setPendingPPDB(count);
            } catch {
                logger.error("Error reading PPDB data");
            }
        }
    }
  }, [currentView]);

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {currentView === 'home' && (
            <>
                <div className="bg-white dark:bg-neutral-800 rounded-card-lg p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up">
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">Dashboard Administrator</h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                        Selamat datang, Admin. Kelola konten website dan pengguna dari sini.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up">
                    <div
                        onClick={onOpenEditor}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-card-lg p-6 text-white shadow-card cursor-pointer transition-all duration-200 hover:shadow-card-hover"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-pill flex items-center justify-center mb-4">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">AI Site Editor</h3>
                        <p className="text-indigo-100 text-sm">Edit konten Program Unggulan dan Berita menggunakan bantuan AI.</p>
                    </div>

                    <div
                        onClick={() => {
                            const hasPermission = permissionService.hasPermission('admin', null, 'ppdb.manage');
                            if (hasPermission.granted) {
                                setCurrentView('ppdb');
                            } else {
                                onShowToast('Anda tidak memiliki akses ke manajemen PPDB', 'error');
                            }
                        }}
                        className="bg-white dark:bg-neutral-800 rounded-card-lg p-6 shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-200 cursor-pointer relative"
                    >
                        {pendingPPDB > 0 && (
                            <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-pill bg-red-500 text-xs font-bold text-white shadow-md animate-pulse">
                                {pendingPPDB}
                            </span>
                        )}
                        <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-pill flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                            <ClipboardDocumentCheckIcon />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">PPDB Online</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">Verifikasi data calon siswa baru.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">Aktif</span>
                    </div>

                    <div
                        onClick={() => {
                            const hasPermission = permissionService.hasPermission('admin', null, 'users.read');
                            if (hasPermission.granted) {
                                setCurrentView('users');
                            } else {
                                onShowToast('Anda tidak memiliki akses ke manajemen user', 'error');
                            }
                        }}
                        className="bg-white dark:bg-neutral-800 rounded-card-lg p-6 shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-200 cursor-pointer"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-pill flex items-center justify-center mb-4">
                            <UsersIcon />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">Manajemen User</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">Kelola akun guru, siswa, dan staff.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">Aktif</span>
                    </div>

                    <div
                        onClick={() => {
                            const hasPermission = permissionService.hasPermission('admin', null, 'system.stats');
                            if (hasPermission.granted) {
                                setCurrentView('stats');
                            } else {
                                onShowToast('Anda tidak memiliki akses ke statistik sistem', 'error');
                            }
                        }}
                        className="bg-white dark:bg-neutral-800 rounded-card-lg p-6 shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-200 cursor-pointer"
                    >
                        <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-pill flex items-center justify-center mb-4">
                            <ChartBarIcon />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">Laporan & Log</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">Pantau statistik sistem dan factory reset.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">Aktif</span>
                    </div>

                    <div
                        onClick={() => {
                            const hasPermission = permissionService.hasPermission('admin', null, 'system.admin');
                            if (hasPermission.granted) {
                                setCurrentView('permissions');
                            } else {
                                onShowToast('Anda tidak memiliki akses ke manajemen perizinan', 'error');
                            }
                        }}
                        className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-card-lg p-6 text-white shadow-card cursor-pointer transition-all duration-200 hover:shadow-card-hover"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-pill flex items-center justify-center mb-4">
                            <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">Permission System</h3>
                        <p className="text-purple-100 text-sm">Kelola sistem perizinan peran dan audit log akses.</p>
                    </div>
                </div>
            </>
        )}

        {/* User Management View */}
        {currentView === 'users' && (
            <UserManagement 
                onBack={() => setCurrentView('home')} 
                onShowToast={onShowToast}
            />
        )}

        {/* System Stats View */}
        {currentView === 'stats' && (
            <SystemStats 
                onBack={() => setCurrentView('home')} 
                onShowToast={onShowToast}
            />
        )}

        {/* PPDB Management View */}
        {currentView === 'ppdb' && (
            <PPDBManagement 
                onBack={() => setCurrentView('home')} 
                onShowToast={onShowToast}
            />
        )}

        {/* Permission Management View */}
        {currentView === 'permissions' && (
            <PermissionManager
                onShowToast={onShowToast}
            />
        )}

      </div>
    </main>
  );
};

export default AdminDashboard;
