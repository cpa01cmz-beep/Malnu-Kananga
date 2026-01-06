import { usePushNotifications } from './usePushNotifications';
import { useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook to automatically trigger notifications for common app events
 */
export function useEventNotifications() {
  const { showNotification, createNotification } = usePushNotifications();
  const lastCheckedRef = useRef<{ [key: string]: number }>({});

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

      await showNotification(
        createNotification('grade', title, body, {
          type: 'grade_update',
          studentName,
          subject,
          previousGrade,
          newGrade,
        })
      );
    } catch (error) {
      logger.error('Failed to send grade notification:', error);
    }
  };

  const notifyPPDBStatus = async (count: number) => {
    if (count <= 0) return;
    
    try {
      const title = 'Pendaftaran Baru PPDB';
      const body = `Ada ${count} pendaftaran PPDB yang menunggu persetujuan`;

      await showNotification(
        createNotification('ppdb', title, body, {
          type: 'ppdb_update',
          count,
        })
      );
    } catch (error) {
      logger.error('Failed to send PPDB notification:', error);
    }
  };

  const notifyLibraryUpdate = async (materialTitle: string, materialType: string) => {
    try {
      const title = 'Materi Baru';
      const body = `${materialType}: ${materialTitle} tersedia di e-library`;

      await showNotification(
        createNotification('library', title, body, {
          type: 'library_update',
          materialTitle,
          materialType,
        })
      );
    } catch (error) {
      logger.error('Failed to send library notification:', error);
    }
  };

  const notifyMeetingRequest = async (requesterName: string, meetingType: string) => {
    try {
      const title = 'Permintaan Pertemuan';
      const body = `${requesterName} meminta ${meetingType.toLowerCase()}`;

      await showNotification(
        createNotification('event', title, body, {
          type: 'meeting_request',
          requesterName,
          meetingType,
        })
      );
    } catch (error) {
      logger.error('Failed to send meeting notification:', error);
    }
  };

  const notifyScheduleChange = async (className: string, changeType: string) => {
    try {
      const title = 'Perubahan Jadwal';
      const body = `Jadwal ${className}: ${changeType}`;

      await showNotification(
        createNotification('announcement', title, body, {
          type: 'schedule_change',
          className,
          changeType,
        })
      );
    } catch (error) {
      logger.error('Failed to send schedule notification:', error);
    }
  };

  const notifyAttendanceAlert = async (studentName: string, alertType: string) => {
    try {
      const title = 'Alert Kehadiran';
      const body = `${studentName}: ${alertType}`;

      await showNotification(
        createNotification('system', title, body, {
          type: 'attendance_alert',
          studentName,
          alertType,
        })
      );
    } catch (error) {
      logger.error('Failed to send attendance notification:', error);
    }
  };

  // Monitor for changes in localStorage data and trigger notifications
  const useMonitorLocalStorage = (key: string, onChange: (newValue: unknown, oldValue: unknown) => void) => {
    useEffect(() => {
      /* eslint-disable no-undef */
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.newValue) {
          try {
            const newValue = JSON.parse(e.newValue);
            const oldValue = JSON.parse(e.oldValue || '{}');
            onChange(newValue, oldValue);
          } catch (error) {
            logger.error(`Error parsing localStorage change for ${key}:`, error);
          }
        }
      };

      // Check immediately
      const checkNow = () => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const newValue = JSON.parse(stored);
            const lastChecked = lastCheckedRef.current[key] || 0;
            if (Date.now() - lastChecked > 5000) { // Avoid too frequent checks
              onChange(newValue, {});
              lastCheckedRef.current[key] = Date.now();
            }
          } catch (error) {
            logger.error(`Error parsing localStorage for ${key}:`, error);
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
  };

  return {
    notifyGradeUpdate,
    notifyPPDBStatus,
    notifyLibraryUpdate,
    notifyMeetingRequest,
    notifyScheduleChange,
    notifyAttendanceAlert,
    useMonitorLocalStorage,
  };
}