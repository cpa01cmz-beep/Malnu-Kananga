
import { useState, useEffect, useCallback } from 'react';
import { studentsAPI, gradesAPI } from '../../services/apiService';
import { parentGradeNotificationService } from '../../services/parentGradeNotificationService';
import { unifiedNotificationManager } from '../../services/notifications/unifiedNotificationManager';
import { useOfflineActionQueue, type SyncResult } from '../../services/offlineActionQueueService';
import { STORAGE_KEYS, SCHEDULER_INTERVALS, GRADE_LIMITS, TIME_MS, API_ENDPOINTS, getSimplifiedGradeLetter } from '../../constants';
import { DEFAULT_API_BASE_URL } from '../../config';
import { logger } from '../../utils/logger';
import { useEventNotifications } from '../../hooks/useEventNotifications';
import {
  API_ERROR_MESSAGES,
  SYNC_MESSAGES,
  AUTO_SAVE_MESSAGES,
  DATA_MESSAGES,
} from '../../utils/errorMessages';
import { useNetworkStatus, getOfflineMessage } from '../../utils/networkStatus';
import {
  validateGradeInput,
  sanitizeGradeInput,
  calculateFinalGrade,
  type GradeInput,
  getInlineValidationMessage,
  type GradeHistoryEntry
} from '../../utils/teacherValidation';

export interface StudentGrade {
  id: string;
  name: string;
  nis: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

export interface QueuedGradeUpdate {
  studentId: string;
  classId: string;
  subjectId: string;
  assignment: number;
  midExam: number;
  finalExam: number;
  timestamp: string;
}

export interface OCRReviewData {
  studentId?: string;
  assignment?: number;
  midExam?: number;
  finalExam?: number;
  extractedText: string;
  confidence: number;
}

export const useGradingData = (
  className: string,
  subjectId: string,
  authUser: { name?: string } | null,
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void
) => {
  const { notifyGradeUpdate, useMonitorLocalStorage } = useEventNotifications();

  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [queuedGradeUpdates, setQueuedGradeUpdates] = useState<QueuedGradeUpdate[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inlineErrors, setInlineErrors] = useState<Record<string, Record<string, string> | undefined>>({});
  const [gradeHistory, setGradeHistory] = useState<GradeHistoryEntry[]>([]);

  const { isOnline, isSlow } = useNetworkStatus();
  const {
    sync,
    addAction,
    onSyncComplete
  } = useOfflineActionQueue();

  const fetchStudentsAndGrades = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isOnline) {
      const cachedGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
      if (cachedGrades) {
        try {
          const parsedGrades = JSON.parse(cachedGrades);
          setGrades(parsedGrades);
          setError(getOfflineMessage());
          onShowToast(SYNC_MESSAGES.OFFLINE_USING_CACHE('nilai'), 'info');
        } catch {
          setError(getOfflineMessage());
          onShowToast(DATA_MESSAGES.NO_DATA_AVAILABLE('nilai'), 'error');
        }
      } else {
        setError(getOfflineMessage());
        onShowToast(SYNC_MESSAGES.OFFLINE_NO_CACHE, 'error');
      }
      setLoading(false);
      return;
    }

