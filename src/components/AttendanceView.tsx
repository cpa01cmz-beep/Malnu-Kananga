import React, { useState, useEffect, useCallback } from 'react';
import { UsersIcon } from './icons/UsersIcon';
import { attendanceAPI } from '../services/apiService';
import { Attendance } from '../types';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useCanAccess } from '../hooks/useCanAccess';
import PageHeader from './ui/PageHeader';
import { TableSkeleton, CardSkeleton } from './ui/Skeleton';
import ErrorMessage from './ui/ErrorMessage';
import AccessDenied from './AccessDenied';
import Button from './ui/Button';

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
  // ALL hooks first
  const { user, canAccess } = useCanAccess();
  const STUDENT_NIS = user?.id || '';
  const STUDENT_NAME = user?.name || 'Siswa';

  const [todayStatus, setTodayStatus] = useState<string>('Hadir');
  const [history, setHistory] = useState<AttendanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { errorState, handleAsyncError, clearError } = useErrorHandler();

  const fetchAttendance = useCallback(async () => {
    if (!STUDENT_NIS) {
      setLoading(false);
      return;
    }

    setLoading(true);
    clearError();
    const result = await handleAsyncError(
      () => attendanceAPI.getByStudent(STUDENT_NIS),
      {
        operation: 'fetchAttendance',
        component: 'AttendanceView',
        fallbackMessage: 'Gagal mengambil data kehadiran'
      }
    );

    if (result && result.success && result.data) {
      processAttendanceData(result.data);
    }
    setLoading(false);
  }, [STUDENT_NIS, clearError, handleAsyncError]);

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

  // Check permissions - different requirements based on role - AFTER all hooks
  const attendanceAccess = user?.role === 'student' 
    ? canAccess('content.read') // Students can view their own attendance
    : canAccess('academic.attendance'); // Staff can manage attendance

  if (!attendanceAccess.canAccess) {
    return (
      <AccessDenied 
        onBack={onBack} 
        requiredPermission={attendanceAccess.requiredPermission}
        message={attendanceAccess.reason}
      />
    );
  }

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Rekapitulasi Kehadiran"
          showBackButton={true}
          onBackButtonClick={onBack}
          backButtonLabel="Kembali ke Portal"
        />
        <div className="space-y-6">
          <CardSkeleton />
          <TableSkeleton rows={10} cols={4} />
        </div>
      </div>
    );
  }

  if (errorState.hasError) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Rekapitulasi Kehadiran"
          showBackButton={true}
          onBackButtonClick={onBack}
          backButtonLabel="Kembali ke Portal"
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <ErrorMessage
            title="Error Loading Attendance"
            message={errorState.feedback?.message || 'Unknown error occurred'}
            variant="card"
          />
          <Button
            variant="red-solid"
            size="md"
            onClick={fetchAttendance}
          >
            Coba Lagi
          </Button>
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
      <PageHeader
        title="Rekapitulasi Kehadiran"
        subtitle="Semester Ganjil 2024/2025"
        showBackButton={true}
        onBackButtonClick={onBack}
        backButtonLabel="Kembali ke Portal"
        actions={
          <div className="text-right">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Nama Siswa</p>
            <p className="font-bold text-neutral-900 dark:text-white text-lg">{STUDENT_NAME}</p>
            <p className="text-xs font-mono text-neutral-400">NIS: {STUDENT_NIS}</p>
          </div>
        }
      />

      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 mb-8 flex items-center gap-6">
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
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Status Kehadiran Hari Ini</p>
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
          <p className="text-xs text-neutral-400 mt-1">Data sinkron dengan Wali Kelas</p>
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

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-700/30 border-b border-neutral-100 dark:border-neutral-700">
          <h4 className="font-bold text-neutral-800 dark:text-white">Riwayat 5 Hari Terakhir</h4>
        </div>
        <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
          <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Hari</th>
              <th className="px-6 py-3">Jam Masuk</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {history.length > 0 ? (
              history.map((h, i) => (
                <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
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
                <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
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
