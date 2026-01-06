import React, { useState, useEffect } from 'react';

import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import { ToastType } from './Toast';
import type { ParentChild, ParentTeacher, ParentMeeting } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { validateAndSanitizeMeeting, validateParentMeeting } from '../utils/parentValidation';

interface ParentMeetingsViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  children: ParentChild[];
}

const ParentMeetingsView: React.FC<ParentMeetingsViewProps> = ({ onShowToast, children }) => {
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<ParentTeacher[]>([]);
  const [meetings, setMeetings] = useState<ParentMeeting[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<ParentTeacher | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; startTime: string; endTime: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [agenda, setAgenda] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, [children]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedChild) return;

      setLoading(true);
      try {
        const [meetingsResponse, teachersResponse] = await Promise.all([
          parentsAPI.getMeetings(selectedChild.studentId),
          parentsAPI.getAvailableTeachersForMeetings(selectedChild.studentId)
        ]);

        if (meetingsResponse.success) {
          setMeetings(meetingsResponse.data || []);
        }

        if (teachersResponse.success) {
          setAvailableTeachers(teachersResponse.data || []);
        }
      } catch (error) {
        logger.error('Failed to fetch meetings data:', error);
        onShowToast('Gagal memuat data pertemuan', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedChild, onShowToast]);

  const handleScheduleMeeting = async () => {
    if (!selectedChild || !selectedTeacher || !selectedSlot || !selectedDate || !agenda.trim()) {
      onShowToast('Mohon lengkapi semua field', 'error');
      return;
    }

    const meetingInput = {
      childId: selectedChild.studentId,
      teacherId: selectedTeacher.teacherId,
      subject: selectedTeacher.subject,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      agenda: agenda.trim(),
      location: 'Ruang Guru'
    };

    const validation = validateAndSanitizeMeeting(meetingInput);
    if (!validation.isValid) {
      onShowToast('Validasi gagal: ' + validation.errors.join(', '), 'error');
      return;
    }

    setScheduling(true);
    try {
      const response = await parentsAPI.scheduleMeeting(validation.sanitized!);

      if (response.success && response.data) {
        const newMeeting: ParentMeeting = {
          ...response.data,
          childName: selectedChild.studentName,
          teacherName: selectedTeacher.teacherName
        };

        const meetingValidation = validateParentMeeting(newMeeting);
        if (!meetingValidation.isValid) {
          logger.error('Server returned invalid meeting data:', meetingValidation.errors);
        }

        setMeetings([newMeeting, ...meetings]);
        setAgenda('');
        setSelectedDate('');
        setSelectedSlot(null);
        setShowScheduleForm(false);
        onShowToast('Pertemuan berhasil dijadwalkan', 'success');
      } else {
        onShowToast('Gagal menjadwalkan pertemuan', 'error');
      }
    } catch (error) {
      logger.error('Failed to schedule meeting:', error);
      onShowToast('Gagal menjadwalkan pertemuan', 'error');
    } finally {
      setScheduling(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: ParentMeeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: ParentMeeting['status']) => {
    switch (status) {
      case 'scheduled': return 'Terjadwal';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Pertemuan</h2>
          <div className="flex items-center gap-4">
            {children.length > 1 && (
              <select
                value={selectedChild?.studentId || ''}
                onChange={(e) => setSelectedChild(children.find(c => c.studentId === e.target.value) || null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {children.map((child) => (
                  <option key={child.studentId} value={child.studentId}>
                    {child.studentName}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <CalendarDaysIcon />
              Jadwalkan Pertemuan
            </button>
          </div>
        </div>

        {/* Schedule Meeting Form */}
        {showScheduleForm && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jadwalkan Pertemuan Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guru
                </label>
                <select
                  value={selectedTeacher?.teacherId || ''}
                  onChange={(e) => {
                    const teacher = availableTeachers.find(t => t.teacherId === e.target.value);
                    setSelectedTeacher(teacher || null);
                    setSelectedSlot(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Pilih Guru</option>
                  {availableTeachers.map((teacher) => (
                    <option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.teacherName} - {teacher.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal
                </label>
                <input
                  id="meeting-date"
                  name="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoComplete="date"
                />
              </div>

              {selectedTeacher && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slot Waktu Tersedia
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedTeacher.availableSlots?.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                          selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="text-sm font-medium">{slot.day}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agenda Pertemuan
                </label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Jelaskan topik yang akan dibahas..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowScheduleForm(false);
                  setSelectedTeacher(null);
                  setSelectedDate('');
                  setSelectedSlot(null);
                  setAgenda('');
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleScheduleMeeting}
                disabled={scheduling || !selectedTeacher || !selectedDate || !selectedSlot || !agenda.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {scheduling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CalendarDaysIcon />
                )}
                Jadwalkan
              </button>
            </div>
          </div>
        )}

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDaysIcon />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Belum ada pertemuan terjadwal</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Klik tombol di atas untuk menjadwalkan pertemuan
              </p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div key={meeting.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <AcademicCapIcon />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Pertemuan dengan {meeting.teacherName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {meeting.subject} - {meeting.childName}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Waktu:</strong> {formatDateTime(meeting.date, meeting.startTime)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Lokasi:</strong> {meeting.location}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <strong>Agenda:</strong> {meeting.agenda}
                    </p>
                    {meeting.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Catatan:</strong> {meeting.notes}
                      </p>
                    )}
                  </div>
                  <div className="ml-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {getStatusText(meeting.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tips Pertemuan Efektif</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>• Datang tepat waktu</div>
          <div>• Bawa daftar pertanyaan</div>
          <div>• Fokus pada topik pendidikan</div>
          <div>• Catat poin-poin penting</div>
          <div>• Hormati waktu guru</div>
          <div>• Diskusikan follow-up actions</div>
        </div>
      </div>
    </div>
  );
};

export default ParentMeetingsView;