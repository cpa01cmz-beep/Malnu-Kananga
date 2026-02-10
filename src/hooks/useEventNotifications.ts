import { useCallback } from 'react';
import { OCRValidationEvent } from '../types';
import { useUnifiedNotifications } from './useUnifiedNotifications';

/**
 * Legacy wrapper for backward compatibility
 * For new code, use useUnifiedNotifications hook directly
 */
export function useEventNotifications() {
  const unified = useUnifiedNotifications();
  
  // Destructure to avoid exhaustive-deps warnings
  const {
    notifyGradeUpdate: unifiedNotifyGradeUpdate,
    notifyPPDBStatus: unifiedNotifyPPDBStatus,
    notifyLibraryUpdate: unifiedNotifyLibraryUpdate,
    notifyAssignmentCreate: unifiedNotifyAssignmentCreate,
    notifyAssignmentSubmit: unifiedNotifyAssignmentSubmit,
    notifyMeetingRequest: unifiedNotifyMeetingRequest,
    notifyScheduleChange: unifiedNotifyScheduleChange,
    notifyAttendanceAlert: unifiedNotifyAttendanceAlert,
    notifyOCRValidation: unifiedNotifyOCRValidation,
    useMonitorLocalStorage: unifiedUseMonitorLocalStorage,
    useOCRValidationMonitor: unifiedUseOCRValidationMonitor,
  } = unified;

  const notifyGradeUpdate = useCallback(async (
    studentName: string, 
    subject: string, 
    previousGrade?: number, 
    newGrade?: number
  ) => {
    await unifiedNotifyGradeUpdate(studentName, subject, previousGrade, newGrade);
  }, [unifiedNotifyGradeUpdate]);

  const notifyPPDBStatus = useCallback(async (count: number) => {
    await unifiedNotifyPPDBStatus(count);
  }, [unifiedNotifyPPDBStatus]);

  const notifyLibraryUpdate = useCallback(async (materialTitle: string, materialType: string) => {
    await unifiedNotifyLibraryUpdate(materialTitle, materialType);
  }, [unifiedNotifyLibraryUpdate]);

  const notifyAssignmentCreate = useCallback(async (assignmentId: string, title: string) => {
    await unifiedNotifyAssignmentCreate(assignmentId, title);
  }, [unifiedNotifyAssignmentCreate]);

  const notifyAssignmentSubmit = useCallback(async (assignmentId: string, submissionId: string, title: string) => {
    await unifiedNotifyAssignmentSubmit(assignmentId, submissionId, title);
  }, [unifiedNotifyAssignmentSubmit]);

  const notifyMeetingRequest = useCallback(async (requesterName: string, meetingType: string) => {
    await unifiedNotifyMeetingRequest(requesterName, meetingType);
  }, [unifiedNotifyMeetingRequest]);

  const notifyScheduleChange = useCallback(async (className: string, changeType: string) => {
    await unifiedNotifyScheduleChange(className, changeType);
  }, [unifiedNotifyScheduleChange]);

  const notifyAttendanceAlert = useCallback(async (studentName: string, alertType: string) => {
    await unifiedNotifyAttendanceAlert(studentName, alertType);
  }, [unifiedNotifyAttendanceAlert]);

  const notifyOCRValidation = useCallback(async (event: OCRValidationEvent) => {
    await unifiedNotifyOCRValidation(event);
  }, [unifiedNotifyOCRValidation]);

  const useMonitorLocalStorage = useCallback((key: string, onChange: (newValue: unknown, oldValue: unknown) => void) => {
    unifiedUseMonitorLocalStorage(key, onChange);
  }, [unifiedUseMonitorLocalStorage]);

  const useOCRValidationMonitor = useCallback(() => {
    unifiedUseOCRValidationMonitor();
  }, [unifiedUseOCRValidationMonitor]);

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