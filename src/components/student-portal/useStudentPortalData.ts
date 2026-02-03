import React, { useState, useCallback } from 'react';
import { Student } from '../../types';
import { authAPI, studentsAPI, gradesAPI, attendanceAPI, schedulesAPI } from '../../services/apiService';
import { logger } from '../../utils/logger';
import { useOfflineData, type CachedStudentData } from '../../services/offlineDataService';
import { StudentPortalValidator, type CacheFreshnessInfo, type ValidationResult } from '../../utils/studentPortalValidator';
import { getOfflineMessage } from '../../utils/networkStatus';

type ToastType = 'success' | 'info' | 'error' | 'warning';

interface UseStudentPortalDataProps {
  isOnline: boolean;
  onShowToast: (msg: string, type: ToastType) => void;
  offlineDataService: ReturnType<typeof import('../../services/offlineDataService').useOfflineDataService>;
}

interface UseStudentPortalDataReturn {
  studentData: Student | null;
  offlineData: CachedStudentData | null;
  loading: boolean;
  error: string | null;
  syncInProgress: boolean;
  validationResults: Record<string, ValidationResult>;
  cacheFreshness: CacheFreshnessInfo | null;
  syncStatus: ReturnType<typeof import('../../services/offlineDataService').useOfflineData>;
  isCached: boolean;
  handleSync: () => Promise<void>;
  refreshData: () => Promise<void>;
  setValidationResults: React.Dispatch<React.SetStateAction<Record<string, ValidationResult>>>;
}

