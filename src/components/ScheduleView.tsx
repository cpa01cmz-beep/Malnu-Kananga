import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { schedulesAPI, subjectsAPI } from '../services/apiService';
import { Schedule, Subject, ParentMeeting } from '../types';
import { logger } from '../utils/logger';
import CalendarView from './CalendarView';
import PageHeader from './ui/PageHeader';
import { TableSkeleton } from './ui/Skeleton';
import ErrorMessage from './ui/ErrorMessage';

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
  const [viewMode, setViewMode] = useState<'list' | 'month' | 'week' | 'day'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);

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
      logger.error('Error fetching schedules:', err);
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

const handleEventClick = (event: Schedule | ParentMeeting) => {
    if ('classId' in event) {
      setSelectedEvent(event);
    }
  };

  const handleDateSelect = (date: Date) => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[date.getDay()];
    if (DAYS.includes(dayName)) {
      setActiveDay(dayName);
      setViewMode('list');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Jadwal Pelajaran"
          showBackButton={true}
          onBackButtonClick={onBack}
          backButtonLabel="Kembali ke Portal"
        />
        <TableSkeleton rows={8} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Jadwal Pelajaran"
          showBackButton={true}
          onBackButtonClick={onBack}
          backButtonLabel="Kembali ke Portal"
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <ErrorMessage
            title="Error Loading Schedule"
            message={error}
            variant="card"
          />
          <Button
            onClick={fetchSchedules}
            variant="red-solid"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Jadwal Pelajaran"
        subtitle={`Kelas: ${className} • Semester Ganjil`}
        showBackButton={true}
        onBackButtonClick={onBack}
        backButtonLabel="Kembali ke Portal"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2
                ${viewMode === 'list'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'} border`}
            >
              <ListBulletIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Daftar</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2
                ${viewMode === 'month'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'} border`}
            >
              <CalendarDaysIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Kalender</span>
            </button>
          </div>
        }
      />

      {viewMode === 'list' && (
        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 scrollbar-hide">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeDay === day
                  ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <h3 className="font-bold text-lg text-neutral-800 dark:text-white">Jadwal Hari {activeDay}</h3>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {dailySchedule[activeDay].length > 0 ? (
              dailySchedule[activeDay].map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 block">
                        {item.time.split(' - ')[0]}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">s.d. {item.time.split(' - ')[1]}</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-neutral-900 dark:text-white">{item.subject}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                          {item.teacher}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-medium px-2 py-1 rounded-full border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400">
                      {item.room}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                Tidak ada jadwal untuk hari ini.
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode !== 'list' && (
        <CalendarView
          schedules={schedules}
          viewMode={viewMode}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          className="mb-6"
        />
      )}

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50% flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Detail Jadwal
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-neutral-500 dark:text-neutral-400">Mata Pelajaran</label>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {getSubjectName(selectedEvent.subjectId)}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-neutral-500 dark:text-neutral-400">Guru</label>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {getTeacherName(selectedEvent.teacherId)}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-neutral-500 dark:text-neutral-400">Waktu</label>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-neutral-500 dark:text-neutral-400">Hari</label>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {selectedEvent.dayOfWeek}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-neutral-500 dark:text-neutral-400">Ruangan</label>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {selectedEvent.room}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;