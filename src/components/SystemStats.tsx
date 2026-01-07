import React, { useEffect, useState } from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { backupVoiceSettings } from '../services/voiceSettingsBackup';
import { permissionService } from '../services/permissionService';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import PermissionGuard from './PermissionGuard';
import { STORAGE_KEYS } from '../constants';
import { User, UserRole, UserExtraRole } from '../types';

interface SystemStatsProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const SystemStatsContent: React.FC<SystemStatsProps> = ({ onBack, onShowToast }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPrograms: 0,
    totalNews: 0,
    totalPPDB: 0,
    totalInventory: 0, // New Stat
    totalEvents: 0, // New Stat
    storageUsed: '0 KB',
    lastUpdate: '-',
  });

  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('malnu_user');
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;

  const canFactoryReset = permissionService.hasPermission(userRole, userExtraRole, 'system.factory_reset').granted;

  useEffect(() => {
    // Helper to safely parse JSON
    const safeParse = (key: string, defaultVal: unknown) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultVal;
    }

    // Calculate totals
    const users = safeParse(STORAGE_KEYS.USERS, []);
    const materials = safeParse(STORAGE_KEYS.MATERIALS, []);
    const programs = safeParse('malnu_programs', []);
    const news = safeParse('malnu_news', []);
    const ppdb = safeParse(STORAGE_KEYS.PPDB_REGISTRANTS, []);
    const inventory = safeParse('malnu_inventory', []);
    const events = safeParse('malnu_events', []);

    setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        totalPrograms: programs.length,
        totalNews: news.length,
        totalPPDB: ppdb.length,
        totalInventory: inventory.length,
        totalEvents: events.length,
        storageUsed: calculateLocalStorageSize(),
        lastUpdate: new Date().toLocaleString('id-ID'),
    });
  }, []);

  const calculateLocalStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    if (total < 1024) return `${total} B`;
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
    return `${(total / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFactoryReset = async () => {
    if (!confirm(
        '⚠️ PERINGATAN: Ini akan menghapus SEMUA data aplikasi!\n\n' +
        'Data yang akan dihapus:\n' +
        '• User Management\n' +
        '• PPDB Registrations\n' +
        '• All Materials\n' +
        '• Grades\n' +
        '• Inventory\n' +
        '• Events\n' +
        '• dan semua data lainnya\n\n' +
        'Tindakan ini TIDAK DAPAT dibatalkan!\n\n' +
        'Lanjutkan?'
    )) return;

    try {
        // Backup voice settings before reset
        await backupVoiceSettings();
        logger.info('Voice settings backed up before factory reset');

        // Clear all app-related localStorage keys
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('malnu_')) {
                localStorage.removeItem(key);
            }
        });

        // Show success and reload
        onShowToast('Sistem berhasil di-reset. Halaman akan dimuat ulang.', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        logger.error('Factory reset failed:', error);
        onShowToast('Gagal melakukan reset sistem. Silakan coba lagi.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button onClick={onBack} className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Statistik Sistem</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor kinerja dan statistik penggunaan sistem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Pendaftar</p>
                <p className="text-xl font-bold text-green-600">{stats.totalPPDB}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total User</p>
                <p className="text-xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Program</p>
                <p className="text-xl font-bold text-purple-600">{stats.totalPrograms}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Berita</p>
                <p className="text-xl font-bold text-orange-600">{stats.totalNews}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Inventaris</p>
                <p className="text-xl font-bold text-teal-600">{stats.totalInventory}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Events</p>
                <p className="text-xl font-bold text-pink-600">{stats.totalEvents}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Pengguna Aktif</p>
                <p className="text-xl font-bold text-indigo-600">{stats.activeUsers}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Penyimpanan</p>
                <p className="text-xl font-bold text-gray-600">{stats.storageUsed}</p>
            </div>
        </div>

        {/* Factory Reset Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                <span className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Sistem Maintenance
                </span>
            </h2>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    <strong>⚠️ PERINGATAN KRITIS:</strong> Menu ini digunakan untuk pemeliharaan sistem. "Factory Reset" akan menghapus seluruh data simulasi (User, PPDB, Konten, Nilai, Inventaris) dan mengembalikan aplikasi ke kondisi awal.
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                    Pastikan Anda telah melakukan backup data penting sebelum melanjutkan. Tindakan ini tidak dapat dibatalkan.
                </p>
            </div>
            
            <div className="flex justify-center">
                {canFactoryReset ? (
                    <button 
                        onClick={handleFactoryReset}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-500/20"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Lakukan Factory Reset
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 font-bold rounded-full cursor-not-allowed">
                        <ArrowPathIcon className="w-5 h-5" />
                        Factory Reset (Permission Required)
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const SystemStats: React.FC<SystemStatsProps> = (props) => {
  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('malnu_user');
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;

  return (
    <PermissionGuard
      userRole={userRole}
      userExtraRole={userExtraRole}
      requiredPermissions={['system.stats']}
      onBack={props.onBack}
      message="You don't have permission to view system statistics"
    >
      <SystemStatsContent {...props} />
    </PermissionGuard>
  );
};

export default SystemStats;