export const useStudentPortalData = ({
  isOnline,
  onShowToast,
  offlineDataService,
}: UseStudentPortalDataProps): UseStudentPortalDataReturn => {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [offlineData, setOfflineData] = useState<CachedStudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [cacheFreshness, setCacheFreshness] = useState<CacheFreshnessInfo | null>(null);

  const syncStatus = useOfflineData('student', studentData?.id);
  const isCached = syncStatus.isCached;

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      setError('Pengguna tidak ditemukan');
      setLoading(false);
      return;
    }

    if (!isOnline) {
      const cachedData = offlineDataService.getCachedStudentData(currentUser.id);
      if (cachedData) {
        setStudentData(cachedData.student);
        setOfflineData(cachedData);

        const freshness = StudentPortalValidator.getCacheFreshnessInfo(
          cachedData.lastUpdated,
          cachedData.expiresAt
        );
        setCacheFreshness(freshness);

        const studentValidation = StudentPortalValidator.validatePersonalInformation(cachedData.student);
        const gradesValidation = StudentPortalValidator.validateGradeCalculation(cachedData.grades || []);
        const attendanceValidation = (cachedData.attendance || []).map(att =>
          StudentPortalValidator.validateAttendanceRecord(att)
        );

        setValidationResults({
          student: studentValidation,
          grades: gradesValidation,
          attendance: {
            isValid: attendanceValidation.every(v => v.isValid),
            errors: attendanceValidation.flatMap(v => v.errors),
            warnings: attendanceValidation.flatMap(v => v.warnings),
          },
        });

        onShowToast('Menggunakan data offline', 'info');
        setLoading(false);
        return;
      } else {
        setError(getOfflineMessage());
        setLoading(false);
        return;
      }
    }

    try {
      const studentResponse = await studentsAPI.getByUserId(currentUser.id);
      if (studentResponse.success && studentResponse.data) {
        const student = studentResponse.data;
        setStudentData(student);

        try {
          const [gradesResponse, attendanceResponse, schedulesResponse] = await Promise.all([
            gradesAPI.getByStudent(student.id),
            attendanceAPI.getByStudent(student.id),
            schedulesAPI.getAll(),
          ]);

          if (gradesResponse.success && attendanceResponse.success) {
            const classSchedule = schedulesResponse.success && schedulesResponse.data
              ? schedulesResponse.data.filter(s => s.classId === student.class)
              : [];

            const cachedData = {
              student: student,
              grades: gradesResponse.data || [],
              attendance: attendanceResponse.data || [],
              schedule: classSchedule,
            };

            offlineDataService.cacheStudentData(cachedData);

            const studentValidation = StudentPortalValidator.validatePersonalInformation(studentResponse.data);
            const gradesValidation = StudentPortalValidator.validateGradeCalculation(gradesResponse.data || []);
            const attendanceValidation = (attendanceResponse.data || []).map(att =>
              StudentPortalValidator.validateAttendanceRecord(att)
            );

            setValidationResults({
              student: studentValidation,
              grades: gradesValidation,
              attendance: {
                isValid: attendanceValidation.every(v => v.isValid),
                errors: attendanceValidation.flatMap(v => v.errors),
                warnings: attendanceValidation.flatMap(v => v.warnings),
              },
            });
          }
        } catch (error) {
          logger.warn('Failed to fetch data for offline caching:', error);
        }
      } else {
        const cachedData = offlineDataService.getCachedStudentData(currentUser.id);
        if (cachedData) {
          setStudentData(cachedData.student);
          setOfflineData(cachedData);

          const freshness = StudentPortalValidator.getCacheFreshnessInfo(
            cachedData.lastUpdated,
            cachedData.expiresAt
          );
          setCacheFreshness(freshness);

          const studentValidation = StudentPortalValidator.validatePersonalInformation(cachedData.student);
          const gradesValidation = StudentPortalValidator.validateGradeCalculation(cachedData.grades || []);
          const attendanceValidation = (cachedData.attendance || []).map(att =>
            StudentPortalValidator.validateAttendanceRecord(att)
          );

          setValidationResults({
            student: studentValidation,
            grades: gradesValidation,
            attendance: {
              isValid: attendanceValidation.every(v => v.isValid),
              errors: attendanceValidation.flatMap(v => v.errors),
              warnings: attendanceValidation.flatMap(v => v.warnings),
            },
          });

          onShowToast('Server tidak tersedia, menggunakan data offline', 'info');
        } else {
          setError('Data siswa tidak ditemukan');
        }
      }
    } catch (err) {
      logger.error('Failed to fetch student data:', err);

      const cachedData = offlineDataService.getCachedStudentData(currentUser.id);
      if (cachedData) {
        setStudentData(cachedData.student);
        setOfflineData(cachedData);

        const freshness = StudentPortalValidator.getCacheFreshnessInfo(
          cachedData.lastUpdated,
          cachedData.expiresAt
        );
        setCacheFreshness(freshness);

        const studentValidation = StudentPortalValidator.validatePersonalInformation(cachedData.student);
        const gradesValidation = StudentPortalValidator.validateGradeCalculation(cachedData.grades || []);
        const attendanceValidation = (cachedData.attendance || []).map(att =>
          StudentPortalValidator.validateAttendanceRecord(att)
        );

        setValidationResults({
          student: studentValidation,
          grades: gradesValidation,
          attendance: {
            isValid: attendanceValidation.every(v => v.isValid),
            errors: attendanceValidation.flatMap(v => v.errors),
            warnings: attendanceValidation.flatMap(v => v.warnings),
          },
        });

        onShowToast('Gagal memuat data, menggunakan data offline', 'info');
      } else {
        setError('Gagal memuat data siswa. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, offlineDataService, onShowToast]);

  const handleSync = useCallback(async () => {
    if (!isOnline) {
      onShowToast('Memerlukan koneksi internet untuk sinkronisasi', 'error');
      return;
    }

    setSyncInProgress(true);
    onShowToast('Menyinkronkan data...', 'info');

    try {
      await offlineDataService.forceSync();

      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        try {
          const studentResponse = await studentsAPI.getByUserId(currentUser.id);
          if (studentResponse.success && studentResponse.data) {
            setStudentData(studentResponse.data);

            const [gradesResponse, attendanceResponse] = await Promise.all([
              gradesAPI.getByStudent(studentResponse.data.id),
              attendanceAPI.getByStudent(studentResponse.data.id),
            ]);

            if (gradesResponse.success && attendanceResponse.success) {
              const dataToCache = {
                student: studentResponse.data,
                grades: gradesResponse.data || [],
                attendance: attendanceResponse.data || [],
                schedule: [],
              };

              offlineDataService.cacheStudentData(dataToCache);

              const cachedData = offlineDataService.getCachedStudentData(studentResponse.data.id);

              const studentValidation = StudentPortalValidator.validatePersonalInformation(studentResponse.data);
              const gradesValidation = StudentPortalValidator.validateGradeCalculation(gradesResponse.data || []);
              const attendanceValidation = (attendanceResponse.data || []).map(att =>
                StudentPortalValidator.validateAttendanceRecord(att)
              );

              setValidationResults({
                student: studentValidation,
                grades: gradesValidation,
                attendance: {
                  isValid: attendanceValidation.every(v => v.isValid),
                  errors: attendanceValidation.flatMap(v => v.errors),
                  warnings: attendanceValidation.flatMap(v => v.warnings),
                },
              });

              if (cachedData) {
                setCacheFreshness(StudentPortalValidator.getCacheFreshnessInfo(
                  cachedData.lastUpdated,
                  cachedData.expiresAt
                ));
              }

              onShowToast('Sinkronisasi berhasil', 'success');
            }
          }
        } catch (syncError) {
          logger.error('Failed to re-fetch data after sync:', syncError);
          onShowToast('Data berhasil disinkronkan, silakan muat ulang halaman', 'info');
        }
      }
    } catch (error) {
      logger.error('Failed to sync:', error);
      onShowToast('Sinkronisasi gagal, silakan coba lagi', 'error');
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, offlineDataService, onShowToast]);

  const _refreshData = useCallback(() => {
    return fetchStudentData();
  }, [fetchStudentData]);

  return {
    studentData,
    offlineData,
    loading,
    error,
    syncInProgress,
    validationResults,
    cacheFreshness,
    syncStatus,
    isCached,
    handleSync,
    refreshData: _refreshData,
    setValidationResults,
  };
};

export type { UseStudentPortalDataProps, UseStudentPortalDataReturn };
