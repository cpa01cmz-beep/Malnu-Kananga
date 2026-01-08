import React, { useState, useEffect, useCallback } from 'react';
import { studentsAPI, attendanceAPI } from '../services/apiService';
import { Student, Attendance } from '../types';
import { logger } from '../utils/logger';
import { validateAttendance } from '../utils/teacherValidation';
import {
  executeWithRetry,
  createToastHandler
} from '../utils/teacherErrorHandler';
import { useCanAccess } from '../hooks/useCanAccess';
import PageHeader from './ui/PageHeader';
import { TableSkeleton } from './ui/Skeleton';
import ErrorMessage from './ui/ErrorMessage';
import AccessDenied from './AccessDenied';

interface ClassStudent {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  address: string;
  attendanceToday: 'hadir' | 'sakit' | 'izin' | 'alpa';
}

interface ClassManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack, onShowToast }) => {
  // ALL hooks first
  const { user, canAccess } = useCanAccess();
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [className] = useState<string>('X RPL 1');
  const [_selectedDate, _setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const toast = createToastHandler(onShowToast);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentsAPI.getByClass(className);
      if (response.success && response.data) {
        const studentData = response.data.map((student: Student) => ({
          id: student.id,
          nis: student.nis,
          name: student.className,
          gender: 'L' as const,
          address: student.address,
          attendanceToday: 'hadir' as const,
        }));
        setStudents(studentData);
        await fetchTodayAttendance(studentData);
      } else {
        setError(response.message || 'Gagal mengambil data siswa');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data siswa');
      logger.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [className]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const fetchTodayAttendance = async (_studentData: ClassStudent[]) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await attendanceAPI.getByDate(today);
      if (response.success && response.data) {
        const attendanceMap = new Map(
          response.data.map((att: Attendance) => [att.studentId, att.status])
        );

        setStudents((prev) =>
          prev.map((student) => ({
            ...student,
            attendanceToday: attendanceMap.get(student.id) || 'hadir',
          }))
        );
      }
    } catch (err) {
      logger.error('Error fetching attendance:', err);
    }
  };

  // Permission checks for class management - AFTER all hooks
  const classAccess = canAccess('academic.classes');
  const attendanceAccess = canAccess('academic.attendance');
  
  if (!classAccess.canAccess || !attendanceAccess.canAccess) {
    const missingPermissions = [];
    if (!classAccess.canAccess) missingPermissions.push(classAccess.requiredPermission);
    if (!attendanceAccess.canAccess) missingPermissions.push(attendanceAccess.requiredPermission);
    
    return (
      <AccessDenied 
        onBack={onBack} 
        requiredPermission={missingPermissions.join(', ')}
        message="You need both class management and attendance permissions to access this feature."
      />
    );
  }

const handleAttendanceChange = async (id: string, status: ClassStudent['attendanceToday']) => {
    const prevStudents = [...students];
    
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendanceToday: status } : s))
    );

    try {
      const today = new Date().toISOString().split('T')[0];
      const apiStatus = status.toLowerCase() as 'hadir' | 'sakit' | 'izin' | 'alpa';

      const attendanceData = {
        id: Date.now().toString(),
        studentId: id,
        classId: className,
        date: today,
        status: apiStatus,
        notes: '',
        recordedBy: user?.id || '',
        createdAt: new Date().toISOString(),
      };

      const validation = validateAttendance(attendanceData);
      if (!validation.isValid) {
        setStudents(prevStudents);
        toast.error(validation.errors.join(', '));
        return;
      }

      const updateOperation = async () => {
        return await attendanceAPI.create(attendanceData);
      };

      const result = await executeWithRetry({
        operation: updateOperation,
        config: {
          maxRetries: 3,
          retryDelay: 1000
        }
      });
      
      if (result.success) {
        toast.success('Status kehadiran diperbarui');
      } else {
        setStudents(prevStudents);
        toast.error(result.error || 'Gagal memperbarui kehadiran');
      }
    } catch (err) {
      // Revert optimistic update
      setStudents(prevStudents);
      logger.error('Error updating attendance:', err);
      toast.error('Terjadi kesalahan saat memperbarui kehadiran');
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Data Kelas Perwalian"
          showBackButton={true}
          onBackButtonClick={onBack}
          backButtonLabel="Kembali ke Dashboard"
        />
        <TableSkeleton rows={10} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Data Kelas Perwalian"
          showBackButton={true}
          onBackButtonClick={onBack}
          backButtonLabel="Kembali ke Dashboard"
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <ErrorMessage
            title="Error Loading Class Data"
            message={error}
            variant="card"
          />
          <button
            onClick={fetchStudents}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Data Kelas Perwalian"
        subtitle={`Kelas: ${className} • Total Siswa: ${students.length}`}
        showBackButton={true}
        onBackButtonClick={onBack}
        backButtonLabel="Kembali ke Dashboard"
        actions={
          <div>
            <input
              type="text"
              placeholder="Cari Nama / NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Hadir Hari Ini</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {students.filter((s) => s.attendanceToday === 'hadir').length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Sakit</p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            {students.filter((s) => s.attendanceToday === 'sakit').length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Izin</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {students.filter((s) => s.attendanceToday === 'izin').length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Alpa</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {students.filter((s) => s.attendanceToday === 'alpa').length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
            <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-4 py-4 text-center">L/P</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Kehadiran (Hari Ini)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{student.nis}</td>
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-200">
                          {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          student.gender === 'L'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">{student.address}</td>
                    <td className="px-6 py-4">
                      <select
                        value={student.attendanceToday}
                        onChange={(e) =>
                          handleAttendanceChange(student.id, e.target.value as ClassStudent['attendanceToday'])
                        }
                        className={`text-xs font-medium rounded-full px-3 py-1.5 border-none focus:ring-2 focus:ring-green-500 cursor-pointer outline-none ${
                          student.attendanceToday === 'hadir'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        <option value="hadir">Hadir</option>
                        <option value="sakit">Sakit</option>
                        <option value="izin">Izin</option>
                        <option value="alpa">Alpa</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    Tidak ada data siswa ditemukan.
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

export default ClassManagement;
