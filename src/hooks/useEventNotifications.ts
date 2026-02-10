import { useCallback } from 'react';
import { OCRValidationEvent } from '../types';
import { useUnifiedNotifications } from './useUnifiedNotifications';

/**
 * Legacy wrapper for backward compatibility
 * For new code, use useUnifiedNotifications hook directly
 */
export function useEventNotifications() {
  const unified = useUnifiedNotifications();

  const notifyGradeUpdate = useCallback(async (
    studentName: string,
    subject: string,
    previousGrade?: number,
    newGrade?: number
  ) => {
    await unified.notifyGradeUpdate(studentName, subject, previousGrade, newGrade);
  }, [unified]);

  const notifyPPDBStatus = useCallback(async (count: number) => {
    await unified.notifyPPDBStatus(count);
  }, [unified]);

  const notifyLibraryUpdate = useCallback(async (materialTitle: string, materialType: string) => {
    await unified.notifyLibraryUpdate(materialTitle, materialType);
  }, [unified]);

  const notifyAssignmentCreate = useCallback(async (assignmentId: string, title: string) => {
    await unified.notifyAssignmentCreate(assignmentId, title);
  }, [unified]);

  const notifyAssignmentSubmit = useCallback(async (assignmentId: string, submissionId: string, title: string) => {
    await unified.notifyAssignmentSubmit(assignmentId, submissionId, title);
  }, [unified]);

  const notifyMeetingRequest = useCallback(async (requesterName: string, meetingType: string) => {
    await unified.notifyMeetingRequest(requesterName, meetingType);
  }, [unified]);

  const notifyScheduleChange = useCallback(async (className: string, changeType: string) => {
    await unified.notifyScheduleChange(className, changeType);
  }, [unified]);

  const notifyAttendanceAlert = useCallback(async (studentName: string, alertType: string) => {
    await unified.notifyAttendanceAlert(studentName, alertType);
  }, [unified]);

  const notifyOCRValidation = useCallback(async (event: OCRValidationEvent) => {
    await unified.notifyOCRValidation(event);
  }, [unified]);

  const useMonitorLocalStorage = useCallback((key: string, onChange: (newValue: unknown, oldValue: unknown) => void) => {
    unified.useMonitorLocalStorage(key, onChange);
  }, [unified]);

  const useOCRValidationMonitor = useCallback(() => {
    unified.useOCRValidationMonitor();
  }, [unified]);

  return {
    notifyGradeUpdate,
    notifyPPDBStatus,
    notifyLibraryUpdate,
    notifyAssignmentCreate,
    notifyAssignmentSubmit,
    notifyMeetingRequest,
    notifyScheduleChange,
    notifyAttendanceAlert,
    notifyOCRValidation,
    useMonitorLocalStorage,
    useOCRValidationMonitor,
  };
}