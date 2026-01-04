
import React, { useState } from 'react';
import type { PPDBRegistrant } from '../types';

import { STORAGE_KEYS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';

interface PPDBManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PPDBManagement: React.FC<PPDBManagementProps> = ({ onBack, onShowToast }) => {
  const [registrants, setRegistrants] = useLocalStorage<PPDBRegistrant[]>(STORAGE_KEYS.PPDB_REGISTRANTS, []);
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const updateStatus = (id: string, newStatus: PPDBRegistrant['status']) => {
    const updated = registrants.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRegistrants(updated);
    onShowToast(`Status pendaftar berhasil diubah menjadi ${newStatus === 'approved' ? 'Diterima' : 'Ditolak'}.`, newStatus === 'approved' ? 'success' : 'info');
  };

  const filteredRegistrants = registrants.filter(r => filterStatus === 'all' || r.status === filterStatus);

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Penerimaan Siswa Baru</h2>
                <p className="text-gray-500 dark:text-gray-400">Kelola data calon siswa yang mendaftar online.</p>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Pendaftar</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{registrants.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Perlu Verifikasi</p>
                <p className="text-xl font-bold text-yellow-600">{registrants.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Diterima</p>
                <p className="text-xl font-bold text-green-600">{registrants.filter(r => r.status === 'approved').length}</p>
            </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Ditolak</p>
                <p className="text-xl font-bold text-red-600">{registrants.filter(r => r.status === 'rejected').length}</p>
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                        filterStatus === status 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                >
                    {status === 'all' ? 'Semua' : status === 'pending' ? 'Menunggu' : status === 'approved' ? 'Diterima' : 'Ditolak'}
                </button>
            ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Nama Siswa</th>
                            <th className="px-6 py-4">Asal Sekolah</th>
                            <th className="px-6 py-4">Kontak</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRegistrants.length > 0 ? (
                            filteredRegistrants.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-xs font-mono">{reg.registrationDate}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{reg.fullName}</div>
                                        <div className="text-xs text-gray-500">NISN: {reg.nisn}</div>
                                    </td>
                                    <td className="px-6 py-4">{reg.originSchool}</td>
                                    <td className="px-6 py-4 text-xs">
                                        <div>{reg.phoneNumber}</div>
                                        <div className="text-gray-400">{reg.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                            reg.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                            reg.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                            {reg.status === 'pending' ? 'Verifikasi' : reg.status === 'approved' ? 'Diterima' : 'Ditolak'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {reg.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => updateStatus(reg.id, 'approved')}
                                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                    title="Terima"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(reg.id, 'rejected')}
                                                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                    title="Tolak"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Belum ada data pendaftar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default PPDBManagement;
