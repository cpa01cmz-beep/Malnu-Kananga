import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ListBulletIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { ToastType } from './Toast';
import type { ParentChild, Schedule, ParentMeeting, ParentTeacher } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import CalendarView from './CalendarView';
import { TableSkeleton } from './ui/Skeleton';
import Button from './ui/Button';
import { HEIGHT_CLASSES } from '../config/heights';

interface ParentScheduleViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  child: ParentChild;
}

const ParentScheduleView: React.FC<ParentScheduleViewProps> = ({ onShowToast, child }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [meetings, setMeetings] = useState<ParentMeeting[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<ParentTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'month' | 'week' | 'day'>('list');
  const [showMeetingRequest, setShowMeetingRequest] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Schedule | ParentMeeting | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [scheduleRes, meetingsRes, teachersRes] = await Promise.all([
          parentsAPI.getChildSchedule(child.studentId),
          parentsAPI.getMeetings(child.studentId),
          parentsAPI.getAvailableTeachersForMeetings(child.studentId)
        ]);

        if (scheduleRes.success && scheduleRes.data) {
          setSchedules(scheduleRes.data);
        } else {
          setError(scheduleRes.message || 'Gagal memuat jadwal');
        }

        if (meetingsRes.success && meetingsRes.data) {
          setMeetings(meetingsRes.data);
        }

        if (teachersRes.success && teachersRes.data) {
          setAvailableTeachers(teachersRes.data);
        }
        setError(null);
      } catch (err) {
        logger.error('Failed to fetch parent data:', err);
        setError('Gagal memuat data');
        onShowToast('Gagal memuat data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [child.studentId, onShowToast]);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;

  const getSchedulesByDay = (day: string) => {
    return schedules.filter(s => s.dayOfWeek === day);
  };

  const handleEventClick = (event: Schedule | ParentMeeting) => {
    setSelectedEvent(event);
  };

  const handleMeetingRequest = async (teacherId: string, date: string, time: string, agenda: string, subject: string, _teacherName: string) => {
    try {
      const response = await parentsAPI.scheduleMeeting({
        childId: child.studentId,
        teacherId,
        subject,
        date,
        startTime: time,
        endTime: time,
        agenda,
        location: 'Online',
        notes: ''
      });

      if (response.success) {
        onShowToast('Pertemuan berhasil dijadwalkan', 'success');
        setShowMeetingRequest(false);
        
        // Refresh meetings
        const meetingsRes = await parentsAPI.getMeetings(child.studentId);
        if (meetingsRes.success && meetingsRes.data) {
          setMeetings(meetingsRes.data);
        }
      } else {
        onShowToast(response.message || 'Gagal menjadwalkan pertemuan', 'error');
      }
    } catch (err) {
      logger.error('Failed to schedule meeting:', err);
      onShowToast('Gagal menjadwalkan pertemuan', 'error');
    }
  };

  const handleDateSelect = (date: Date) => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[date.getDay()];
    if (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(dayName)) {
      setViewMode('day');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Jadwal Pelajaran - {child.className}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            {child.studentName} • {availableTeachers.length} guru tersedia untuk pertemuan
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'success' : 'ghost'}
            icon={<ListBulletIcon className="w-5 h-5" />}
            iconPosition="left"
            size="sm"
          >
            Daftar
          </Button>

          <Button
            onClick={() => setViewMode('month')}
            variant={viewMode === 'month' ? 'success' : 'ghost'}
            icon={<CalendarDaysIcon className="w-5 h-5" />}
            iconPosition="left"
            size="sm"
          >
            Kalender
          </Button>

          <Button
            onClick={() => setShowMeetingRequest(true)}
            variant="purple-solid"
            icon={<UserGroupIcon className="w-5 h-5" />}
            iconPosition="left"
          >
            <span className="text-sm font-medium">Ajak Pertemuan</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      ) : schedules.length === 0 && meetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">Tidak ada jadwal atau pertemuan tersedia untuk {child.className}</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-6">
          {days.map((day) => {
            const daySchedules = getSchedulesByDay(day);
            if (daySchedules.length === 0) return null;

            return (
              <div key={day} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">{day}</h3>
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">{schedule.room}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {schedule.subjectName}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
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
      ) : (
        <CalendarView
          schedules={schedules}
          meetings={meetings}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
        />
      )}

      {/* Meeting Request Modal */}
      {showMeetingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-2xl w-full ${HEIGHT_CLASSES.PARENT.VIEW} overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Ajukan Pertemuan dengan Guru
              </h3>
              <button
                onClick={() => setShowMeetingRequest(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {availableTeachers.map((teacher) => (
                <div key={teacher.teacherId} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {teacher.teacherName}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {teacher.subject} • {teacher.className}
                    </p>
                  </div>

                  {teacher.availableSlots && teacher.availableSlots.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Waktu Tersedia:
                      </p>
                      <div className="space-y-2">
                        {teacher.availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // Handle meeting request with this slot
                              handleMeetingRequest(
                                teacher.teacherId,
                                slot.day,
                                slot.startTime,
                                `Pertemuan orang tua dengan ${teacher.teacherName}`,
                                teacher.subject,
                                teacher.teacherName
                              );
                            }}
                            className="w-full text-left p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                          >
                            <div className="text-sm font-medium text-green-800 dark:text-green-300">
                              {slot.day}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Tidak ada jadwal tersedia
                    </p>
                  )}
                </div>
              ))}
            </div>

            {availableTeachers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Tidak ada guru yang tersedia untuk pertemuan saat ini
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {'status' in selectedEvent ? 'Detail Pertemuan' : 'Detail Jadwal'}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {'status' in selectedEvent ? (
                <>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Jenis</label>
                    <p className="font-medium text-neutral-900 dark:text-white">Pertemuan Orang Tua-Guru</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Guru</label>
                    <p className="font-medium text-neutral-900 dark:text-white">{selectedEvent.teacherName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Tanggal</label>
                    <p className="font-medium text-neutral-900 dark:text-white">{selectedEvent.date}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Waktu</label>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Status</label>
                    <p className={`font-medium
                      ${selectedEvent.status === 'scheduled' ? 'text-blue-600 dark:text-blue-400' : ''}
                      ${selectedEvent.status === 'completed' ? 'text-green-600 dark:text-green-400' : ''}
                      ${selectedEvent.status === 'cancelled' ? 'text-red-600 dark:text-red-400' : ''}`}
                    >
                      {selectedEvent.status === 'scheduled' ? 'Terjadwal' : 
                       selectedEvent.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                    </p>
                  </div>
                  {selectedEvent.agenda && (
                    <div>
                      <label className="text-sm text-neutral-500 dark:text-neutral-400">Agenda</label>
                      <p className="font-medium text-neutral-900 dark:text-white">{selectedEvent.agenda}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Mata Pelajaran</label>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {selectedEvent.subjectName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Guru</label>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {selectedEvent.teacherName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Waktu</label>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {selectedEvent.startTime} - {selectedEvent.endTime}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentScheduleView;
