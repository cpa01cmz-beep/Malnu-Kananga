
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import UsersIcon from './icons/UsersIcon';

import { ChartBarIcon } from './icons/ChartBarIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import UserManagement from './UserManagement';
import SystemStats from './SystemStats';
import PPDBManagement from './PPDBManagement'; // Import PPDB Component
import { ToastType } from './Toast';
import { STORAGE_KEYS } from '../constants'; // Import constants
import { logger } from '../utils/logger';

interface AdminDashboardProps {
    onOpenEditor: () => void;
    // New Prop to pass toast function down
    onShowToast: (msg: string, type: ToastType) => void;
}

type DashboardView = 'home' | 'users' | 'stats' | 'ppdb'; // Add 'ppdb' view

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
    <main className="pt-24 sm:pt-32 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Conditional Rendering based on View */}
        {currentView === 'home' && (
            <>
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Administrator</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Selamat datang, Admin. Kelola konten website dan pengguna dari sini.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                    {/* AI Editor Card */}
                    <div 
                        onClick={onOpenEditor}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">AI Site Editor</h3>
                        <p className="text-indigo-100 text-sm">Edit konten Program Unggulan dan Berita menggunakan bantuan AI.</p>
                    </div>

                    {/* PPDB Management - NEW */}
                    <div 
                        onClick={() => setCurrentView('ppdb')}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer transform hover:-translate-y-1 relative"
                    >
                        {pendingPPDB > 0 && (
                            <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md animate-pulse">
                                {pendingPPDB}
                            </span>
                        )}
                        <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                            <ClipboardDocumentCheckIcon />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">PPDB Online</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Verifikasi data calon siswa baru.</p>
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">Aktif</span>
                    </div>

                    {/* User Management Card - Active */}
                    <div 
                        onClick={() => setCurrentView('users')}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer transform hover:-translate-y-1"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <UsersIcon />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Manajemen User</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Kelola akun guru, siswa, dan staff.</p>
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">Aktif</span>
                    </div>

                    {/* Content Stats - NOW ACTIVE */}
                    <div 
                        onClick={() => setCurrentView('stats')}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer transform hover:-translate-y-1"
                    >
                        <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <ChartBarIcon />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Laporan & Log</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Pantau statistik sistem dan factory reset.</p>
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">Aktif</span>
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

      </div>
    </main>
  );
};

export default AdminDashboard;
