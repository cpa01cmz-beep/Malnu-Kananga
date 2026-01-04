
import React, { useEffect, useState } from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import UsersIcon from './icons/UsersIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

import { STORAGE_KEYS } from '../constants'; // Import constants

interface SystemStatsProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const SystemStats: React.FC<SystemStatsProps> = ({ onBack, onShowToast }) => {
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

  useEffect(() => {
    // Helper to safely parse JSON
    const safeParse = (key: string, defaultVal: any) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultVal;
    }

    // 1. Calculate Users
    const users = safeParse(STORAGE_KEYS.USERS, []);
    
    // 2. Calculate Content
    const content = safeParse(STORAGE_KEYS.SITE_CONTENT, { featuredPrograms: [], latestNews: [] });

    // 3. Calculate PPDB
    const ppdb = safeParse(STORAGE_KEYS.PPDB_REGISTRANTS, []);

    // 4. Calculate Inventory
    const inventory = safeParse(STORAGE_KEYS.INVENTORY, []);

    // 5. Calculate Events
    const events = safeParse(STORAGE_KEYS.EVENTS, []);

    // 6. Calculate Storage Usage (Approx)
    let totalBytes = 0;
    for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            totalBytes += (localStorage[key].length + key.length) * 2;
        }
    }
    const storageUsedKB = (totalBytes / 1024).toFixed(2) + ' KB';

    setStats({
      totalUsers: users.length || 4,
      activeUsers: users.filter((u: any) => u.status === 'active').length || 3,
      totalPrograms: content.featuredPrograms?.length || 3,
      totalNews: content.latestNews?.length || 3,
      totalPPDB: ppdb.length || 0,
      totalInventory: inventory.length || 3,
      totalEvents: events.length || 2,
      storageUsed: storageUsedKB,
      lastUpdate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }, []);

  const handleFactoryReset = () => {
    const confirmText = "PERINGATAN: Tindakan ini akan menghapus SEMUA data:\n- Akun user baru\n- Nilai & Absensi\n- Konten website\n- Data PPDB\n- Inventaris & Event\n\nAplikasi akan kembali ke pengaturan awal pabrik. Lanjutkan?";
    if (window.confirm(confirmText)) {
      
      // Iterate over all keys in STORAGE_KEYS and remove them
      Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
      });
      
      onShowToast('Sistem berhasil di-reset. Halaman akan dimuat ulang.', 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
            ← Kembali ke Dashboard
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan & Statistik Sistem</h2>
          <p className="text-gray-500 dark:text-gray-400">Ringkasan kesehatan dan penggunaan aplikasi.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* User Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                    <UsersIcon />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">{stats.activeUsers} Aktif</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pengguna</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
        </div>

        {/* Content Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                    <DocumentTextIcon />
                </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Konten & Materi</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPrograms + stats.totalNews}</h3>
            <p className="text-xs text-gray-400 mt-1">Item Publik</p>
        </div>

        {/* PPDB & Inventory Stats (Combined for compactness or separate) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400">
                    <ClipboardDocumentCheckIcon />
                </div>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PPDB</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPPDB}</h3>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aset</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInventory}</h3>
                </div>
            </div>
        </div>

        {/* Storage Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full text-gray-600 dark:text-gray-400">
                    <ChartBarIcon />
                </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Storage Browser</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.storageUsed}</h3>
        </div>
      </div>

      {/* Maintenance Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-8 border border-red-100 dark:border-red-900/30">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Zona Bahaya (Maintenance)</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-6">
            Menu ini digunakan untuk pemeliharaan sistem. "Factory Reset" akan menghapus seluruh data simulasi (User, PPDB, Konten, Nilai, Inventaris) dan mengembalikan aplikasi ke kondisi awal.
        </p>
        <button 
            onClick={handleFactoryReset}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-500/20"
        >
            <ArrowPathIcon className="w-5 h-5" />
            Lakukan Factory Reset
        </button>
      </div>
    </div>
  );
};

export default SystemStats;
