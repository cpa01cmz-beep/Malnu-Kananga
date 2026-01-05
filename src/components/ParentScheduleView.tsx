import React, { useState, useEffect } from 'react';
import { ToastType } from './Toast';
import type { ParentChild, Schedule } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';

interface ParentScheduleViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  child: ParentChild;
}

const ParentScheduleView: React.FC<ParentScheduleViewProps> = ({ onShowToast, child }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await parentsAPI.getChildSchedule(child.studentId);
        if (response.success && response.data) {
          setSchedules(response.data);
          setError(null);
        } else {
          setError(response.message || 'Gagal memuat jadwal');
        }
      } catch (err) {
        logger.error('Failed to fetch child schedule:', err);
        setError('Gagal memuat jadwal');
        onShowToast('Gagal memuat jadwal', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [child.studentId, onShowToast]);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;

  const getSchedulesByDay = (day: string) => {
    return schedules.filter(s => s.dayOfWeek === day);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Jadwal Pelajaran - {child.className}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Tidak ada jadwal tersedia untuk {child.className}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day) => {
            const daySchedules = getSchedulesByDay(day);
            if (daySchedules.length === 0) return null;

            return (
              <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">{day}</h3>
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{schedule.room}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {schedule.subjectName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {schedule.teacherName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentScheduleView;