    try {
      const studentsResponse = await studentsAPI.getByClass(className);
      if (!studentsResponse.success || !studentsResponse.data) {
        throw new Error(studentsResponse.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      }

      const gradesResponse = await gradesAPI.getByClass(className);
      const existingGrades = gradesResponse.success && gradesResponse.data ? gradesResponse.data : [];

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
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(studentGrades));

      if (queuedGradeUpdates.length > 0) {
        onShowToast(SYNC_MESSAGES.PROCESSING_QUEUED_CHANGES(queuedGradeUpdates.length), 'info');
        setQueuedGradeUpdates([]);
      }
    } catch {
      setError(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      onShowToast(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'error');

      const cachedGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
      if (cachedGrades) {
        try {
          const parsedGrades = JSON.parse(cachedGrades);
          setGrades(parsedGrades);
          setError(SYNC_MESSAGES.OFFLINE_USING_CACHE('') + getOfflineMessage());
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

  useEffect(() => {
    if (onSyncComplete) {
      return onSyncComplete((result: SyncResult) => {
        if (result.success && result.actionsProcessed > 0) {
          const gradeActions = result.actionsProcessed;
          if (gradeActions > 0) {
            onShowToast(SYNC_MESSAGES.SYNC_CHANGES(gradeActions), 'success');
            setQueuedGradeUpdates(prev =>
              prev.slice(0, Math.max(0, prev.length - gradeActions))
            );
          }
        }

        if (result.actionsFailed > 0) {
          onShowToast(SYNC_MESSAGES.SYNC_FAILED(result.actionsFailed, 'nilai'), 'error');
        }
      });
    }
  }, [onSyncComplete, onShowToast]);

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

  const handleInputChange = (id: string, field: keyof StudentGrade, value: string) => {
    const numValue = sanitizeGradeInput(value);
    const gradeInput: GradeInput = { [field]: numValue };
    const validation = validateGradeInput(gradeInput);
    const inlineValidation = getInlineValidationMessage(numValue, field);

    const currentGrade = grades.find(g => g.id === id);
    if (currentGrade && currentGrade[field] !== numValue) {
      const historyEntry: GradeHistoryEntry = {
        studentId: id,
        studentName: currentGrade.name,
        field: field as 'assignment' | 'midExam' | 'finalExam',
        oldValue: currentGrade[field] as number,
        newValue: numValue,
        changedBy: authUser?.name || 'Unknown',
        changedAt: new Date().toISOString()
      };

      setGradeHistory(prev => {
        const newHistory = [historyEntry, ...prev];
        const finalHistory = newHistory.length > GRADE_LIMITS.HISTORY_MAX_ENTRIES ? newHistory.slice(0, GRADE_LIMITS.HISTORY_MAX_ENTRIES) : newHistory;

        try {
          localStorage.setItem(STORAGE_KEYS.GRADE_HISTORY, JSON.stringify(finalHistory));
        } catch (error) {
          logger.error('Failed to save grade history to localStorage:', error);
        }

        return finalHistory;
      });
    }

    if (!validation.isValid || !inlineValidation.isValid) {
      setInlineErrors(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: inlineValidation.message || validation.errors[0]
        }
      }));
    } else {
      setInlineErrors(prev => {
        const studentErrors = { ...prev[id] };
        delete studentErrors[field];
        return {
          ...prev,
          [id]: Object.keys(studentErrors).length > 0 ? studentErrors : undefined
        };
      });
    }

    if (validation.warnings.length > 0) {
      logger.warn('Validation warnings:', validation.warnings);
    }

    setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: numValue } : g));
    setHasUnsavedChanges(true);

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const newTimeout = setTimeout(() => {
      handleAutoSave();
    }, 2 * TIME_MS.ONE_SECOND); // 2 seconds

    setAutoSaveTimeout(newTimeout);
  };

  const handleAutoSave = async () => {
    setIsAutoSaving(true);

    try {
      if (!isOnline || isSlow) {
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
            endpoint: `${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL}${API_ENDPOINTS.ACADEMIC.GRADE_BY_ID(grade.id)}`,
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

        logger.info('Grade updates queued for offline sync', { count: queuedActions.length, status: isSlow ? 'slow_connection' : 'offline' });
        onShowToast(SYNC_MESSAGES.QUEUED_OFFLINE(queuedActions.length, 'nilai', isSlow ? 'Koneksi lambat' : 'Offline'), 'info');
        setHasUnsavedChanges(false);

        if (isSlow) {
          setTimeout(() => sync().catch((error) => logger.error('Sync failed:', error)), SCHEDULER_INTERVALS.AUTH_CHECK);
        }

        return;
      }

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
      onShowToast(AUTO_SAVE_MESSAGES.SUCCESS, 'success');

      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
      setHasUnsavedChanges(false);

    } catch (error) {
      logger.error('Auto-save failed:', error);

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
            endpoint: `${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL}${API_ENDPOINTS.ACADEMIC.GRADE_BY_ID(grade.id)}`,
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
        onShowToast(SYNC_MESSAGES.QUEUED_OFFLINE(queuedActions.length, 'nilai', 'Koneksi gagal'), 'info');
        setHasUnsavedChanges(false);
      } else {
        onShowToast(AUTO_SAVE_MESSAGES.FAILED, 'error');
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
      onShowToast(validation.errors[0], 'error');
      return;
    }

    setGrades(prev => prev.map(g =>
      selectedStudents.has(g.id) ? { ...g, [field]: numValue } : g
    ));
  };

  const doBatchSave = async () => {
    try {
      setIsSaving(true);

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

      if (successCount > 0) {
        const successfulSaves = results.filter(r => r.success);

        for (const save of successfulSaves) {
          const grade = grades.find(g => g.id === save.studentId);
          if (grade) {
            const finalScore = calculateFinalGrade(grade.assignment, grade.midExam, grade.finalExam);
            const gradeLetter = getSimplifiedGradeLetter(finalScore);

            await notifyGradeUpdate(
              grade.name,
              subjectId,
              undefined,
              finalScore
            );

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

            try {
              if (save.studentId) {
                const parentsResponse = await studentsAPI.getParents(save.studentId);
                if (parentsResponse.success && parentsResponse.data) {
                  const studentResponse = await studentsAPI.getById(save.studentId);
                  const studentData = studentResponse.success ? studentResponse.data : undefined;

                  for (const parent of parentsResponse.data) {
                    const parentChild = {
                      relationshipId: parent.relationshipId,
                      relationshipType: parent.relationshipType,
                      isPrimaryContact: parent.isPrimaryContact,
                      studentId: save.studentId,
                      nisn: studentData?.nisn || '',
                      nis: studentData?.nis || '',
                      class: studentData?.class || '',
                      className: className,
                      dateOfBirth: studentData?.dateOfBirth || '',
                      studentName: grade.name,
                      studentEmail: ''
                    };

                    const gradeObj = {
                      id: `${save.studentId}-${subjectId}-${Date.now()}`,
                      studentId: save.studentId,
                      subjectId: subjectId,
                      subjectName: subjectId,
                      score: finalScore,
                      maxScore: GRADE_LIMITS.MAX,
                      assignmentType: 'Tugas',
                      assignmentName: 'Nilai Semester',
                      teacherId: '',
                      classId: '',
                      academicYear: '',
                      semester: '',
                      createdBy: '',
                      createdAt: new Date().toISOString()
                    };

                    await parentGradeNotificationService.processGradeUpdate(parentChild, gradeObj);
                  }
                }
              }
            } catch (error) {
              logger.warn('Failed to send parent notifications:', error);
            }
          }
        }
      }

      if (failureCount === 0) {
        onShowToast(`Berhasil menyimpan nilai untuk ${successCount} siswa`, 'success');
        setIsEditing(null);
      } else if (successCount > 0) {
        onShowToast(`Sebagian berhasil: ${successCount} disimpan, ${failureCount} gagal`, 'info');
      } else {
        onShowToast(failureDetails[0] || 'Terjadi kesalahan', 'error');
      }
    } catch (error) {
      logger.error('Error in batch save:', error);
      onShowToast(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    grades,
    setGrades,
    loading,
    error,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    queuedGradeUpdates,
    setQueuedGradeUpdates,
    isEditing,
    setIsEditing,
    selectedStudents,
    setSelectedStudents,
    isBatchMode,
    setIsBatchMode,
    showStats,
    setShowStats,
    isAutoSaving,
    isSaving,
    setIsSaving,
    inlineErrors,
    setInlineErrors,
    gradeHistory,
    setGradeHistory,
    fetchStudentsAndGrades,
    handleInputChange,
    handleAutoSave,
    toggleBatchMode,
    toggleStudentSelection,
    handleBatchGradeInput,
    doBatchSave,
  };
};
