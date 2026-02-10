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
  }, [unified.notifyGradeUpdate]);

  const notifyPPDBStatus = useCallback(async (count: number) => {
    await unified.notifyPPDBStatus(count);
  }, [unified.notifyPPDBStatus]);

  const notifyLibraryUpdate = useCallback(async (materialTitle: string, materialType: string) => {
    await unified.notifyLibraryUpdate(materialTitle, materialType);
  }, [unified.notifyLibraryUpdate]);

  const notifyAssignmentCreate = useCallback(async (assignmentId: string, title: string) => {
    await unified.notifyAssignmentCreate(assignmentId, title);
  }, [unified.notifyAssignmentCreate]);

  const notifyAssignmentSubmit = useCallback(async (assignmentId: string, submissionId: string, title: string) => {
    await unified.notifyAssignmentSubmit(assignmentId, submissionId, title);
  }, [unified.notifyAssignmentSubmit]);

  const notifyMeetingRequest = useCallback(async (requesterName: string, meetingType: string) => {
    await unified.notifyMeetingRequest(requesterName, meetingType);
  }, [unified.notifyMeetingRequest]);

  const notifyScheduleChange = useCallback(async (className: string, changeType: string) => {
    await unified.notifyScheduleChange(className, changeType);
  }, [unified.notifyScheduleChange]);

  const notifyAttendanceAlert = useCallback(async (studentName: string, alertType: string) => {
    await unified.notifyAttendanceAlert(studentName, alertType);
  }, [unified.notifyAttendanceAlert]);

  const notifyOCRValidation = useCallback(async (event: OCRValidationEvent) => {
    await unified.notifyOCRValidation(event);
  }, [unified.notifyOCRValidation]);

  const useMonitorLocalStorage = useCallback((key: string, onChange: (newValue: unknown, oldValue: unknown) => void) => {
    unified.useMonitorLocalStorage(key, onChange);
  }, [unified.useMonitorLocalStorage]);

  const useOCRValidationMonitor = useCallback(() => {
    unified.useOCRValidationMonitor();
  }, [unified.useOCRValidationMonitor]);

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