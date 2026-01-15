
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import React from 'react';
import Papa from 'papaparse';
import { analyzeClassPerformance } from '../services/geminiService';
import { studentsAPI, gradesAPI } from '../services/apiService';
import { permissionService } from '../services/permissionService';
import { unifiedNotificationManager } from '../services/unifiedNotificationManager';
import { ocrService, OCRExtractionResult, OCRProgress } from '../services/ocrService';
import { useEventNotifications } from '../hooks/useEventNotifications';
import { LightBulbIcon } from './icons/LightBulbIcon';
import MarkdownRenderer from './MarkdownRenderer';
import { logger } from '../utils/logger';
import { useNetworkStatus, getOfflineMessage, getSlowConnectionMessage } from '../utils/networkStatus';
import { useOfflineActionQueue, type SyncResult } from '../services/offlineActionQueueService';
import { STORAGE_KEYS } from '../constants';
import { pdfExportService } from '../services/pdfExportService';
import ProgressBar from './ui/ProgressBar';
import { DEFAULT_API_BASE_URL } from '../config/api';
import { HEIGHT_CLASSES } from '../config/heights';
import {
  validateGradeInput,
  sanitizeGradeInput,
  calculateGradeLetter,
  calculateFinalGrade,
  GradeInput
} from '../utils/teacherValidation';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { createToastHandler } from '../utils/teacherErrorHandler';
import LoadingSpinner from './ui/LoadingSpinner';
import Button from './ui/Button';
import { TableSkeleton } from './ui/Skeleton';
import AccessDenied from './AccessDenied';
import { User, UserRole, UserExtraRole } from '../types';
import ErrorMessage from './ui/ErrorMessage';
import { OfflineIndicator } from './OfflineIndicator';
import SearchInput from './ui/SearchInput';


interface StudentGrade {
  id: string;
  name: string;
  nis: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

interface GradingManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const GradingManagement: React.FC<GradingManagementProps> = ({ onBack, onShowToast }) => {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  // Event notifications hook
  const { notifyGradeUpdate, useMonitorLocalStorage } = useEventNotifications();
  
  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;

  // Check permissions
  const canManageGrades = permissionService.hasPermission(userRole, userExtraRole, 'academic.grades').granted;
  const canCreateContent = permissionService.hasPermission(userRole, userExtraRole, 'content.create').granted;
  const canUseOCRGrading = permissionService.hasPermission(userRole, userExtraRole, 'academic.grades').granted && 
    ['teacher', 'wakasek'].includes(userRole);

  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [queuedGradeUpdates, setQueuedGradeUpdates] = useState<{
    studentId: string;
    classId: string;
    subjectId: string;
    assignment: number;
    midExam: number;
    finalExam: number;
    timestamp: string;
  }[]>([]);

  const { isOnline, isSlow } = useNetworkStatus();
  const { 
    sync,
    addAction,
    onSyncComplete 
  } = useOfflineActionQueue();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // OCR State
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrProgress, setOCRProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [_ocrResult, setOcrResult] = useState<OCRExtractionResult | null>(null);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrReviewData, setOcrReviewData] = useState<{
    studentId?: string;
    assignment?: number;
    midExam?: number;
    finalExam?: number;
    extractedText: string;
    confidence: number;
  } | null>(null);

  // Enhanced Grading State
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
// Configuration
  const className = 'XII IPA 1';
  const subjectId = 'Matematika Wajib';

  // Validation and Error Handling State
  const [isSaving, _setIsSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
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

  // Confirmation Dialog State (removed unused variables)

  // Grade Reset Confirmation State
  const [resetDialog, setResetDialog] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
  }>({
    isOpen: false,
    studentId: '',
    studentName: ''
  });

