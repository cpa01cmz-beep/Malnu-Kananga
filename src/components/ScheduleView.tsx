import React, { useState, useEffect } from 'react';
import { schedulesAPI, subjectsAPI } from '../services/apiService';
import { Schedule, Subject } from '../types';

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface DailySchedule {
  [day: string]: ScheduleItem[];
}

interface ScheduleViewProps {
  onBack: () => void;
  className?: string;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const ScheduleView: React.FC<ScheduleViewProps> = ({ onBack, className = 'XII IPA 1' }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState('Senin');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedulesRes, subjectsRes] = await Promise.all([
        schedulesAPI.getAll(),
        subjectsAPI.getAll(),
      ]);

      if (schedulesRes.success && schedulesRes.data && subjectsRes.success && subjectsRes.data) {
        setSchedules(schedulesRes.data);
        setSubjects(subjectsRes.data);
      } else {
        setError(schedulesRes.message || 'Gagal mengambil data jadwal');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data jadwal');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.name || 'Unknown';
  };

  const getTeacherName = (teacherId: string): string => {
    return teacherId || 'Guru';
  };

  const formatTime = (time: string): string => {
    return time.slice(0, 5);
  };

  const groupSchedulesByDay = (): DailySchedule => {
    const grouped: DailySchedule = {
      Senin: [],
      Selasa: [],
      Rabu: [],
      Kamis: [],
      Jumat: [],
    };

    schedules.forEach((schedule) => {
      const day = schedule.dayOfWeek;
      if (day && grouped[day]) {
        grouped[day].push({
          id: schedule.id,
          time: `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`,
          subject: getSubjectName(schedule.subjectId),
          teacher: getTeacherName(schedule.teacherId),
          room: schedule.room,
        });
      }
    });

    DAYS.forEach((day) => {
      grouped[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  };

  const dailySchedule = groupSchedulesByDay();

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Pelajaran</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Pelajaran</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchSchedules}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
            ← Kembali ke Portal
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Pelajaran</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Kelas: <strong>{className}</strong> • Semester Ganjil
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-4 gap-2 scrollbar-hide">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeDay === day
                ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Jadwal Hari {activeDay}</h3>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {dailySchedule[activeDay].length > 0 ? (
            dailySchedule[activeDay].map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 flex-shrink-0">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400 block">
                      {item.time.split(' - ')[0]}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">s.d. {item.time.split(' - ')[1]}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.subject}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {item.teacher}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-medium px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                    {item.room}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Tidak ada jadwal untuk hari ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
