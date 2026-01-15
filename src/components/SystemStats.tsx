import React from 'react'

import { useEffect, useState } from 'react';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { backupVoiceSettings } from '../services/voiceSettingsBackup';
import { permissionService } from '../services/permissionService';
import { logger } from '../utils/logger';
import PermissionGuard from './PermissionGuard';
import { STORAGE_KEYS } from '../constants';
import { User, UserRole, UserExtraRole } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Heading from './ui/Heading';
import Alert from './ui/Alert';
import BackButton from './ui/BackButton';
import ConfirmationDialog from './ui/ConfirmationDialog';

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
    totalInventory: 0,
    totalEvents: 0,
    storageUsed: '0 KB',
    lastUpdate: '-',
  });

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
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

    const users = safeParse(STORAGE_KEYS.USERS, []);
    const programs = safeParse(STORAGE_KEYS.PROGRAMS, []);
    const news = safeParse(STORAGE_KEYS.NEWS, []);
    const ppdb = safeParse(STORAGE_KEYS.PPDB_REGISTRANTS, []);
    const inventory = safeParse(STORAGE_KEYS.INVENTORY, []);
    const events = safeParse(STORAGE_KEYS.EVENTS, []);

    setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: { status?: string }) => u.status === 'active').length,
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
        if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith('malnu_')) {
            total += localStorage[key].length + key.length;
        }
    }
    if (total < 1024) return `${total} B`;
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
    return `${(total / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFactoryReset = async () => {
    setShowResetDialog(true);
  };

  const performFactoryReset = async () => {
    setIsResetting(true);

    try {
        await backupVoiceSettings();
        logger.info('Voice settings backed up before factory reset');

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('malnu_')) {
                localStorage.removeItem(key);
            }
        });

        onShowToast('Sistem berhasil di-reset. Halaman akan dimuat ulang.', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        logger.error('Factory reset failed:', error);
        onShowToast('Gagal melakukan reset sistem. Silakan coba lagi.', 'error');
        setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <BackButton onClick={onBack} />
          <Heading level={1} size="3xl" weight="bold" className="mb-2">Statistik Sistem</Heading>
          <p className="text-neutral-600 dark:text-neutral-300">Monitor kinerja dan statistik penggunaan sistem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Pendaftar</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.totalPPDB}</p>
            </Card>
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total User</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers}</p>
            </Card>
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Program</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalPrograms}</p>
            </Card>
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Berita</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.totalNews}</p>
            </Card>
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Inventaris</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{stats.totalInventory}</p>
            </Card>
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Events</p>
                <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{stats.totalEvents}</p>
            </Card>
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Pengguna Aktif</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{stats.activeUsers}</p>
            </Card>
            <Card padding="sm">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Penyimpanan</p>
                <p className="text-xl font-bold text-neutral-600 dark:text-neutral-400">{stats.storageUsed}</p>
            </Card>
        </div>

        {/* Factory Reset Section */}
        <Card padding="lg">
            <Heading level={2} size="xl" weight="bold" className="mb-4">
                <span className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Sistem Maintenance
                </span>
            </Heading>

            <Alert
                variant="error"
                size="md"
                border="left"
            >
                <strong>⚠️ PERINGATAN KRITIS:</strong> Menu ini digunakan untuk pemeliharaan sistem. "Factory Reset" akan menghapus seluruh data simulasi (User, PPDB, Konten, Nilai, Inventaris) dan mengembalikan aplikasi ke kondisi awal.
                <br />
                <span className="text-sm">
                    Pastikan Anda telah melakukan backup data penting sebelum melanjutkan. Tindakan ini tidak dapat dibatalkan.
                </span>
            </Alert>

            <div className="flex justify-center mt-6">
                {canFactoryReset ? (
                    <Button
                        variant="red-solid"
                        onClick={handleFactoryReset}
                        className="flex items-center gap-2"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Lakukan Factory Reset
                    </Button>
                ) : (
                    <div className="flex items-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-bold rounded-full cursor-not-allowed">
                        <ArrowPathIcon className="w-5 h-5" />
                        Factory Reset (Permission Required)
                    </div>
                )}
            </div>
        </Card>

        <ConfirmationDialog
          isOpen={showResetDialog}
          title="Konfirmasi Factory Reset"
          message="⚠️ PERINGATAN: Ini akan menghapus SEMUA data aplikasi!\n\nData yang akan dihapus:\n• User Management\n• PPDB Registrations\n• All Materials\n• Grades\n• Inventory\n• Events\n• dan semua data lainnya\n\nTindakan ini TIDAK DAPAT dibatalkan!"
          confirmText="Ya, Lakukan Reset"
          cancelText="Batal"
          type="danger"
          onConfirm={performFactoryReset}
          onCancel={() => setShowResetDialog(false)}
          isLoading={isResetting}
        />
      </div>
    </div>
  );
};

const SystemStats: React.FC<SystemStatsProps> = (props) => {
  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
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