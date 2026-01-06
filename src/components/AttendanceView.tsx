import React, { useState, useEffect, useCallback } from 'react';
import { UsersIcon } from './icons/UsersIcon';
import { attendanceAPI } from '../services/apiService';
import { Attendance } from '../types';
import { authAPI } from '../services/apiService';
import { logger } from '../utils/logger';

interface AttendanceViewProps {
  onBack: () => void;
}

interface AttendanceHistory {
  date: string;
  day: string;
  status: string;
  time: string;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ onBack }) => {
  const currentUser = authAPI.getCurrentUser();
  const STUDENT_NIS = currentUser?.id || '';
  const STUDENT_NAME = currentUser?.name || 'Siswa';

  const [todayStatus, setTodayStatus] = useState<string>('Hadir');
  const [history, setHistory] = useState<AttendanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (!STUDENT_NIS) {
      setError('User tidak ditemukan');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await attendanceAPI.getByStudent(STUDENT_NIS);
      if (response.success && response.data) {
        processAttendanceData(response.data);
      } else {
        setError(response.message || 'Gagal mengambil data kehadiran');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data kehadiran');
      logger.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [STUDENT_NIS]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const processAttendanceData = (attendanceData: Attendance[]) => {
    const today = new Date().toISOString().split('T')[0];

    const todayRecord = attendanceData.find((att) => att.date === today);
    if (todayRecord) {
      const statusMap: Record<string, string> = {
        hadir: 'Hadir',
        sakit: 'Sakit',
        izin: 'Izin',
        alpa: 'Alpa',
      };
      setTodayStatus(statusMap[todayRecord.status] || 'Hadir');
    }

    const historyData: AttendanceHistory[] = attendanceData
      .filter((att) => att.date !== today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((att) => {
        const date = new Date(att.date);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const day = days[date.getDay()];
        const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const statusMap: Record<string, string> = {
          hadir: 'Hadir',
          sakit: 'Sakit',
          izin: 'Izin',
          alpa: 'Alpa',
        };

        return {
          date: formattedDate,
          day: day,
          status: statusMap[att.status] || 'Hadir',
          time: att.status === 'hadir' ? '07:00' : '-',
        };
      });

    setHistory(historyData);
  };

  const getAttendanceCount = (status: string): number => {
    return history.filter((h) => h.status === status).length;
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rekapitulasi Kehadiran</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rekapitulasi Kehadiran</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchAttendance}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const totalHistory = history.length;
  const presentCount = getAttendanceCount('Hadir');
  const sickCount = getAttendanceCount('Sakit');
  const permissionCount = getAttendanceCount('Izin');
  const absentCount = getAttendanceCount('Alpa');
  const presentPercentage = totalHistory > 0 ? Math.round((presentCount / totalHistory) * 100) : 95;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
            ← Kembali ke Portal
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rekapitulasi Kehadiran</h2>
          <p className="text-gray-500 dark:text-gray-400">Semester Ganjil 2024/2025</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Nama Siswa</p>
          <p className="font-bold text-gray-900 dark:text-white text-lg">{STUDENT_NAME}</p>
          <p className="text-xs font-mono text-gray-400">NIS: {STUDENT_NIS}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex items-center gap-6">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-inner ${
            todayStatus === 'Hadir'
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
              : todayStatus === 'Sakit'
              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
              : todayStatus === 'Izin'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30'
          }`}
        >
          <UsersIcon />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status Kehadiran Hari Ini</p>
          <h3
            className={`text-3xl font-bold ${
              todayStatus === 'Hadir'
                ? 'text-green-600 dark:text-green-400'
                : todayStatus === 'Sakit'
                ? 'text-yellow-600 dark:text-yellow-400'
                : todayStatus === 'Izin'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {todayStatus}
          </h3>
          <p className="text-xs text-gray-400 mt-1">Data sinkron dengan Wali Kelas</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800 text-center">
          <span className="block text-2xl font-bold text-green-700 dark:text-green-400">{presentPercentage}%</span>
          <span className="text-xs text-green-600 dark:text-green-300">Persentase Hadir</span>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800 text-center">
          <span className="block text-2xl font-bold text-yellow-700 dark:text-yellow-400">{sickCount}</span>
          <span className="text-xs text-yellow-600 dark:text-yellow-300">Sakit</span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
          <span className="block text-2xl font-bold text-blue-700 dark:text-blue-400">{permissionCount}</span>
          <span className="text-xs text-blue-600 dark:text-blue-300">Izin</span>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800 text-center">
          <span className="block text-2xl font-bold text-red-700 dark:text-red-400">{absentCount}</span>
          <span className="text-xs text-red-600 dark:text-red-300">Alpa</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-800 dark:text-white">Riwayat 5 Hari Terakhir</h4>
        </div>
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Hari</th>
              <th className="px-6 py-3">Jam Masuk</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {history.length > 0 ? (
              history.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-3">{h.date}</td>
                  <td className="px-6 py-3">{h.day}</td>
                  <td className="px-6 py-3 font-mono text-xs">{h.time}</td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        h.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada riwayat kehadiran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceView;
