
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UsersIcon } from './icons/UsersIcon';

import { ChartBarIcon } from './icons/ChartBarIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import PPDBManagement from './PPDBManagement'; // Import PPDB Component
import PermissionManager from './admin/PermissionManager'; // Import Permission Manager
import AICacheManager from './AICacheManager'; // Import AI Cache Manager
import { ToastType } from './Toast';
import { STORAGE_KEYS } from '../constants'; // Import constants
import { logger } from '../utils/logger';
import { permissionService } from '../services/permissionService';

interface AdminDashboardProps {
    onOpenEditor: () => void;
    // New Prop to pass toast function down
    onShowToast: (msg: string, type: ToastType) => void;
}

type DashboardView = 'home' | 'users' | 'stats' | 'ppdb' | 'permissions' | 'ai-cache'; // Add 'ai-cache' view

interface PPDBRegistrant {
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenEditor, onShowToast }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [pendingPPDB, setPendingPPDB] = useState(0);

  // Check permissions for admin role
  const checkPermission = (permission: string) => {
    const result = permissionService.hasPermission('admin', null, permission);
    return result.granted;
  };

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
                    <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        Selamat datang, Admin. Kelola konten website dan pengguna dari sini.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up">
                    <div
                        onClick={onOpenEditor}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-card-lg p-6 text-white shadow-card cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors duration-300">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">AI Site Editor</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed">Edit konten Program Unggulan dan Berita menggunakan bantuan AI.</p>
                    </div>

                    {checkPermission('content.update') && (
                    <div
                        onClick={onOpenEditor}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-card-lg p-6 text-white shadow-card cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors duration-300">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">AI Site Editor</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed">Edit konten Program Unggulan dan Berita menggunakan bantuan AI.</p>
                    </div>
                    )}

                    {checkPermission('ppdb.manage') && (
                    <div
                        onClick={() => setCurrentView('ppdb')}
                        className="bg-white dark:bg-neutral-800 rounded-card-lg p-6 shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 cursor-pointer relative hover:-translate-y-1 group"
                    >
                        {pendingPPDB > 0 && (
                            <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-pill bg-red-500 text-xs font-bold text-white shadow-md animate-pulse ring-2 ring-white dark:ring-neutral-800">
                                {pendingPPDB}
                            </span>
                        )}
                        <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                            <ClipboardDocumentCheckIcon />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">PPDB Online</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 leading-relaxed">Verifikasi data calon siswa baru.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full">Aktif</span>
                    </div>
                    )}

                    {checkPermission('users.read') && (
                    <div
                        onClick={() => setCurrentView('users')}
                        className="bg-white dark:bg-neutral-800 rounded-card-lg p-6 shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 group"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <UsersIcon />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">Manajemen User</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 leading-relaxed">Kelola akun guru, siswa, dan staff.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full">Aktif</span>
                    </div>
                    )}

                    {checkPermission('system.stats') && (
                    <div
                        onClick={() => setCurrentView('stats')}
                        className="bg-white dark:bg-neutral-800 rounded-card-lg p-6 shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 group"
                    >
                        <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                            <ChartBarIcon />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">Laporan & Log</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 leading-relaxed">Pantau statistik sistem dan factory reset.</p>
                        <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full">Aktif</span>
                    </div>
                    )}

                    {checkPermission('system.admin') && (
                    <div
                        onClick={() => setCurrentView('ai-cache')}
                        className="bg-gradient-to-br from-green-500 to-teal-600 rounded-card-lg p-6 text-white shadow-card cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors duration-300">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">AI Cache Manager</h3>
                        <p className="text-green-100 text-sm leading-relaxed">Monitor dan kelola cache respons AI untuk performa optimal.</p>
                    </div>
                    )}

                    {checkPermission('system.admin') && (
                    <div
                        onClick={() => setCurrentView('permissions')}
                        className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-card-lg p-6 text-white shadow-card cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors duration-300">
                            <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">Permission System</h3>
                        <p className="text-purple-100 text-sm leading-relaxed">Kelola sistem perizinan peran dan audit log akses.</p>
                    </div>
                    )}
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

        {/* AI Cache Management View */}
        {currentView === 'ai-cache' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">AI Cache Management</h2>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Monitor dan kelola cache respons AI untuk performa optimal
                        </p>
                    </div>
                    <button
                        onClick={() => setCurrentView('home')}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
                <AICacheManager />
            </div>
        )}

      </div>
    </main>
  );
};

export default AdminDashboard;
