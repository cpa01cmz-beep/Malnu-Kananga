import { logger } from '../utils/logger';
import { OCRValidationEvent } from '../types';

/**
 * Legacy wrapper for backward compatibility
 * For new code, use useUnifiedNotifications hook directly
 */
export function useEventNotifications() {
  const notifyGradeUpdate = async (
    studentName: string, 
    subject: string, 
    previousGrade?: number, 
    newGrade?: number
  ) => {
    try {
      const title = `Nilai Update: ${subject}`;
      let body = `Nilai ${studentName} untuk ${subject}`;
      
      if (previousGrade && newGrade) {
        const difference = newGrade - previousGrade;
        const trend = difference > 0 ? 'naik' : difference < 0 ? 'turun' : 'tetap';
        body += ` ${trend} dari ${previousGrade} ke ${newGrade}`;
      } else if (newGrade) {
        body += `: ${newGrade}`;
      }

      // This would delegate to the unified notification manager
      // For now, keeping the old behavior
      logger.info('Grade notification (legacy):', { title, body, studentName, subject, previousGrade, newGrade });
    } catch (error) {
      logger.error('Failed to send grade notification (legacy):', error);
    }
  };

  const notifyPPDBStatus = async (count: number) => {
    if (count <= 0) return;
    
    try {
      const title = 'Pendaftaran Baru PPDB';
      const body = `Ada ${count} pendaftaran PPDB yang menunggu persetujuan`;

      logger.info('PPDB notification (legacy):', { title, body, count });
    } catch (error) {
      logger.error('Failed to send PPDB notification (legacy):', error);
    }
  };

  const notifyLibraryUpdate = async (materialTitle: string, materialType: string) => {
    try {
      const title = 'Materi Baru';
      const body = `${materialType}: ${materialTitle} tersedia di e-library`;

      logger.info('Library notification (legacy):', { title, body, materialTitle, materialType });
    } catch (error) {
      logger.error('Failed to send library notification (legacy):', error);
    }
  };

  const notifyMeetingRequest = async (requesterName: string, meetingType: string) => {
    try {
      const title = 'Permintaan Pertemuan';
      const body = `${requesterName} meminta ${meetingType.toLowerCase()}`;

      logger.info('Meeting notification (legacy):', { title, body, requesterName, meetingType });
    } catch (error) {
      logger.error('Failed to send meeting notification (legacy):', error);
    }
  };

  const notifyScheduleChange = async (className: string, changeType: string) => {
    try {
      const title = 'Perubahan Jadwal';
      const body = `Jadwal ${className}: ${changeType}`;

      logger.info('Schedule notification (legacy):', { title, body, className, changeType });
    } catch (error) {
      logger.error('Failed to send schedule notification (legacy):', error);
    }
  };

  const notifyAttendanceAlert = async (studentName: string, alertType: string) => {
    try {
      const title = 'Alert Kehadiran';
      const body = `${studentName}: ${alertType}`;

      logger.info('Attendance notification (legacy):', { title, body, studentName, alertType });
    } catch (error) {
      logger.error('Failed to send attendance notification (legacy):', error);
    }
  };

  const notifyOCRValidation = async (event: OCRValidationEvent) => {
    try {
      const severity = event.type === 'validation-failure' ? 'Gagal' : 
                      event.type === 'validation-warning' ? 'Peringatan' : 'Berhasil';
      
      const title = `Validasi OCR ${severity}`;
      const body = `Dokumen ${event.documentType} - Confidence: ${event.confidence}%. ${event.issues.length > 0 ? `Issues: ${event.issues.join(', ')}` : 'Validasi berhasil'}`;

      logger.info('OCR validation notification (legacy):', { title, body, event });
    } catch (error) {
      logger.error('Failed to send OCR validation notification (legacy):', error);
    }
  };

  // Monitor for changes in localStorage data and trigger notifications
  const useMonitorLocalStorage = (key: string, onChange: (newValue: unknown, oldValue: unknown) => void) => {
    import('react').then(({ useEffect }) => {
      useEffect(() => {
        /* eslint-disable no-undef */
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === key && e.newValue) {
            try {
              const newValue = JSON.parse(e.newValue);
              const oldValue = JSON.parse(e.oldValue || '{}');
              onChange(newValue, oldValue);
            } catch (error) {
              logger.error(`Error parsing localStorage change for ${key} (legacy):`, error);
            }
          }
        };

        // Check immediately
        const checkNow = () => {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const newValue = JSON.parse(stored);
              onChange(newValue, {});
            } catch (error) {
              logger.error(`Error parsing localStorage for ${key} (legacy):`, error);
            }
          }
        };
        /* eslint-enable no-undef */

        window.addEventListener('storage', handleStorageChange);
        
        // Check on mount and periodically
        checkNow();
        const interval = setInterval(checkNow, 30000); // Check every 30 seconds

        return () => {
          window.removeEventListener('storage', handleStorageChange);
          clearInterval(interval);
        };
      }, [key, onChange]);
    });
  };

  // Listen for OCR validation events
  const useOCRValidationMonitor = () => {
    import('react').then(({ useEffect }) => {
      useEffect(() => {
        const handleOCRValidation = (event: Event) => {
          const customEvent = event as CustomEvent;
          const ocrEvent = customEvent.detail as OCRValidationEvent;
          notifyOCRValidation(ocrEvent);
        };

        window.addEventListener('ocrValidation', handleOCRValidation);
        return () => {
          window.removeEventListener('ocrValidation', handleOCRValidation);
        };
      }, []);
    });
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