  const toast = createToastHandler(onShowToast);
  const fetchStudentsAndGrades = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isOnline) {
      // Try to load cached data when offline
      const cachedGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
      if (cachedGrades) {
        try {
          const parsedGrades = JSON.parse(cachedGrades);
          setGrades(parsedGrades);
          setError(getOfflineMessage());
          onShowToast('Data nilai dari cache. Perubahan akan disinkronkan saat online.', 'info');
        } catch {
          setError(getOfflineMessage());
          onShowToast('Tidak ada data nilai tersimpan di cache.', 'error');
        }
      } else {
        setError(getOfflineMessage());
        onShowToast('Tidak ada data nilai tersimpan. Memerlukan koneksi internet.', 'error');
      }
      setLoading(false);
      return;
    }

    try {
      // Fetch students for the class
      const studentsResponse = await studentsAPI.getByClass(className);
      if (!studentsResponse.success || !studentsResponse.data) {
        throw new Error(studentsResponse.message || 'Failed to fetch students');
      }

      // Fetch existing grades for the class/subject
      const gradesResponse = await gradesAPI.getByClass(className);
      const existingGrades = gradesResponse.success && gradesResponse.data ? gradesResponse.data : [];

      // Transform students to StudentGrade format
      const studentGrades: StudentGrade[] = studentsResponse.data.map(student => {
        const existingGrade = existingGrades.find(grade => grade.studentId === student.id);
        return {
          id: student.id,
          name: student.className || `Student ${student.nis}`,
          nis: student.nis,
          assignment: existingGrade?.assignment || 0,
          midExam: existingGrade?.midExam || 0,
          finalExam: existingGrade?.finalExam || 0,
        };
      });

      setGrades(studentGrades);
      // Cache the grades for offline use
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(studentGrades));
      
      // Process any queued updates that were made while offline
      if (queuedGradeUpdates.length > 0) {
        onShowToast(`Memproses ${queuedGradeUpdates.length} perubahan yang tertunda...`, 'info');
        // Process queued updates here
        setQueuedGradeUpdates([]);
      }
    } catch {
      setError('Gagal memuat data nilai');
      onShowToast('Gagal memuat data siswa', 'error');
      
      // Try to load cached data as fallback
      const cachedGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
      if (cachedGrades) {
        try {
          const parsedGrades = JSON.parse(cachedGrades);
          setGrades(parsedGrades);
          setError('Menampilkan data dari cache. ' + getOfflineMessage());
        } catch {
          logger.error('Failed to parse cached grades');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [className, onShowToast, isOnline, queuedGradeUpdates.length]);

  useEffect(() => {
    fetchStudentsAndGrades();
  }, [fetchStudentsAndGrades]);

  // Show slow connection warning
  useEffect(() => {
    if (isSlow && isOnline) {
      onShowToast(getSlowConnectionMessage(), 'info');
    }
  }, [isSlow, isOnline, onShowToast]);

  // Sync queued changes when connection is restored
  useEffect(() => {
    if (isOnline && queuedGradeUpdates.length > 0) {
      onShowToast(`Menyinkronkan ${queuedGradeUpdates.length} perubahan nilai...`, 'success');
      setQueuedGradeUpdates([]);
      setHasUnsavedChanges(false);
    }
  }, [isOnline, queuedGradeUpdates.length, onShowToast]);

  // Listen for sync completion and update UI
  useEffect(() => {
    if (onSyncComplete) {
      return onSyncComplete((result: SyncResult) => {
        if (result.success && result.actionsProcessed > 0) {
          // Filter for grade-related actions
          const gradeActions = result.actionsProcessed; // We'll assume actionsProcessed includes grade actions
          if (gradeActions > 0) {
            onShowToast(`${gradeActions} nilai berhasil disinkronkan`, 'success');
            
            // Clear queued updates for synced actions
            setQueuedGradeUpdates(prev => 
              prev.slice(0, Math.max(0, prev.length - gradeActions))
            );
          }
        }
        
        if (result.actionsFailed > 0) {
          onShowToast(`${result.actionsFailed} nilai gagal disinkronkan`, 'error');
        }
      });
    }
  }, [onSyncComplete, onShowToast]);

  // Monitor grades localStorage for changes and trigger notifications
  useMonitorLocalStorage(STORAGE_KEYS.GRADES, (newValue, oldValue) => {
    // Trigger notifications when grades are updated by another component/tab
    if (oldValue && typeof oldValue === 'object' && newValue && typeof newValue === 'object') {
      // Compare and find updated grades
      const oldGrades = Array.isArray(oldValue) ? oldValue : [];
      const newGrades = Array.isArray(newValue) ? newValue : [];
      
      newGrades.forEach(newGrade => {
        const oldGrade = oldGrades.find((g: StudentGrade) => g.id === newGrade.id);
        if (oldGrade) {
          const oldFinal = calculateFinalGrade(oldGrade.assignment, oldGrade.midExam, oldGrade.finalExam);
          const newFinal = calculateFinalGrade(newGrade.assignment, newGrade.midExam, newGrade.finalExam);
          
          if (oldFinal !== newFinal) {
            // Grade was updated, trigger notification
            notifyGradeUpdate(newGrade.name, subjectId, oldFinal, newFinal);
          }
        }
      });
    }
  });

  // If user cannot manage grades, show access denied
  if (!canManageGrades) {
    return <AccessDenied onBack={onBack} message="You don't have permission to manage grades" requiredPermission="academic.grades" />;
  }

  const filteredData = grades.filter(g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nis.includes(searchTerm)
  );

  const handleInputChange = (id: string, field: keyof StudentGrade, value: string) => {
      const numValue = sanitizeGradeInput(value);
      const gradeInput: GradeInput = { [field]: numValue };
      const validation = validateGradeInput(gradeInput);
      
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
      
      if (validation.warnings.length > 0) {
        logger.warn('Validation warnings:', validation.warnings);
      }
      
      setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: numValue } : g));
      setHasUnsavedChanges(true);

      // Auto-save functionality with debouncing
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const newTimeout = setTimeout(() => {
        handleAutoSave();
      }, 2000); // 2 second debounce

      setAutoSaveTimeout(newTimeout);
  };
  
  const handleAutoSave = async () => {
    setIsAutoSaving(true);
    
    try {
      // Check if we should queue for offline sync
      if (!isOnline || isSlow) {
        // Queue grade updates using the offline action queue
        const queuedActions = grades.map(grade => {
          const actionId = addAction({
            type: 'update',
            entity: 'grade',
            entityId: grade.id,
            data: {
              studentId: grade.id,
              classId: className,
              subjectId: subjectId,
              assignment: grade.assignment,
              midExam: grade.midExam,
              finalExam: grade.finalExam,
            },
            endpoint: `${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL}/api/grades/${grade.id}`,
            method: 'PUT'
          });
          
          return {
            actionId,
            studentId: grade.id,
            classId: className,
            subjectId: subjectId,
            assignment: grade.assignment,
            midExam: grade.midExam,
            finalExam: grade.finalExam,
            timestamp: new Date().toISOString()
          };
        });

        setQueuedGradeUpdates(prev => [...prev, ...queuedActions]);
        
        // Cache locally immediately for UI consistency
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
        
        logger.info('Grade updates queued for offline sync', { count: queuedActions.length, status: isSlow ? 'slow_connection' : 'offline' });
        onShowToast(`${isSlow ? 'Koneksi lambat' : 'Offline'}: ${queuedActions.length} nilai diantarkan untuk sinkronisasi`, 'info');
        setHasUnsavedChanges(false);
        
        // Trigger sync if on slow connection (might recover)
        if (isSlow) {
          setTimeout(() => sync().catch((error) => logger.error('Sync failed:', error)), 5000);
        }
        
        return;
      }
      
      // Online with good connection: Direct API calls
      const savePromises = grades.map(grade =>
        gradesAPI.update(grade.id, {
          studentId: grade.id,
          classId: className,
          subjectId: subjectId,
          assignment: grade.assignment,
          midExam: grade.midExam,
          finalExam: grade.finalExam,
        })
      );

      await Promise.all(savePromises);
      logger.info('Auto-save completed successfully');
      onShowToast('Nilai otomatis disimpan', 'success');
      
      // Cache the updated grades for offline use
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
      setHasUnsavedChanges(false);
      
    } catch (error) {
      logger.error('Auto-save failed:', error);
      
      // Auto-queue on network failure
      if (!isOnline) {
        const queuedActions = grades.map(grade => {
          const actionId = addAction({
            type: 'update',
            entity: 'grade',
            entityId: grade.id,
            data: {
              studentId: grade.id,
              classId: className,
              subjectId: subjectId,
              assignment: grade.assignment,
              midExam: grade.midExam,
              finalExam: grade.finalExam,
            },
            endpoint: `${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL}/api/grades/${grade.id}`,
            method: 'PUT'
          });
          
          return {
            actionId,
            studentId: grade.id,
            classId: className,
            subjectId: subjectId,
            assignment: grade.assignment,
            midExam: grade.midExam,
            finalExam: grade.finalExam,
            timestamp: new Date().toISOString()
          };
        });

        setQueuedGradeUpdates(prev => [...prev, ...queuedActions]);
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
        
        logger.info('Grade updates auto-queued due to network error', { count: queuedActions.length });
        onShowToast(`Koneksi gagal: ${queuedActions.length} nilai diantarkan untuk sinkronisasi`, 'info');
        setHasUnsavedChanges(false);
      } else {
        onShowToast('Gagal menyimpan nilai otomatis', 'error');
      }
    } finally {
      setIsAutoSaving(false);
    }
  };
  
  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedStudents(new Set());
  };
  
  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };
  
  const handleBatchGradeInput = (field: keyof StudentGrade, value: string) => {
    const numValue = sanitizeGradeInput(value);
    const gradeInput: GradeInput = { [field]: numValue };
    const validation = validateGradeInput(gradeInput);
    
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setGrades(prev => prev.map(g =>
      selectedStudents.has(g.id) ? { ...g, [field]: numValue } : g
    ));
  };
  
  const handleCSVImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const csvData = results.data as Record<string, string>[];
          const updatedGrades = grades.map(grade => {
            const csvRow = csvData.find(row =>
              row.nis === grade.nis ||
              row.name?.toLowerCase() === grade.name.toLowerCase()
            );

            if (csvRow) {
              const assignment = sanitizeGradeInput(csvRow.assignment || csvRow.tugas || grade.assignment);
              const midExam = sanitizeGradeInput(csvRow.midExam || csvRow.uts || grade.midExam);
              const finalExam = sanitizeGradeInput(csvRow.finalExam || csvRow.uas || grade.finalExam);

              const assignmentValidation = validateGradeInput({ assignment });
              const midExamValidation = validateGradeInput({ midExam });
              const finalExamValidation = validateGradeInput({ finalExam });

              if (!assignmentValidation.isValid || !midExamValidation.isValid || !finalExamValidation.isValid) {
                onShowToast(`Invalid grades for ${grade.name}: ${assignmentValidation.errors.concat(midExamValidation.errors, finalExamValidation.errors).join(', ')}`, 'error');
                return grade;
              }

              return {
                ...grade,
                assignment,
                midExam,
                finalExam
              };
            }
            return grade;
          });

          setGrades(updatedGrades);
          setIsBatchMode(false);
          onShowToast('CSV import berhasil! Nilai diperbarui.', 'success');
        } catch (err) {
          logger.error('CSV import error:', err);
          onShowToast('Gagal impor CSV. Mohon periksa format file.', 'error');
        }
      },
      error: (err) => {
        logger.error('CSV parsing error:', err);
        onShowToast('Gagal parsing CSV. Mohon periksa format file.', 'error');
      }
    });

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleCSVExport = () => {
    const csvData = grades.map(g => ({
      name: g.name,
      nis: g.nis,
      assignment: g.assignment,
      midExam: g.midExam,
      finalExam: g.finalExam,
      finalScore: calculateFinalGrade(g.assignment, g.midExam, g.finalExam).toFixed(1),
      grade: calculateGradeLetter(calculateFinalGrade(g.assignment, g.midExam, g.finalExam))
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `grades_${className}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onShowToast('Grades exported to CSV successfully', 'success');
  };
  
  const calculateGradeStatistics = () => {
    if (grades.length === 0) return null;

    const finalScores = grades.map(g => calculateFinalGrade(g.assignment, g.midExam, g.finalExam));
    const average = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
    const maxScore = Math.max(...finalScores);
    const minScore = Math.min(...finalScores);

    const gradeDistribution = {
      A: finalScores.filter(score => score >= 85).length,
      B: finalScores.filter(score => score >= 75 && score < 85).length,
      C: finalScores.filter(score => score >= 60 && score < 75).length,
      D: finalScores.filter(score => score < 60).length
    };

    return { average, maxScore, minScore, gradeDistribution };
  };

  const handleSave = async () => {
    // Validate all grades before saving
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
        message: `Terdapat kesalahan validasi:\n\n${validationErrors.join('\n')}\n\nPerbaiki kesalahan tersebut sebelum menyimpan.`,
        type: 'danger',
        onConfirm: () => {}
      });
      return;
    }
    
    // Show confirmation with warnings if any
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
  
  const doBatchSave = async () => {
    try {
      _setIsSaving(true);
      
      // Track save progress
      let successCount = 0;
      let failureCount = 0;
      const failureDetails: string[] = [];

      const savePromises = grades.map(async (grade, index) => {
        try {
          await gradesAPI.update(grade.id, {
            studentId: grade.id,
            classId: className,
            subjectId: subjectId,
            assignment: grade.assignment,
            midExam: grade.midExam,
            finalExam: grade.finalExam,
          });
          successCount++;
          return { success: true, studentName: grade.name, studentId: grade.id };
        } catch (error) {
          failureCount++;
          failureDetails.push(`${grade.name || `Siswa ${index + 1}`}: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
          logger.error(`Failed to save grade for student ${grade.id}:`, error);
          return { success: false, studentName: grade.name, error };
        }
      });

      const results = await Promise.all(savePromises);
      
      // Send push notifications to students and parents for successful saves
      if (successCount > 0) {
        const successfulSaves = results.filter(r => r.success);
        
        for (const save of successfulSaves) {
          const grade = grades.find(g => g.id === save.studentId);
          if (grade) {
            const finalScore = calculateFinalGrade(grade.assignment, grade.midExam, grade.finalExam);
            const gradeLetter = calculateGradeLetter(finalScore);
            
            // Use event notifications hook for standardized notifications
            await notifyGradeUpdate(
              grade.name,
              subjectId,
              undefined, // previousGrade not tracked in this flow
              finalScore
            );
            
            // Legacy notification for detailed student notification
            await unifiedNotificationManager.showNotification({
              id: `grade-${save.studentId}-${subjectId}-${Date.now()}`,
              type: 'grade',
              title: 'Nilai Baru Tersedia',
              body: `Nilai ${subjectId} Anda telah dipublikasikan: ${finalScore.toFixed(1)} (${gradeLetter})`,
              icon: '📊',
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'normal',
              targetUsers: save.studentId ? [save.studentId] : [],
              data: {
                action: 'view_grades',
                subjectId: subjectId,
                className: className
              }
            });
            
            // TODO: Also notify parents when parent API is available
            // const parents = await parentsAPI.getByStudentId(save.studentId);
            // for (const parent of parents) {
            //   await unifiedNotificationManager.showNotification({
            //     id: `parent-grade-${save.studentId}-${subjectId}-${Date.now()}`,
            //     type: 'grade',
            //     title: `Nilai ${grade.name}`,
            //     body: `Nilai ${subjectId}: ${finalScore.toFixed(1)} (${gradeLetter})`,
            //     icon: '📊',
            //     timestamp: new Date().toISOString(),
            //     read: false,
            //     priority: 'normal',
            //     targetUsers: [parent.userId],
            //     data: {
            //       action: 'view_child_grades',
            //       studentId: save.studentId,
            //       subjectId: subjectId
            //     }
            //   });
            // }
          }
        }
      }
      
      if (failureCount === 0) {
        toast.success(`Berhasil menyimpan nilai untuk ${successCount} siswa.`);
        setIsEditing(null);
      } else if (successCount > 0) {
        toast.warning(`Berhasil menyimpan ${successCount} siswa, gagal ${failureCount} siswa. Silakan periksa kembali.`);
      } else {
        toast.error(`Gagal menyimpan semua nilai. ${failureDetails[0]}`);
      }
      
      // Show detailed error dialog if there are failures
      if (failureCount > 0) {
        setConfirmDialog({
          isOpen: true,
          title: 'Detail Penyimpanan',
          message: `Hasil penyimpanan:\n\n✓ Berhasil: ${successCount} siswa\n✗ Gagal: ${failureCount} siswa\n\nDetail kesalahan:\n${failureDetails.join('\n')}`,
          type: 'danger',
          onConfirm: () => {}
        });
      }
    } catch (error) {
      logger.error('Error in batch save:', error);
      toast.error('Terjadi kesalahan sistem saat menyimpan nilai');
    } finally {
      _setIsSaving(false);
    }
  };

  const handleAIAnalysis = async () => {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      // Prepare data for AI (add final score context)
      const dataForAI = grades.map(g => ({
          studentName: g.name,
          subject: 'Matematika Wajib',
          grade: calculateGradeLetter(calculateFinalGrade(g.assignment, g.midExam, g.finalExam)),
          semester: 'Semester 1'
      }));

      const result = await analyzeClassPerformance(dataForAI);
      setAnalysisResult(result);
      setIsAnalyzing(false);
  };

  const handleOCRExamUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      onShowToast('Format file tidak didukung. Gunakan PDF, JPG, PNG, atau HEIC', 'error');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onShowToast('File terlalu besar. Maksimal 10MB', 'error');
      return;
    }

    setIsOCRProcessing(true);
    setOCRProgress({ status: 'Memulai OCR...', progress: 0 });
    setShowOCRModal(true);

    try {
      // Initialize OCR service
      await ocrService.initialize((progress) => {
        setOCRProgress(progress);
      });

      // Extract text from image
      const result = await ocrService.extractTextFromImage(file, (progress) => {
        setOCRProgress(progress);
      });

      setOcrResult(result);
      setOCRProgress({ status: 'Memproses hasil...', progress: 100 });

      // Use Gemini AI to extract grades from OCR text
      if (result.text && result.confidence > 50) {
        await processOCRWithAI(result.text, result.confidence);
      } else {
        onShowToast('OCR gagal membaca dokumen. Coba dengan kualitas gambar yang lebih baik.', 'error');
      }

    } catch (error) {
      logger.error('OCR Processing Error:', error);
      onShowToast('Gagal memproses dokumen. Silakan coba lagi.', 'error');
    } finally {
      setIsOCRProcessing(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const processOCRWithAI = async (ocrText: string, confidence: number) => {
    try {
      // Use Gemini service to extract structured data
      const aiResult = await analyzeClassPerformance([{ 
        studentName: '', 
        subject: subjectId, 
        grade: '', 
        semester: 'Semester 1'
      }]);

      // Parse AI response (simplified - in production, you'd use structured AI calls)
      const extractedData = parseAIGradeExtraction(aiResult, ocrText);

      if (extractedData) {
        // Find matching student
        const matchingStudent = grades.find(g => 
          g.name.toLowerCase().includes(extractedData.studentName?.toLowerCase() || '') ||
          g.nis === extractedData.nis
        );

        if (matchingStudent) {
          setOcrReviewData({
            studentId: matchingStudent.id,
            assignment: extractedData.assignment,
            midExam: extractedData.midExam,
            finalExam: extractedData.finalExam,
            extractedText: ocrText,
            confidence
          });
        } else {
          toast.warning('Siswa tidak ditemukan. Silakan periksa nama atau NIS yang diekstrak.');
          setOcrReviewData({
            assignment: extractedData.assignment,
            midExam: extractedData.midExam,
            finalExam: extractedData.finalExam,
            extractedText: ocrText,
            confidence
          });
        }
      } else {
        toast.warning('Tidak dapat mengenali format nilai. Silakan periksa dokumen.');
      }

    } catch (error) {
      logger.error('AI Processing Error:', error);
      toast.error('Gagal memproses hasil OCR dengan AI');
    }
  };

  const parseAIGradeExtraction = (_aiResult: string, ocrText: string) => {
    // Fallback parsing if AI fails
    const numbers = ocrText.match(/\b(100|[1-9]?\d)\b/g);
    if (!numbers || numbers.length < 3) return null;

    // Simple extraction - assume first 3 valid numbers are assignment, mid, final
    return {
      studentName: '',
      nis: '',
      assignment: parseInt(numbers[0], 10),
      midExam: parseInt(numbers[1], 10),
      finalExam: parseInt(numbers[2], 10)
    };
  };

  const confirmOCRGrades = () => {
    if (!ocrReviewData) return;

    const { studentId, assignment, midExam, finalExam } = ocrReviewData;

    if (studentId) {
      // Update specific student's grades
      const updatedGrades = grades.map(g => 
        g.id === studentId 
          ? { ...g, assignment: assignment || g.assignment, midExam: midExam || g.midExam, finalExam: finalExam || g.finalExam }
          : g
      );
      setGrades(updatedGrades);
      toast.success(`Nilai untuk ${grades.find(g => g.id === studentId)?.name} berhasil diperbarui dari OCR`);
    } else {
      toast.warning('Tidak ada siswa yang cocok. Silakan periksa kembali data yang diekstrak.');
    }

    // Store OCR audit trail
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

    // Close modal and reset
    setShowOCRModal(false);
    setOcrReviewData(null);
    setOcrResult(null);
  };

  const cancelOCRReview = () => {
    setShowOCRModal(false);
    setOcrReviewData(null);
    setOcrResult(null);
  };

  const handlePDFExport = async () => {
    if (filteredData.length === 0) {
      onShowToast('Tidak ada data untuk diexport', 'error');
      return;
    }

    try {
      setIsExportingPDF(true);
      
      const gradesData = filteredData.map(student => ({
        subjectName: subjectId,
        grade: calculateFinalGrade(student.assignment, student.midExam, student.finalExam),
        className: className,
        semester: 'Semester 1',
        remarks: `Assignment: ${student.assignment}, Mid: ${student.midExam}, Final: ${student.finalExam}`
      }));
      
      pdfExportService.createGradesReport(gradesData, { name: '', id: '' });
      
      onShowToast('Laporan nilai berhasil diexport ke PDF', 'success');
    } catch (error) {
      logger.error('Failed to export grades PDF:', error);
      onShowToast('Gagal melakukan export PDF', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
        {/* Offline Status Indicator */}
        <OfflineIndicator 
          showSyncButton={true}
          showQueueCount={true}
          position="top-right"
        />
        
        {/* Offline/Error State */}
        {error && (
          <ErrorMessage 
            message={error}
            variant="card"
            className="mb-4"
          />
        )}
        
        {/* Header with Enhanced Controls */}
        <div className="flex flex-col gap-4 mb-6">
            <div>
                <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
                    ← Kembali ke Dashboard
                </Button>
                 <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Input Nilai Siswa
                    {!isOnline && <span className="ml-2 text-sm font-normal text-amber-600 dark:text-amber-400">(Offline)</span>}
                 </h2>
                 <p className="text-neutral-500 dark:text-neutral-400">
                    Mata Pelajaran: <strong>{subjectId} ({className})</strong>
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                        • Ada perubahan belum disimpan
                      </span>
                    )}
                 </p>
            </div>
            
            {/* Enhanced Toolbar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={toggleBatchMode}
                        variant={isBatchMode ? 'blue-solid' : 'secondary'}
                        className="rounded-full shadow-md"
                    >
                        {isBatchMode ? `Selected: ${selectedStudents.size}` : 'Batch Mode'}
                    </Button>
                    
                    <Button
                        onClick={() => setShowStats(!showStats)}
                        variant={showStats ? 'green-solid' : 'ghost'}
                    >
                        Statistics
                    </Button>

                    <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVImport}
                        className="hidden"
                    />
                    <Button
                        variant="orange-solid"
                        size="md"
                        onClick={() => csvInputRef.current?.click()}
                    >
                        Import CSV
                    </Button>

                    {canUseOCRGrading && (
                        <>
                            <input
                                ref={ocrInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.heic"
                                onChange={handleOCRExamUpload}
                                className="hidden"
                                disabled={isOCRProcessing}
                            />
                            <Button
                                variant="purple-solid"
                                size="md"
                                onClick={() => ocrInputRef.current?.click()}
                                disabled={isOCRProcessing}
                            >
                                📷 Scan Exam
                            </Button>
                        </>
                    )}
                    
                    <Button
                        onClick={handlePDFExport}
                        disabled={isExportingPDF || filteredData.length === 0}
                        variant="green-solid"
                        isLoading={isExportingPDF}
                    >
                        {isExportingPDF ? 'Exporting...' : '📄 Export PDF'}
                    </Button>

                    <Button
                        onClick={handleCSVExport}
                        variant="teal-solid"
                    >
                        Export CSV
                    </Button>
                    
                    {canCreateContent && (
                    <Button
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        variant="purple-solid"
                        icon={<LightBulbIcon className="w-5 h-5" />}
                        isLoading={isAnalyzing}
                        className="rounded-full shadow-md"
                    >
                        {isAnalyzing ? "Menganalisis..." : "Analisis AI"}
                    </Button>
                )}
                </div>
                
                {/* Search */}
                <SearchInput
                    placeholder="Cari Nama / NIS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="sm"
                    className="w-full md:w-64"
                />
                
                {/* Auto-save indicator */}
                {isAutoSaving && (
                    <LoadingSpinner size="sm" color="neutral" text="Auto-saving..." />
                )}
            </div>
        </div>
        
        {/* Grade Statistics Panel */}
        {showStats && !loading && !error && (() => {
            const stats = calculateGradeStatistics();
            if (!stats) return null;
            
            return (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6 animate-scale-in">
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">Grade Distribution Statistics</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.average.toFixed(1)}</div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">Class Average</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.maxScore}</div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">Highest Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.minScore}</div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">Lowest Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{filteredData.length}</div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Students</div>
                        </div>
                    </div>
                    
                    {/* Grade Distribution Bars */}
                    <div className="space-y-2">
                        {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                            const percentage = (count / filteredData.length) * 100;
                            const colorMap: Record<string, 'green' | 'blue' | 'warning' | 'error'> = {
                                A: 'green',
                                B: 'blue',
                                C: 'warning',
                                D: 'error'
                            };

                            return (
                                <div key={grade} className="flex items-center gap-3">
                                    <div className="w-8 text-center font-bold text-neutral-700 dark:text-neutral-300">{grade}</div>
                                    <ProgressBar
                                        value={percentage}
                                        max={100}
                                        size="xl"
                                        color={colorMap[grade] || 'primary'}
                                        showLabel={true}
                                        label={`${count} students (${percentage.toFixed(1)}%)`}
                                        aria-label={`Grade ${grade}: ${count} students (${percentage.toFixed(1)}%)`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })()}
        
        {/* Batch Operation Controls */}
        {isBatchMode && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6 flex gap-3 flex-wrap items-center">
                <span className="font-medium text-yellow-800 dark:text-yellow-300">
                    Batch Operations ({selectedStudents.size} selected):
                </span>

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
        )}

        {/* AI Analysis Result Area */}
        {analysisResult && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-6 animate-scale-in">
                <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5" />
                    Hasil Analisis Pedagogis (Gemini 3 Pro)
                </h3>
                <div className="text-neutral-700 dark:text-neutral-300 text-sm">
                    <MarkdownRenderer content={analysisResult} />
                </div>
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAnalysisResult(null)}
                  >
                    Tutup Analisis
                  </Button>
                </div>
            </div>
        )}

        {/* Loading State */}
        {loading && (
            <TableSkeleton rows={10} cols={6} />
        )}

        {/* Error State */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Error:</strong> {error}
                </p>
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchStudentsAndGrades}
                  >
                    Coba Lagi
                  </Button>
                </div>
            </div>
        )}

        {/* Info Banner */}
        {!loading && !error && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Info Pembobotan:</strong> Tugas (30%) + UTS (30%) + UAS (40%). Nilai Akhir dan Predikat dihitung otomatis.
                </p>
            </div>
        )}

        {/* Grading Table */}
        {!loading && !error && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                    <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
                        <tr>
                            {isBatchMode && (
                                <th className="px-4 py-4 text-center w-12">Select</th>
                            )}
                            <th className="px-6 py-4">Siswa</th>
                            <th className="px-4 py-4 text-center w-24">Tugas (30%)</th>
                            <th className="px-4 py-4 text-center w-24">UTS (30%)</th>
                            <th className="px-4 py-4 text-center w-24">UAS (40%)</th>
                            <th className="px-6 py-4 text-center">Nilai Akhir</th>
                            <th className="px-6 py-4 text-center">Predikat</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {filteredData.map((student) => {
                            const finalScore = calculateFinalGrade(student.assignment, student.midExam, student.finalExam);
                            const gradeLetter = calculateGradeLetter(finalScore);
                            const isRowEditing = isEditing === student.id;
                            const isSelected = selectedStudents.has(student.id);

                            return (
                                <tr key={student.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${
                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}>
                                    {isBatchMode && (
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleStudentSelection(student.id)}
                                                aria-label={`Pilih siswa ${student.name}`}
                                                className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900 dark:text-white">{student.name}</div>
                                        <div className="text-xs text-neutral-500">NIS: {student.nis}</div>
                                    </td>

                                    {/* Enhanced Input Columns - Always enabled */}
                                    <td className="px-2 py-4 text-center sm:px-4">
                                        <input
                                            type="number"
                                            value={student.assignment}
                                            onChange={(e) => handleInputChange(student.id, 'assignment', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full sm:max-w-16 text-center p-1 rounded border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-center sm:px-4">
                                        <input
                                            type="number"
                                            value={student.midExam}
                                            onChange={(e) => handleInputChange(student.id, 'midExam', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full sm:max-w-16 text-center p-1 rounded border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-center sm:px-4">
                                        <input
                                            type="number"
                                            value={student.finalExam}
                                            onChange={(e) => handleInputChange(student.id, 'finalExam', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full sm:max-w-16 text-center p-1 rounded border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>

                                    {/* Calculated Columns */}
                                    <td className="px-6 py-4 text-center font-bold text-neutral-900 dark:text-white">
                                        <div className="flex flex-col">
                                            <span>{finalScore.toFixed(1)}</span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {calculateFinalGrade(student.assignment, student.midExam, student.finalExam).toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                            gradeLetter === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                            gradeLetter === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                            gradeLetter === 'C' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {gradeLetter}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                            {isRowEditing ? (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => {
                                                        const validation = validateGradeInput({
                                                            assignment: student.assignment,
                                                            midExam: student.midExam,
                                                            finalExam: student.finalExam
                                                        });

                                                        if (!validation.isValid) {
                                                            setConfirmDialog({
                                                                isOpen: true,
                                                                title: 'Validasi Gagal',
                                                                message: `Kesalahan validasi untuk ${student.name}:\n\n${validation.errors.join(', ')}\n\nPerbaiki sebelum menyimpan.`,
                                                                type: 'danger',
                                                                onConfirm: () => {}
                                                            });
                                                            return;
                                                        }

                                                        if (validation.warnings.length > 0) {
                                                            setConfirmDialog({
                                                                isOpen: true,
                                                                title: 'Konfirmasi Penyimpanan',
                                                                message: `Simpan nilai untuk ${student.name}?\n\nPeringatan:\n${validation.warnings.join(', ')}`,
                                                                type: 'warning',
                                                                onConfirm: () => doBatchSave()
                                                            });
                                                        } else {
                                                            doBatchSave();
                                                        }
                                                    }}
                                                >
                                                    Simpan
                                                </Button>
                                            ) : null}
                                            <button
                                                onClick={() => {
                                                    setResetDialog({
                                                        isOpen: true,
                                                        studentId: student.id,
                                                        studentName: student.name
                                                    });
                                                }}
                                                className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        )}

        {/* Save Button */}
        {!loading && !error && (
<div className="flex justify-end mt-6">
            <Button
                variant="green-solid"
                size="md"
                onClick={handleSave}
                disabled={loading || isSaving}
            >
                {loading || isSaving ? "Menyimpan..." : "Simpan Semua Nilai"}
            </Button>
        </div>
        )}

        {/* OCR Processing Modal */}
        {showOCRModal && (
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
                            {/* OCR Result Summary */}
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

                            {/* Extracted Grades */}
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

                            {/* Student Selection if not matched */}
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
                                        Please select the student or check the extracted data
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

                            {/* Raw OCR Text */}
                            <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Raw OCR Text</h4>
                                <div className="max-h-32 overflow-y-auto text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 p-2 rounded border">
                                    {ocrReviewData.extractedText}
                                </div>
                            </div>

                            {/* Actions */}
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
        )}

        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          isLoading={isSaving}
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
