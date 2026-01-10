import { OCRValidationEvent } from '../types';
import { useUnifiedNotifications } from './useUnifiedNotifications';

/**
 * Legacy wrapper for backward compatibility
 * For new code, use useUnifiedNotifications hook directly
 */
export function useEventNotifications() {
  const unified = useUnifiedNotifications();

  const notifyGradeUpdate = async (
    studentName: string, 
    subject: string, 
    previousGrade?: number, 
    newGrade?: number
  ) => {
    await unified.notifyGradeUpdate(studentName, subject, previousGrade, newGrade);
  };

  const notifyPPDBStatus = async (count: number) => {
    await unified.notifyPPDBStatus(count);
  };

  const notifyLibraryUpdate = async (materialTitle: string, materialType: string) => {
    await unified.notifyLibraryUpdate(materialTitle, materialType);
  };

  const notifyMeetingRequest = async (requesterName: string, meetingType: string) => {
    await unified.notifyMeetingRequest(requesterName, meetingType);
  };

  const notifyScheduleChange = async (className: string, changeType: string) => {
    await unified.notifyScheduleChange(className, changeType);
  };

  const notifyAttendanceAlert = async (studentName: string, alertType: string) => {
    await unified.notifyAttendanceAlert(studentName, alertType);
  };

  const notifyOCRValidation = async (event: OCRValidationEvent) => {
    await unified.notifyOCRValidation(event);
  };

  const useMonitorLocalStorage = (key: string, onChange: (newValue: unknown, oldValue: unknown) => void) => {
    unified.useMonitorLocalStorage(key, onChange);
  };

  const useOCRValidationMonitor = () => {
    unified.useOCRValidationMonitor();
  };

  return {
    notifyGradeUpdate,
    notifyPPDBStatus,
    notifyLibraryUpdate,
    notifyMeetingRequest,
    notifyScheduleChange,
    notifyAttendanceAlert,
    notifyOCRValidation,
    useMonitorLocalStorage,
    useOCRValidationMonitor,
  };
}