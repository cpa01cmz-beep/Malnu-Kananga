
import React from 'react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProgressBar from '../ui/ProgressBar';
import { HEIGHT_CLASSES } from '../../config/heights';
import { STORAGE_KEYS } from '../../constants';
import { createToastHandler } from '../../utils/teacherErrorHandler';
import { SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '../../utils/errorMessages';
import type { OCRReviewData } from './useGradingData';

export interface OCRPanelProps {
  showOCRModal: boolean;
  isOCRProcessing: boolean;
  ocrProgress: { status: string; progress: number };
  ocrReviewData: OCRReviewData | null;
  grades: Array<{ id: string; name: string; nis: string; assignment: number; midExam: number; finalExam: number }>;
  authUser: { name?: string } | null;
  setShowOCRModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOcrReviewData: React.Dispatch<React.SetStateAction<OCRReviewData | null>>;
  setOcrResult: React.Dispatch<React.SetStateAction<any>>;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  setGrades: React.Dispatch<React.SetStateAction<Array<{
    id: string; name: string; nis: string; assignment: number; midExam: number; finalExam: number;
  }>>>;
}

const OCRPanel: React.FC<OCRPanelProps> = ({
  showOCRModal,
  isOCRProcessing,
  ocrProgress,
  ocrReviewData,
  grades,
  authUser,
  setShowOCRModal,
  setOcrReviewData,
  setOcrResult,
  onShowToast,
  setGrades,
}) => {
  const toast = createToastHandler(onShowToast);

  const confirmOCRGrades = () => {
    if (!ocrReviewData) return;

    const { studentId, assignment, midExam, finalExam } = ocrReviewData;

    if (studentId) {
      const updatedGrades = grades.map(g =>
        g.id === studentId
          ? { ...g, assignment: assignment || g.assignment, midExam: midExam || g.midExam, finalExam: finalExam || g.finalExam }
          : g
      );
      setGrades(updatedGrades);
      const studentName = grades.find(g => g.id === studentId)?.name || 'Siswa';
      toast.success(SUCCESS_MESSAGES.GRADE_OCR_SUCCESS(studentName));
    } else {
      toast.warning(VALIDATION_MESSAGES.STUDENT_NAME_REQUIRED + '. Silakan periksa kembali data yang diekstrak.');
    }

    const auditEntry = {
      timestamp: new Date().toISOString(),
      teacher: authUser?.name || 'Unknown',
      confidence: ocrReviewData.confidence,
      extractedData: ocrReviewData,
      action: 'ocr_grade_extraction'
    };

    const existingAudit = JSON.parse(localStorage.getItem(STORAGE_KEYS.OCR_AUDIT) || '[]');
    existingAudit.push(auditEntry);
    localStorage.setItem(STORAGE_KEYS.OCR_AUDIT, JSON.stringify(existingAudit));

    setShowOCRModal(false);
    setOcrReviewData(null);
    setOcrResult(null);
  };

  const cancelOCRReview = () => {
    setShowOCRModal(false);
    setOcrReviewData(null);
    setOcrResult(null);
  };

  if (!showOCRModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-4xl ${HEIGHT_CLASSES.MODAL.FULL} overflow-y-auto`}>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          📷 OCR Grade Extraction
        </h3>

        {isOCRProcessing && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text={ocrProgress.status} />
            <div className="mt-4">
              <ProgressBar
                value={ocrProgress.progress}
                size="md"
                color="purple"
                aria-label={`OCR processing: ${ocrProgress.progress.toFixed(0)}%`}
              />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              {ocrProgress.progress.toFixed(0)}% Complete
            </p>
          </div>
        )}

        {!isOCRProcessing && ocrReviewData && (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">OCR Result Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Confidence:</span>
                  <span className="ml-2 font-medium">{ocrReviewData.confidence.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Extracted Text Length:</span>
                  <span className="ml-2 font-medium">{ocrReviewData.extractedText.length} chars</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Extracted Grades</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tugas (30%)</label>
                  <input
                    type="number"
                    value={ocrReviewData.assignment || ''}
                    onChange={(e) => setOcrReviewData({
                      ...ocrReviewData,
                      assignment: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">UTS (30%)</label>
                  <input
                    type="number"
                    value={ocrReviewData.midExam || ''}
                    onChange={(e) => setOcrReviewData({
                      ...ocrReviewData,
                      midExam: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">UAS (40%)</label>
                  <input
                    type="number"
                    value={ocrReviewData.finalExam || ''}
                    onChange={(e) => setOcrReviewData({
                      ...ocrReviewData,
                      finalExam: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {ocrReviewData.studentId ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">✓ Student Found</h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {grades.find(g => g.id === ocrReviewData.studentId)?.name}
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">⚠️ Student Not Found</h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  Please select student or check extracted data
                </p>
                <select
                  value={ocrReviewData.studentId || ''}
                  onChange={(e) => setOcrReviewData({
                    ...ocrReviewData,
                    studentId: e.target.value || undefined
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Student</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name} ({grade.nis})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Raw OCR Text</h4>
              <div className="max-h-32 overflow-y-auto text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 p-2 rounded border">
                {ocrReviewData.extractedText}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelOCRReview}
                className="px-6 py-2 bg-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-400 transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="purple-solid"
                size="md"
                onClick={confirmOCRGrades}
                disabled={!ocrReviewData.studentId || !ocrReviewData.assignment}
              >
                Apply Grades
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRPanel;
