
import React, { useEffect } from 'react';
import { permissionService } from '../../services/permissionService';
import { useEventNotifications } from '../../hooks/useEventNotifications';
import { OfflineIndicator } from '../OfflineIndicator';
import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import { TableSkeleton } from '../ui/Skeleton';
import AccessDenied from '../AccessDenied';
import { User, UserRole, UserExtraRole } from '../../types';
import ErrorMessage from '../ui/ErrorMessage';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import LoadingSpinner from '../ui/LoadingSpinner';
import FieldVoiceInput from '../FieldVoiceInput';
import { VoiceLanguage } from '../../types';
import { logger } from '../../utils/logger';
import { createToastHandler } from '../../utils/teacherErrorHandler';
import { STORAGE_KEYS } from '../../constants';
import { validateGradeInput, validateClassCompletion } from '../../utils/teacherValidation';
import { VALIDATION_MESSAGES } from '../../utils/errorMessages';
import { useGradingData, type StudentGrade, type OCRReviewData } from './useGradingData';
import GradingStats from './GradingStats';
import GradingList from './GradingList';
import AIPanel from './AIPanel';
import OCRPanel from './OCRPanel';
import { calculateFinalGrade } from '../../utils/teacherValidation';

export interface GradingManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const GradingManagement: React.FC<GradingManagementProps> = ({ onBack, onShowToast }) => {
  const _csvInputRef = React.useRef<HTMLInputElement>(null);
  const _ocrInputRef = React.useRef<HTMLInputElement>(null);
  const { notifyGradeUpdate, useMonitorLocalStorage } = useEventNotifications();

  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;

  const canManageGrades = permissionService.hasPermission(userRole, userExtraRole, 'academic.grades').granted;
  const _canCreateContent = permissionService.hasPermission(userRole, userExtraRole, 'content.create').granted;
  const _canUseOCRGrading = permissionService.hasPermission(userRole, userExtraRole, 'academic.grades').granted &&
    ['teacher', 'wakasek'].includes(userRole);

  const className = 'XII IPA 1';
  const subjectId = 'Matematika Wajib';

