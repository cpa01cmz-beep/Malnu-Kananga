import React, { useState, useEffect, useCallback, useRef } from 'react';
import { attendanceAPI, studentsAPI } from '../services/apiService';
import { attendanceOCRService, type AttendanceSheetData, type AttendanceStudentInfo, type AttendanceOCRProgress } from '../services/attendanceOCRService';
import { useCanAccess } from '../hooks/useCanAccess';
import PageHeader from './ui/PageHeader';
import Button from './ui/Button';
import { TableSkeleton } from './ui/Skeleton';
import AccessDenied from './AccessDenied';
import Alert from './ui/Alert';
import { logger } from '../utils/logger';
import SearchInput from './ui/SearchInput';
import { OfflineIndicator } from './OfflineIndicator';
import { useNetworkStatus } from '../utils/networkStatus';
import ProgressBar from './ui/ProgressBar';
import { UserRole, UserExtraRole } from '../types';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { FILE_SIZE_LIMITS, USER_ROLES, ACADEMIC, UI_STRINGS } from '../constants';

interface AttendanceManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface StudentAttendanceRow extends AttendanceStudentInfo {
  status: typeof ACADEMIC.ATTENDANCE_STATUSES[keyof typeof ACADEMIC.ATTENDANCE_STATUSES];
  notes?: string;
  isEdited?: boolean;
}

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ onBack, onShowToast }) => {
  const { user, canAccess } = useCanAccess();
  const userRole = user?.role as UserRole || USER_ROLES.STUDENT;
  const _userExtraRole = user?.extraRole as UserExtraRole;
  
  // Check permissions
  const canManageAttendance = canAccess('academic.attendance').canAccess;
  const canUseOCRParsing = canAccess('academic.attendance').canAccess && 
    ([USER_ROLES.TEACHER, USER_ROLES.WAKASEK, USER_ROLES.KEPSEK] as UserRole[]).includes(userRole);

  const { isOnline } = useNetworkStatus();
  const { handleAsyncError, clearError } = useErrorHandler();

  // State
  const classId = 'kelas-10-1';
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // OCR State
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrProgress, setOCRProgress] = useState<AttendanceOCRProgress>({ status: '', progress: 0, stage: 'initializing' });
  const [ocrResult, setOcrResult] = useState<AttendanceSheetData | null>(null);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showOCRReview, setShowOCRReview] = useState(false);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    clearError();
    const result = await handleAsyncError(
      () => studentsAPI.getByClass(classId),
      {
        operation: 'fetchStudents',
        component: 'AttendanceManagement',
        fallbackMessage: 'Gagal mengambil data siswa'
      }
    );

    if (result && result.success && result.data) {
      // Convert Student[] to StudentAttendanceRow[]
      const attendanceRows = result.data.map(s => ({
        id: s.id,
        nis: s.nis,
        name: s.className || s.nis,
        status: ACADEMIC.ATTENDANCE_STATUSES.PRESENT,
        isEdited: false
      }));
      setStudents(attendanceRows);
    }
    setLoading(false);
  }, [classId, clearError, handleAsyncError]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle OCR file upload
  const handleOCRUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      onShowToast('Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF.', 'error');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > FILE_SIZE_LIMITS.MATERIAL_DEFAULT) {
      onShowToast('Ukuran file terlalu besar (maksimal 50MB).', 'error');
      return;
    }

    setIsOCRProcessing(true);
    setOCRProgress({ status: 'Memulai OCR...', progress: 0, stage: 'initializing' });
    setShowOCRModal(true);

    try {
      // Prepare student info for OCR matching
      const studentInfo: AttendanceStudentInfo[] = students.map(s => ({
        id: s.id,
        nis: s.nis,
        name: s.name
      }));

      // Process attendance sheet
      const result = await attendanceOCRService.processAttendanceSheet(
        file,
        studentInfo,
        (progress) => {
          setOCRProgress(progress);
        }
      );

      setOcrResult(result);
      setOCRProgress({ status: 'Selesai', progress: 100, stage: 'completed' });
      setShowOCRReview(true);
    } catch (error) {
      logger.error('OCR Processing Error:', error);
      onShowToast(error instanceof Error ? error.message : 'Gagal memproses OCR', 'error');
    } finally {
      setIsOCRProcessing(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Apply OCR results to student list
  const applyOCRResults = () => {
    if (!ocrResult) return;

    const updatedStudents = students.map(student => {
      const ocrEntry = ocrResult.studentAttendance.find(a => a.studentId === student.id);
      if (ocrEntry) {
        return {
          ...student,
          status: ocrEntry.status,
          notes: ocrEntry.notes,
          isEdited: ocrEntry.confidence < 70 // Mark as edited if low confidence
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setOcrResult(null);
    setShowOCRReview(false);
    setShowOCRModal(false);
    setHasUnsavedChanges(true);
    onShowToast('Data kehadiran berhasil diisi dari OCR', 'success');
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!isOnline) {
      onShowToast('Tidak dapat menyimpan saat offline', 'error');
      return;
    }

    setIsSaving(true);
    clearError();

    try {
      // Create attendance records for all students
      const savePromises = students.map(student =>
        attendanceAPI.create({
          studentId: student.id,
          classId,
          date: selectedDate,
          status: student.status,
          notes: student.notes || '',
          recordedBy: user?.id || 'unknown'
        })
      );

      await Promise.all(savePromises);
      
      setHasUnsavedChanges(false);
      onShowToast('Data kehadiran berhasil disimpan', 'success');
    } catch (error) {
      logger.error('Error saving attendance:', error);
      onShowToast('Gagal menyimpan data kehadiran', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter students by search term
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis.includes(searchTerm)
  );

  // Calculate summary
  const summary = {
    total: students.length,
    present: students.filter(s => s.status === 'hadir').length,
    sick: students.filter(s => s.status === 'sakit').length,
    permission: students.filter(s => s.status === 'izin').length,
    absent: students.filter(s => s.status === 'alpa').length
  };

  const statusColors = {
    hadir: 'bg-green-100 text-green-700',
    sakit: 'bg-yellow-100 text-yellow-700',
    izin: 'bg-blue-100 text-blue-700',
    alpa: 'bg-red-100 text-red-700'
  };

  // Permission check
  if (!canManageAttendance) {
    return (
      <AccessDenied 
        onBack={onBack} 
        requiredPermission="academic.attendance"
        message="Anda tidak memiliki akses untuk mengelola kehadiran"
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Manajemen Kehadiran"
        subtitle="Kelas X IPA 1"
        showBackButton={true}
        onBackButtonClick={onBack}
        backButtonLabel="Kembali ke Portal"
      />

      <OfflineIndicator />

      {/* OCR Upload Section */}
      {canUseOCRParsing && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
                Upload Daftar Kehadiran (OCR)
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Scan daftar kehadiran kelas untuk pengisian otomatis
              </p>
            </div>
            <Button
              onClick={() => ocrInputRef.current?.click()}
              disabled={isOCRProcessing}
              isLoading={isOCRProcessing}
              variant="primary"
              size="md"
            >
              📷 Upload Daftar Kehadiran
            </Button>
          </div>
          <input
            ref={ocrInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleOCRUpload}
            className="hidden"
            disabled={isOCRProcessing}
          />
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Format: JPG, PNG, PDF (Maksimal 10MB)
          </p>
        </div>
      )}

      {/* Date Selection and Summary */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end gap-2">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa..."
              className="flex-1 min-w-[200px]"
            />
            <Button
              onClick={handleSaveAttendance}
              disabled={!hasUnsavedChanges || isSaving || !isOnline}
              isLoading={isSaving}
              variant="success"
              size="md"
            >
              {isSaving ? UI_STRINGS.SAVING : UI_STRINGS.SAVE}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Alert variant="info" size="md" centered fullWidth>
            <span className="block text-2xl font-bold">{summary.total}</span>
            <span className="text-xs">Total Siswa</span>
          </Alert>
          <Alert variant="success" size="md" centered fullWidth>
            <span className="block text-2xl font-bold">{summary.present}</span>
            <span className="text-xs">Hadir</span>
          </Alert>
          <Alert variant="warning" size="md" centered fullWidth>
            <span className="block text-2xl font-bold">{summary.sick}</span>
            <span className="text-xs">Sakit</span>
          </Alert>
          <Alert variant="neutral" size="md" centered fullWidth>
            <span className="block text-2xl font-bold">{summary.total}</span>
            <span className="text-xs">Total Siswa</span>
          </Alert>
          <Alert variant="error" size="md" centered fullWidth>
            <span className="block text-2xl font-bold">{summary.absent}</span>
            <span className="text-xs">Alpa</span>
          </Alert>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <TableSkeleton rows={20} cols={6} />
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
              <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-3 sticky left-0 bg-neutral-50 dark:bg-neutral-700 z-10">NIS</th>
                  <th className="px-6 py-3 sticky left-16 bg-neutral-50 dark:bg-neutral-700 z-10">Nama Siswa</th>
                  <th className="px-6 py-3">Status Kehadiran</th>
                  <th className="px-6 py-3">Catatan</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 ${
                        student.isEdited ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-3 font-mono text-xs sticky left-0 bg-white dark:bg-neutral-800 z-0">
                        {student.nis}
                      </td>
                      <td className="px-6 py-3 sticky left-16 bg-white dark:bg-neutral-800 z-0 font-medium">
                        {student.name}
                      </td>
                      <td className="px-6 py-3">
                        <select
                          value={student.status}
                          onChange={(e) => {
                            const updated = students.map(s =>
                              s.id === student.id
                                ? { ...s, status: e.target.value as typeof student.status, isEdited: true }
                                : s
                            );
                            setStudents(updated);
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 ${statusColors[student.status]}`}
                        >
                          <option value="hadir">Hadir</option>
                          <option value="sakit">Sakit</option>
                          <option value="izin">Izin</option>
                          <option value="alpa">Alpa</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={student.notes || ''}
                          onChange={(e) => {
                            const updated = students.map(s =>
                              s.id === student.id
                                ? { ...s, notes: e.target.value, isEdited: true }
                                : s
                            );
                            setStudents(updated);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Tambah catatan..."
                          className="w-full px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        {student.isEdited && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mr-2">
                            ⚠ Perlu Verifikasi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-neutral-400 dark:text-neutral-500">
                        Tidak ada siswa yang cocok dengan pencarian "{searchTerm}"
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OCR Processing Modal */}
      {showOCRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {showOCRReview ? 'Review Hasil OCR' : 'Memproses OCR'}
            </h3>
            
            {!showOCRReview && isOCRProcessing && (
              <div className="space-y-4">
                <ProgressBar
                  value={ocrProgress.progress}
                  label={ocrProgress.status}
                  variant="default"
                  color="primary"
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                  Tahap: {
                    ocrProgress.stage === 'initializing' ? 'Menginisialisasi...' :
                    ocrProgress.stage === 'extracting' ? 'Mengekstrak teks...' :
                    ocrProgress.stage === 'parsing' ? 'Menganalisis pola...' :
                    ocrProgress.stage === 'analyzing' ? 'Memvalidasi...' :
                    'Menyelesaikan...'
                  }
                </p>
              </div>
            )}

            {showOCRReview && ocrResult && (
              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      Tanggal: {ocrResult.date}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {ocrResult.studentAttendance.length} siswa terdeteksi
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center">
                      <span className="block text-xl font-bold text-green-600">
                        {ocrResult.summary?.present || 0}
                      </span>
                      <span className="text-xs text-neutral-500">Hadir</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xl font-bold text-yellow-600">
                        {ocrResult.summary?.sick || 0}
                      </span>
                      <span className="text-xs text-neutral-500">Sakit</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xl font-bold text-blue-600">
                        {ocrResult.summary?.permission || 0}
                      </span>
                      <span className="text-xs text-neutral-500">Izin</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xl font-bold text-red-600">
                        {ocrResult.summary?.absent || 0}
                      </span>
                      <span className="text-xs text-neutral-500">Alpa</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowOCRModal(false);
                      setOcrResult(null);
                      setShowOCRReview(false);
                    }}
                    variant="secondary"
                    size="md"
                    fullWidth
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={applyOCRResults}
                    variant="success"
                    size="md"
                    fullWidth
                  >
                    Terapkan Hasil
                  </Button>
                </div>
              </div>
            )}

            {!showOCRReview && !isOCRProcessing && (
              <div className="text-center space-y-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  OCR selesai tapi gagal memproses data.
                </p>
                <Button
                  onClick={() => {
                    setShowOCRModal(false);
                    setOcrResult(null);
                  }}
                  variant="primary"
                  size="md"
                >
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
