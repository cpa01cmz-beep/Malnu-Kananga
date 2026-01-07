import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { Schedule, ParentMeeting } from '../types';

interface CalendarViewProps {
  schedules: Schedule[];
  meetings?: ParentMeeting[];
  viewMode: 'month' | 'week' | 'day';
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: Schedule | ParentMeeting) => void;
  className?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  schedules,
  meetings = [],
  viewMode,
  onDateSelect,
  onEventClick,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dayOfWeek = fullDayNames[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];

    const daySchedules = schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
    const dayMeetings = meetings.filter(meeting => meeting.date === dateStr);

    return [...daySchedules, ...dayMeetings];
  };

  // Navigation functions
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Generate calendar days for month view
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleEventClick = (event: Schedule | ParentMeeting, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  const renderMonthView = () => (
    <div className="bg-white rounded-lg shadow" role="grid" aria-label="Kalender bulanan">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900" id="month-calendar-heading">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Bulan berikutnya"
        >
          <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b" role="row">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-700" role="columnheader" aria-label={fullDayNames[dayNames.indexOf(day)]}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7" role="rowgroup">
        {monthDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const events = getEventsForDate(date);
          const fullDateLabel = `${fullDayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

          return (
            <div
              key={index}
              role="gridcell"
              onClick={() => handleDateClick(date)}
              className={`min-h-[100px] p-2 border-r border-b cursor-pointer transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${isToday ? 'bg-blue-50' : ''}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
                hover:bg-gray-50`}
              aria-label={fullDateLabel}
              aria-selected={isSelected}
              tabIndex={isToday ? 0 : -1}
            >
              <div className={`text-sm font-medium mb-1
                ${isToday ? 'text-blue-600' : 'text-gray-900'}`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {events.slice(0, 3).map((event, idx) => {
                  const isMeeting = 'status' in event;
                  return (
                    <div
                      key={idx}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`text-xs p-1 rounded truncate cursor-pointer
                        ${isMeeting 
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                      role="button"
                      tabIndex={0}
                    >
{event.startTime && `${event.startTime} `}
{'subjectName' in event ? event.subjectName : ('status' in event ? event.subject : 'Agenda')}
                    </div>
                  );
                })}
                {events.length > 3 && (
                  <div className="text-xs text-gray-500">+{events.length - 3} lagi</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white rounded-lg shadow" role="grid" aria-label="Kalender mingguan">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={previousWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Minggu sebelumnya"
        >
          <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900" id="week-calendar-heading">
          {weekDays[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {' '}
          {weekDays[6].toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={nextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Minggu berikutnya"
        >
          <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-8" role="row">
        {/* Time column header */}
        <div className="p-2 border-r border-b bg-gray-50 text-sm font-medium text-gray-700" role="columnheader">
          Waktu
        </div>
        {/* Day headers */}
        {weekDays.map(date => (
          <div key={date.toISOString()} className="p-2 border-r border-b text-center" role="columnheader" aria-label={fullDayNames[date.getDay()]}>
            <div className="text-xs font-medium text-gray-500">{dayNames[date.getDay()]}</div>
            <div className={`text-sm font-bold
              ${date.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-900'}`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      {Array.from({ length: 14 }, (_, i) => i + 6).map(hour => (
        <div key={hour} className="grid grid-cols-8" role="row">
          {/* Time label */}
          <div className="p-2 border-r border-b text-sm text-gray-600 text-right" role="gridcell">
            {hour.toString().padStart(2, '0')}:00
          </div>
          {/* Day columns */}
          {weekDays.map(date => {
            const events = getEventsForDate(date).filter(event => {
              if (!event.startTime) return false;
              const eventHour = parseInt(event.startTime.split(':')[0]);
              return eventHour === hour;
            });

            return (
              <div
                key={`${date.toISOString()}-${hour}`}
                onClick={() => handleDateClick(date)}
                className={`min-h-[60px] p-1 border-r border-b cursor-pointer
                  ${date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : 'bg-white'}
                  hover:bg-gray-50`}
                role="gridcell"
                aria-label={`${fullDayNames[date.getDay()]} ${date.getDate()}, ${hour}:00`}
              >
                <div className="space-y-1">
                  {events.map((event, idx) => {
                    const isMeeting = 'status' in event;
                    return (
                      <div
                        key={idx}
                        onClick={(e) => handleEventClick(event, e)}
                        className={`text-xs p-1 rounded truncate cursor-pointer
                          ${isMeeting 
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                        role="button"
                        tabIndex={0}
                      >
{event.startTime && `${event.startTime} `}
{'subjectName' in event ? event.subjectName : ('status' in event ? event.subject : 'Agenda')}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    const sortedEvents = events.sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });

    return (
      <div className="bg-white rounded-lg shadow" aria-label="Kalender harian">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={previousDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Hari sebelumnya"
          >
            <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900" id="day-calendar-heading">
            {currentDate.toLocaleDateString('id-ID', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          <button
            onClick={nextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Hari berikutnya"
          >
            <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Events list */}
        <div className="p-4" role="list" aria-label="Daftar jadwal dan pertemuan">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
              <CalendarDaysIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
              <p>Tidak ada jadwal atau pertemuan pada hari ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEvents.map((event, index) => {
                const isMeeting = 'status' in event;
                return (
                  <div
                    key={index}
                    role="listitem"
                    onClick={() => onEventClick?.(event)}
                    className="p-4 border rounded-lg cursor-pointer transition-all
                      hover:shadow-md hover:border-gray-300"
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${isMeeting 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'}`}
                          >
                            {isMeeting ? 'Pertemuan' : 'Jadwal'}
                          </span>
                          {event.startTime && (
                            <span className="text-sm text-gray-600">
                              {event.startTime} - {event.endTime || 'Selesai'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {'subjectName' in event ? event.subjectName : ('subject' in event ? event.subject : 'Pertemuan')}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {'teacherName' in event ? event.teacherName : event.teacherName}
                        </p>
                        {'room' in event && event.room && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Ruangan:</span> {event.room}
                          </p>
                        )}
                        {isMeeting && (
                          <div className="mt-2 text-sm">
                            <p className={`font-medium
                              ${event.status === 'scheduled' ? 'text-blue-600' : ''}
                              ${event.status === 'completed' ? 'text-green-600' : ''}
                              ${event.status === 'cancelled' ? 'text-red-600' : ''}`}
                            >
                              Status: {event.status === 'scheduled' ? 'Terjadwal' : 
                                      event.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                            </p>
                            {event.agenda && (
                              <p className="text-gray-600 mt-1">
                                <span className="font-medium">Agenda:</span> {event.agenda}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className} role="region" aria-label="Kalender jadwal">
      {/* View mode selector */}
      <div className="mb-4 flex gap-2" role="toolbar" aria-label="Mode tampilan kalender">
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Kembali ke hari ini"
        >
          Hari Ini
        </button>
        <div className="flex bg-white border rounded-lg" role="group" aria-label="Pilihan tampilan">
          {(['month', 'week', 'day'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => {/* View mode change handled by parent */}}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${viewMode === mode 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'}`}
              aria-label={`Tampilan ${mode === 'month' ? 'bulanan' : mode === 'week' ? 'mingguan' : 'harian'}`}
              aria-pressed={viewMode === mode}
            >
              {mode === 'month' ? 'Bulan' : mode === 'week' ? 'Minggu' : 'Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar views */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};

export default CalendarView;