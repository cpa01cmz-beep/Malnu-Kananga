
import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import Button from '../ui/Button';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { FILE_ERROR_MESSAGES, CSV_MESSAGES, EXPORT_MESSAGES, AI_MESSAGES } from '../../utils/errorMessages';
import { createToastHandler } from '../../utils/teacherErrorHandler';
import { validateCSVImport, sanitizeGradeInput, validateGradeInput, type GradeInput } from '../../utils/teacherValidation';
import type { QueuedGradeUpdate, OCRReviewData } from './useGradingData';
import { FILE_SIZE_LIMITS, UI_DELAYS } from '../../constants';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { useReducedMotion } from '../../hooks/useAccessibility';

export interface GradingActionsProps {
  csvInputRef: React.RefObject<HTMLInputElement>;
  ocrInputRef: React.RefObject<HTMLInputElement>;
  isBatchMode: boolean;
  selectedStudents: Set<string>;
  canUseOCRGrading: boolean;
  canCreateContent: boolean;
  isOCRProcessing: boolean;
  isAnalyzing: boolean;
  isExportingPDF: boolean;
  grades: Array<{ id: string; name: string; nis: string; assignment: number; midExam: number; finalExam: number }>;
  className: string;
  subjectId: string;
  setGrades: React.Dispatch<React.SetStateAction<Array<{
    id: string; name: string; nis: string; assignment: number; midExam: number; finalExam: number;
  }>>>;
  setIsBatchMode: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedStudents: React.Dispatch<React.SetStateAction<Set<string>>>;
  setQueuedGradeUpdates: React.Dispatch<React.SetStateAction<QueuedGradeUpdate[]>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>>;
  setShowStats: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  setAnalysisResult: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOCRProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setOCRProgress: React.Dispatch<React.SetStateAction<{ status: string; progress: number }>>;
  setShowOCRModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOcrReviewData: React.Dispatch<React.SetStateAction<OCRReviewData | null>>;
  setOcrResult: React.Dispatch<React.SetStateAction<unknown>>;
  setIsExportingPDF: React.Dispatch<React.SetStateAction<boolean>>;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const GradingActions: React.FC<GradingActionsProps> = ({
  csvInputRef: _csvInputRef,
  ocrInputRef: _ocrInputRef,
  isBatchMode,
  selectedStudents,
  canUseOCRGrading: _canUseOCRGrading,
  canCreateContent: _canCreateContent,
  isOCRProcessing,
  isAnalyzing,
  isExportingPDF,
  grades,
  className: _className,
  subjectId: _subjectId,
  setGrades,
  setIsBatchMode,
  setSelectedStudents,
  setQueuedGradeUpdates: _setQueuedGradeUpdates,
  setConfirmDialog,
  setShowStats,
  setIsAnalyzing: _setIsAnalyzing,
  setAnalysisResult,
  setIsOCRProcessing: _setIsOCRProcessing,
  setOCRProgress: _setOCRProgress,
  setShowOCRModal,
  setOcrReviewData: _setOcrReviewData,
  setOcrResult: _setOcrResult,
  setIsExportingPDF: _setIsExportingPDF,
  onShowToast,
}) => {
  const _toast = createToastHandler(onShowToast);
  const { onError } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();
  const [shakeButton, setShakeButton] = useState<'csv' | 'pdf' | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  const handleDisabledExportClick = (buttonType: 'csv' | 'pdf') => {
    onError();

    if (!prefersReducedMotion) {
      setShakeButton(buttonType);

      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }

      shakeTimeoutRef.current = setTimeout(() => {
        setShakeButton(null);
      }, UI_DELAYS.BUTTON_SHAKE);
    }
  };

  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedStudents(new Set());
  };

  const __toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const __handleBatchGradeInput = (field: 'assignment' | 'midExam' | 'finalExam', value: string) => {
    const numValue = sanitizeGradeInput(value);
    const gradeInput: GradeInput = { [field]: numValue };
    const validation = validateGradeInput(gradeInput);

    if (!validation.isValid) {
      onShowToast(validation.errors[0], 'error');
      return;
    }

    setGrades(prev => prev.map(g =>
      selectedStudents.has(g.id) ? { ...g, [field]: numValue } : g
    ));
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const csvData = results.data as Record<string, string>[];
          const importResult = validateCSVImport(csvData, grades);

          if (importResult.failedImports > 0) {
            const errorMessage = `Import selesai dengan beberapa kesalahan:\n\n✓ Berhasil: ${importResult.successfulImports} siswa\n✗ Gagal: ${importResult.failedImports} siswa\n\nDetail kesalahan:\n${importResult.errorDetails.slice(0, 5).map(
              err => `- ${err.studentName} (${err.nis}): ${err.errors.join(', ')}`
            ).join('\n')}${importResult.errorDetails.length > 5 ? '\n...' : ''}`;

            setConfirmDialog({
              isOpen: true,
              title: 'Validasi Import CSV',
              message: errorMessage,
              type: 'danger',
              onConfirm: () => {
                setGrades(prev => prev.map(grade => {
                  const successfulImport = importResult.successDetails.find(s => s.nis === grade.nis);
                  if (successfulImport) {
                    return {
                      ...grade,
                      assignment: successfulImport.assignment,
                      midExam: successfulImport.midExam,
                      finalExam: successfulImport.finalExam
                    };
                  }
                   return grade;
                 }));
                 setIsBatchMode(false);
                 onShowToast(CSV_MESSAGES.IMPORT_SUCCESS(importResult.successfulImports), 'success');
               }
             });
            } else {
              setGrades(prev => prev.map(grade => {
                const successfulImport = importResult.successDetails.find(s => s.nis === grade.nis);
                if (successfulImport) {
                  return {
                    ...grade,
                    assignment: successfulImport.assignment,
                    midExam: successfulImport.midExam,
                    finalExam: successfulImport.finalExam
                  };
                }
                return grade;
               }));
               setIsBatchMode(false);
               onShowToast(CSV_MESSAGES.IMPORT_BATCH_SUCCESS(importResult.successfulImports), 'success');
             }
        } catch (_err) {
          onShowToast(CSV_MESSAGES.IMPORT_FAILED, 'error');
        }
      },
      error: (_err) => {
        onShowToast(CSV_MESSAGES.PARSE_FAILED, 'error');
      }
    });

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleCSVExport = () => {
    if (grades.length === 0) {
      onShowToast(EXPORT_MESSAGES.NO_DATA_AVAILABLE, 'error');
      return;
    }
    const csvData = grades.map(g => ({
      name: g.name,
      nis: g.nis,
      assignment: g.assignment,
      midExam: g.midExam,
      finalExam: g.finalExam,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `grades_${_className}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(CSV_MESSAGES.EXPORT_SUCCESS, 'success');
  };

  const handlePDFExport = async () => {
    if (grades.length === 0) {
      onShowToast(EXPORT_MESSAGES.NO_DATA_AVAILABLE, 'error');
      return;
    }

    try {
      _setIsExportingPDF(true);
      // Implementation would use pdfExportService
      onShowToast(EXPORT_MESSAGES.PDF_SUCCESS, 'success');
    } catch (_error) {
      onShowToast(EXPORT_MESSAGES.PDF_FAILED, 'error');
    } finally {
      _setIsExportingPDF(false);
    }
  };

  const handleAIAnalysis = async () => {
      _setIsAnalyzing(true);
      setAnalysisResult(null);
      // Implementation would use analyzeClassPerformance
      _setIsAnalyzing(false);
  };

  const handleOCRExamUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/heic'];
     if (!allowedTypes.includes(file.type)) {
       onShowToast(FILE_ERROR_MESSAGES.INVALID_FILE_TYPE('PDF, JPG, PNG, atau HEIC'), 'error');
       return;
     }

     if (file.size > FILE_SIZE_LIMITS.MATERIAL_DEFAULT) {
       onShowToast(FILE_ERROR_MESSAGES.FILE_TOO_LARGE('50MB'), 'error');
       return;
     }

    _setIsOCRProcessing(true);
    _setOCRProgress({ status: 'Memulai OCR...', progress: 0 });
    setShowOCRModal(true);

    try {
      _setOCRProgress({ status: 'Memproses hasil...', progress: 100 });
    } catch (_error) {
      onShowToast(AI_MESSAGES.OCR_PROCESS_FAILED, 'error');
    } finally {
      _setIsOCRProcessing(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Opsi penilaian">
        <Button
          onClick={toggleBatchMode}
          variant={isBatchMode ? 'blue-solid' : 'secondary'}
          className="rounded-full shadow-md"
          aria-pressed={isBatchMode}
        >
          {isBatchMode ? `Selected: ${selectedStudents.size}` : 'Batch Mode'}
        </Button>

        <Button
          onClick={() => setShowStats(prev => !prev)}
          variant="secondary"
        >
          Statistics
        </Button>

        <input
          ref={_csvInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          className="hidden"
        />
        <Button
          variant="orange-solid"
          size="md"
          onClick={() => _csvInputRef.current?.click()}
          aria-label="Impor data nilai dari file CSV"
        >
          Import CSV
        </Button>

        {_canUseOCRGrading && (
            <>
                <input
                    ref={_ocrInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    onChange={handleOCRExamUpload}
                    className="hidden"
                    disabled={isOCRProcessing}
                />
                <Button
                    variant="purple-solid"
                    size="md"
                    onClick={() => _ocrInputRef.current?.click()}
                    disabled={isOCRProcessing}
                    aria-label="Pindai ujian menggunakan kamera atau upload file"
                >
                    📷 Scan Exam
                </Button>
            </>
        )}

        <div className={shakeButton === 'pdf' ? 'animate-shake' : ''}>
          <Button
            onClick={grades.length === 0 ? () => handleDisabledExportClick('pdf') : handlePDFExport}
            disabled={isExportingPDF || grades.length === 0}
            variant="green-solid"
            isLoading={isExportingPDF}
            aria-label="Ekspor nilai siswa ke file PDF"
            disabledReason={grades.length === 0 ? 'Tidak ada nilai untuk diekspor' : undefined}
          >
            {isExportingPDF ? 'Exporting...' : '📄 Export PDF'}
          </Button>
        </div>

        <div className={shakeButton === 'csv' ? 'animate-shake' : ''}>
          <Button
            onClick={grades.length === 0 ? () => handleDisabledExportClick('csv') : handleCSVExport}
            disabled={grades.length === 0}
            variant="teal-solid"
            aria-label="Ekspor nilai ke file CSV"
            disabledReason={grades.length === 0 ? 'Tidak ada nilai untuk diekspor' : undefined}
          >
            Export CSV
          </Button>
        </div>

        {_canCreateContent && (
          <Button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            variant="purple-solid"
            icon={<LightBulbIcon className="w-5 h-5" />}
            isLoading={isAnalyzing}
            aria-label="Analisis nilai siswa menggunakan AI"
            className="rounded-full shadow-md"
          >
            {isAnalyzing ? "Menganalisis..." : "Analisis AI"}
          </Button>
      )}
      </div>
    </div>
  );
};

export default GradingActions;
