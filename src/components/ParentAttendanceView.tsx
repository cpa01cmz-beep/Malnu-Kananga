import React, { useState, useEffect } from 'react';
import { ToastType } from './Toast';
import type { ParentChild, Attendance } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { TableSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/LoadingState';
import Badge from './ui/Badge';

interface ParentAttendanceViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  child: ParentChild;
}

const ParentAttendanceView: React.FC<ParentAttendanceViewProps> = ({ onShowToast, child }) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await parentsAPI.getChildAttendance(child.studentId);
        if (response.success && response.data) {
          setAttendance(response.data);
          setError(null);
        } else {
          setError(response.message || 'Gagal memuat kehadiran');
        }
      } catch (err) {
        logger.error('Failed to fetch child attendance:', err);
        setError('Gagal memuat kehadiran');
        onShowToast('Gagal memuat kehadiran', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [child.studentId, onShowToast]);

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'error' | 'neutral' => {
    switch (status) {
      case 'hadir':
        return 'success';
      case 'sakit':
        return 'warning';
      case 'izin':
        return 'info';
      case 'alpa':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'hadir': 'Hadir',
      'sakit': 'Sakit',
      'izin': 'Izin',
      'alpa': 'Alpa'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const months = Array.from(new Set(attendance.map(a => a.date.substring(0, 7))));
  const filteredAttendance = selectedMonth === 'all' 
    ? attendance 
    : attendance.filter(a => a.date.startsWith(selectedMonth));

  const calculateStats = (data: Attendance[]) => {
    const stats = {
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpa: 0,
      total: data.length
    };
    data.forEach(a => {
      if (a.status in stats) {
        stats[a.status as keyof typeof stats]++;
      }
    });
    return stats;
  };

  const stats = calculateStats(filteredAttendance);
  const attendanceRate = stats.total > 0 
    ? Math.round((stats.hadir / stats.total) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        Kehadiran - {child.studentName}
      </h2>

      {loading ? (
        <TableSkeleton rows={10} cols={4} />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      ) : attendance.length === 0 ? (
        <EmptyState message="Belum ada data kehadiran" size="md" />
      ) : (
        <>
          {/* Month Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Filter Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Semua Bulan</option>
              {months.sort().reverse().map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.hadir}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Hadir</div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.sakit}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Sakit</div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.izin}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Izin</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.alpa}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Alpa</div>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Tingkat Kehadiran
              </span>
              <span className={`text-2xl font-bold ${
                attendanceRate >= 90 ? 'text-green-600 dark:text-green-400' :
                attendanceRate >= 80 ? 'text-blue-600 dark:text-blue-400' :
                attendanceRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {attendanceRate}%
              </span>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Tanggal</th>
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Kelas</th>
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Status</th>
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="py-3 text-neutral-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-400">{record.className}</td>
                    <td className="py-3">
                      <Badge variant={getStatusVariant(record.status)} size="sm">
                        {getStatusLabel(record.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-400">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentAttendanceView;
