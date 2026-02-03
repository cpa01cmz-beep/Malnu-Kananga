import React, { useCallback } from 'react';
import { Student } from '../../types';
import { gradesAPI, attendanceAPI } from '../../services/apiService';
import { logger } from '../../utils/logger';
import { StudentPortalValidator, type ValidationResult } from '../../utils/studentPortalValidator';
import type { CachedStudentData } from '../../services/offlineDataService';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';
import { RealTimeEventType } from '../../services/webSocketService';

interface UseStudentPortalRealtimeProps {
  studentData: Student | null;
  offlineData: CachedStudentData | null;
  offlineDataService: ReturnType<typeof import('../../services/offlineDataService').useOfflineDataService>;
  isOnline: boolean;
  setValidationResults: React.Dispatch<React.SetStateAction<Record<string, ValidationResult>>>;
  onSetRefreshingData: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const useStudentPortalRealtime = ({
  studentData,
  offlineData,
  offlineDataService,
  isOnline,
  setValidationResults,
  onSetRefreshingData,
}: UseStudentPortalRealtimeProps) => {
  const refreshGrades = useCallback(async () => {
    if (!studentData || !isOnline) return;

    try {
      onSetRefreshingData(prev => ({ ...prev, grades: true }));
      const response = await gradesAPI.getByStudent(studentData.id);
      if (response.success && response.data) {
        const gradesValidation = StudentPortalValidator.validateGradeCalculation(response.data);
        setValidationResults(prev => ({ ...prev, grades: gradesValidation }));

        if (offlineData) {
          offlineDataService.cacheStudentData({
            student: offlineData.student,
            grades: response.data,
            attendance: offlineData.attendance,
            schedule: offlineData.schedule,
          });
        }

        logger.info('Grades refreshed from real-time event');
      }
    } catch (error) {
      logger.error('Failed to refresh grades:', error);
    } finally {
      onSetRefreshingData(prev => ({ ...prev, grades: false }));
    }
  }, [studentData, isOnline, offlineData, offlineDataService, setValidationResults, onSetRefreshingData]);

  const refreshAttendance = useCallback(async () => {
    if (!studentData || !isOnline) return;

    try {
      onSetRefreshingData(prev => ({ ...prev, attendance: true }));
      const response = await attendanceAPI.getByStudent(studentData.id);
      if (response.success && response.data) {
        const attendanceValidation = response.data.map(att =>
          StudentPortalValidator.validateAttendanceRecord(att)
        );

        setValidationResults(prev => ({
          ...prev,
          attendance: {
            isValid: attendanceValidation.every(v => v.isValid),
            errors: attendanceValidation.flatMap(v => v.errors),
            warnings: attendanceValidation.flatMap(v => v.warnings),
          },
        }));

        if (offlineData) {
          offlineDataService.cacheStudentData({
            student: offlineData.student,
            grades: offlineData.grades,
            attendance: response.data,
            schedule: offlineData.schedule,
          });
        }

        logger.info('Attendance refreshed from real-time event');
      }
    } catch (error) {
      logger.error('Failed to refresh attendance:', error);
    } finally {
      onSetRefreshingData(prev => ({ ...prev, attendance: false }));
    }
  }, [studentData, isOnline, offlineData, offlineDataService, setValidationResults, onSetRefreshingData]);

  const refreshMaterials = useCallback(async () => {
    if (!isOnline) return;

    try {
      onSetRefreshingData(prev => ({ ...prev, materials: true }));
      logger.info('Materials refresh triggered from real-time event');
    } catch (error) {
      logger.error('Failed to refresh materials:', error);
    } finally {
      onSetRefreshingData(prev => ({ ...prev, materials: false }));
    }
  }, [isOnline, onSetRefreshingData]);

  const { isConnected, isConnecting } = useRealtimeEvents({
    eventTypes: [
      'grade_updated',
      'grade_created',
      'attendance_marked',
      'attendance_updated',
      'library_material_added',
      'library_material_updated',
    ] as RealTimeEventType[],
    enabled: isOnline,
    onEvent: useCallback((event: unknown) => {
      if (!studentData) return;

      const typedEvent = event as Record<string, unknown>;
      const entity = typedEvent.entity as string;
      const data = typedEvent.data as Record<string, unknown> | undefined;

      if (!entity || typeof entity !== 'string') {
        logger.warn('Invalid real-time event: missing or invalid entity', { event });
        return;
      }

      if (entity === 'grade') {
        const dataStudentId = data?.studentId as string;
        if (dataStudentId && dataStudentId === studentData.id) {
          refreshGrades();
        }
      } else if (entity === 'attendance') {
        const dataStudentId = data?.studentId as string;
        if (dataStudentId && dataStudentId === studentData.id) {
          refreshAttendance();
        }
      } else if (entity === 'library_material') {
        refreshMaterials();
      }
    }, [studentData, refreshGrades, refreshAttendance, refreshMaterials]),
  });

  return { isConnected, isConnecting };
};

export default useStudentPortalRealtime;