  const {
    grades,
    setGrades,
    loading,
    error,
    hasUnsavedChanges: _hasUnsavedChanges,
    setHasUnsavedChanges: _setHasUnsavedChanges,
    isEditing: _isEditing,
    setIsEditing: _setIsEditing,
    selectedStudents,
    setSelectedStudents,
    isBatchMode: _isBatchMode,
    setIsBatchMode: _setIsBatchMode,
    showStats: _showStats,
    setShowStats: _setShowStats,
    isAutoSaving,
    isSaving: _isSaving,
    setIsSaving: _setIsSaving,
    inlineErrors,
    setInlineErrors: _setInlineErrors,
    gradeHistory: _gradeHistory,
    setGradeHistory: _setGradeHistory,
    handleInputChange,
    toggleStudentSelection,
    handleBatchGradeInput,
    doBatchSave,
  } = useGradingData(className, subjectId, authUser, onShowToast);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAnalyzing, _setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<string | null>(null);
  const [isOCRProcessing, _setIsOCRProcessing] = React.useState(false);
  const [ocrProgress, _setOCRProgress] = React.useState<{ status: string; progress: number }>({ status: '', progress: 0 });
  const [_ocrResult, setOcrResult] = React.useState<unknown>(null);
  const [showOCRModal, setShowOCRModal] = React.useState(false);
  const [ocrReviewData, setOcrReviewData] = React.useState<OCRReviewData | null>(null);
  const [_isExportingPDF, _setIsExportingPDF] = React.useState(false);

  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const [resetDialog, setResetDialog] = React.useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
  }>({
    isOpen: false,
    studentId: '',
    studentName: ''
  });

  const toast = createToastHandler(onShowToast);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.GRADE_HISTORY);
      if (savedHistory) {
        _setGradeHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      logger.error('Failed to load grade history from localStorage:', error);
    }
  }, [_setGradeHistory]);

  useMonitorLocalStorage(STORAGE_KEYS.GRADES, (newValue, oldValue) => {
    if (oldValue && typeof oldValue === 'object' && newValue && typeof newValue === 'object') {
      const oldGrades = Array.isArray(oldValue) ? oldValue : [];
      const newGrades = Array.isArray(newValue) ? newValue : [];

      newGrades.forEach(newGrade => {
        const oldGrade = oldGrades.find((g: StudentGrade) => g.id === newGrade.id);
        if (oldGrade) {
          const oldFinal = calculateFinalGrade(oldGrade.assignment, oldGrade.midExam, oldGrade.finalExam);
          const newFinal = calculateFinalGrade(newGrade.assignment, newGrade.midExam, newGrade.finalExam);

          if (oldFinal !== newFinal) {
            notifyGradeUpdate(newGrade.name, subjectId, oldFinal, newFinal);
          }
        }
      });
    }
  });

  if (!canManageGrades) {
    return <AccessDenied onBack={onBack} message="You don't have permission to manage grades" requiredPermission="academic.grades" />;
  }

  const filteredData = grades.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.nis.includes(searchTerm)
  );

  const handleSave = async () => {
    const classValidation = validateClassCompletion(grades);

    if (!classValidation.isValid && classValidation.studentsWithoutGrades > 0) {
      setConfirmDialog({
        isOpen: true,
        title: 'Peringatan: Kelas Belum Lengkap',
        message: `${classValidation.warnings.join('\n\n')}\n\nApakah Anda ingin menyimpan tetap? Siswa tanpa nilai akan mendapat nilai 0.`,
        type: 'warning',
        onConfirm: () => doIndividualGradeValidationAndSave()
      });
      return;
    }

    doIndividualGradeValidationAndSave();
  };

  const doIndividualGradeValidationAndSave = () => {
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    let hasErrors = false;

    grades.forEach((grade, index) => {
      const validation = validateGradeInput({
        assignment: grade.assignment,
        midExam: grade.midExam,
        finalExam: grade.finalExam
      });

      if (!validation.isValid) {
        hasErrors = true;
        validationErrors.push(`${grade.name || `Siswa ${index + 1}`}: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        validationWarnings.push(`${grade.name || `Siswa ${index + 1}`}: ${validation.warnings.join(', ')}`);
      }
    });

     if (hasErrors) {
       setConfirmDialog({
         isOpen: true,
         title: 'Validasi Gagal',
         message: `${VALIDATION_MESSAGES.CLASS_INCOMPLETE}\n\n${validationErrors.join('\n')}\n\nPerbaiki kesalahan tersebut sebelum menyimpan.`,
         type: 'danger',
         onConfirm: () => {}
       });
       return;
     }

     const confirmMessage = validationWarnings.length > 0
       ? `Akan menyimpan nilai untuk ${grades.length} siswa.\n\nPeringatan:\n${validationWarnings.join('\n')}\n\nLanjutkan penyimpanan?`
       : `Akan menyimpan nilai untuk ${grades.length} siswa. Lanjutkan?`;

     setConfirmDialog({
       isOpen: true,
       title: 'Konfirmasi Penyimpanan',
       message: confirmMessage,
       type: 'warning',
       onConfirm: () => doBatchSave()
     });
  };

  return (
    <div className="animate-fade-in-up">
      <OfflineIndicator
        showSyncButton={true}
        showQueueCount={true}
        position="top-right"
      />

      {error && (
        <ErrorMessage
          message={error}
          variant="card"
          className="mb-4"
        />
      )}

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            ← Kembali ke Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Input Nilai Siswa
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Mata Pelajaran: <strong>{subjectId} ({className})</strong>
            {_hasUnsavedChanges && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                • Ada perubahan belum disimpan
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <SearchInput
            placeholder="Cari Nama / NIS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
            className="w-full md:w-64"
          />

          {isAutoSaving && (
            <LoadingSpinner size="sm" color="neutral" text="Auto-saving..." />
          )}
        </div>
      </div>

       {_showStats && !loading && !error && (
        <GradingStats grades={grades} />
      )}

      {_isBatchMode && (
        <BatchOperations
          selectedStudents={selectedStudents}
          grades={grades}
          toggleStudentSelection={toggleStudentSelection}
          handleBatchGradeInput={handleBatchGradeInput}
          setSelectedStudents={setSelectedStudents}
        />
      )}

      {analysisResult && (
        <AIPanel
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          setAnalysisResult={setAnalysisResult}
        />
      )}

      {loading && (
        <TableSkeleton rows={10} cols={6} />
      )}

      {!loading && !error && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Info Pembobotan:</strong> Tugas (30%) + UTS (30%) + UAS (40%). Nilai Akhir dan Predikat dihitung otomatis.
          </p>
        </div>
      )}

      {!loading && !error && (
        <GradingList
          grades={filteredData}
          isBatchMode={_isBatchMode}
          isEditing={_isEditing}
          selectedStudents={selectedStudents}
          inlineErrors={inlineErrors}
          onGradeEdit={handleInputChange}
          onReset={(id, _name) => {
            setGrades(prev => prev.map(g => g.id === id ? {
              ...g,
              assignment: 0,
              midExam: 0,
              finalExam: 0
            } : g));
            toast.info('Nilai direset');
            setResetDialog({ isOpen: false, studentId: '', studentName: '' });
          }}
          toggleStudentSelection={toggleStudentSelection}
          setResetDialog={setResetDialog}
        />
      )}

      {!loading && !error && (
        <div className="flex justify-end mt-6">
          <Button
            variant="green-solid"
            size="md"
            onClick={handleSave}
            disabled={loading || _isSaving}
          >
            {loading || _isSaving ? "Menyimpan..." : "Simpan Semua Nilai"}
          </Button>
        </div>
      )}

      <OCRPanel
        showOCRModal={showOCRModal}
        isOCRProcessing={isOCRProcessing}
        ocrProgress={ocrProgress}
        ocrReviewData={ocrReviewData}
        grades={grades}
        authUser={authUser}
        setShowOCRModal={setShowOCRModal}
        setOcrReviewData={setOcrReviewData}
        setOcrResult={setOcrResult}
        onShowToast={onShowToast}
        setGrades={setGrades}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        isLoading={_isSaving}
        confirmText="Ya, Simpan"
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
      />

      <ConfirmationDialog
        isOpen={resetDialog.isOpen}
        title="Konfirmasi Reset Nilai"
        message={`Reset nilai ${resetDialog.studentName} ke 0?\n\nSemua nilai (tugas, UTS, UAS) akan direset.`}
        type="warning"
        confirmText="Ya, Reset"
        cancelText="Batal"
        onConfirm={() => {
          setGrades(prev => prev.map(g => g.id === resetDialog.studentId ? {
            ...g,
            assignment: 0,
            midExam: 0,
            finalExam: 0
          } : g));
          toast.info('Nilai direset');
          setResetDialog({ isOpen: false, studentId: '', studentName: '' });
        }}
        onCancel={() => setResetDialog({ isOpen: false, studentId: '', studentName: '' })}
      />
    </div>
  );
};

export default GradingManagement;

// BatchOperations sub-component
export interface BatchOperationsProps {
  selectedStudents: Set<string>;
  grades: Array<{
    id: string;
    name: string;
    nis: string;
    assignment: number;
    midExam: number;
    finalExam: number;
  }>;
  toggleStudentSelection: (id: string) => void;
  handleBatchGradeInput: (field: 'assignment' | 'midExam' | 'finalExam', value: string) => void;
  setSelectedStudents: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedStudents,
  grades,
  toggleStudentSelection: _toggleStudentSelection,
  handleBatchGradeInput,
  setSelectedStudents,
}) => {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6 flex gap-3 flex-wrap items-center">
      <span className="font-medium text-yellow-800 dark:text-yellow-300">
        Batch Operations ({selectedStudents.size} selected):
      </span>

      <div className="flex items-center gap-1">
        <input
          type="number"
          id="batch-assignment-input"
          placeholder="Assignment"
          min="0"
          max="100"
          aria-label="Nilai Assignment untuk batch"
          onChange={(e) => handleBatchGradeInput('assignment', e.target.value)}
          className="w-24 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500"
        />
        <FieldVoiceInput
          fieldName="batch-assignment"
          fieldLabel="Nilai Tugas Batch"
          fieldType={{ type: 'number' }}
          onValueChange={(value) => handleBatchGradeInput('assignment', value)}
          language={VoiceLanguage.Indonesian}
          compact={true}
          showFeedback={false}
        />
      </div>

      <div className="flex items-center gap-1">
        <input
          type="number"
          id="batch-uts-input"
          placeholder="UTS"
          min="0"
          max="100"
          aria-label="Nilai UTS untuk batch"
          onChange={(e) => handleBatchGradeInput('midExam', e.target.value)}
          className="w-24 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500"
        />
        <FieldVoiceInput
          fieldName="batch-uts"
          fieldLabel="Nilai UTS Batch"
          fieldType={{ type: 'number' }}
          onValueChange={(value) => handleBatchGradeInput('midExam', value)}
          language={VoiceLanguage.Indonesian}
          compact={true}
          showFeedback={false}
        />
      </div>

      <div className="flex items-center gap-1">
        <input
          type="number"
          id="batch-uas-input"
          placeholder="UAS"
          min="0"
          max="100"
          aria-label="Nilai UAS untuk batch"
          onChange={(e) => handleBatchGradeInput('finalExam', e.target.value)}
          className="w-24 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500"
        />
        <FieldVoiceInput
          fieldName="batch-uas"
          fieldLabel="Nilai UAS Batch"
          fieldType={{ type: 'number' }}
          onValueChange={(value) => handleBatchGradeInput('finalExam', value)}
          language={VoiceLanguage.Indonesian}
          compact={true}
          showFeedback={false}
        />
      </div>

      <Button
        variant="blue-solid"
        size="sm"
        onClick={() => setSelectedStudents(new Set(grades.map(g => g.id)))}
      >
        Select All
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setSelectedStudents(new Set())}
      >
        Clear Selection
      </Button>
    </div>
  );
};
