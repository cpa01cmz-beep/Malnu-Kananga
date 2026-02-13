import React, { useState, useEffect, useCallback } from 'react';
import { studentTimelineService } from '../../services/studentTimelineService';
import { pdfExportService } from '../../services/pdfExportService';
import { logger } from '../../utils/logger';
import { PAGINATION_DEFAULTS } from '../../constants';
import type {
  TimelineEvent,
  TimelineEventType,
  TimelineFilter,
  TimelineStats,
  TimelineOptions,
} from '../../types/timeline';
import type { UserRole } from '../../types/common';

interface StudentTimelineProps {
  studentId: string;
  studentName?: string;
  userRole: UserRole;
  className?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

const EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  grade: 'Nilai',
  assignment: 'Tugas',
  submission: 'Pengumpulan',
  attendance: 'Absensi',
  material_access: 'Akses Materi',
  material_download: 'Unduh Materi',
  material_rating: 'Rating Materi',
  material_bookmark: 'Penanda Buku',
  message_sent: 'Pesan Terkirim',
  message_received: 'Pesan Diterima',
  announcement: 'Pengumuman',
  event: 'Kegiatan',
  system: 'Sistem',
};

const EVENT_TYPE_ICONS: Record<TimelineEventType, string> = {
  grade: '📊',
  assignment: '📝',
  submission: '📤',
  attendance: '✅',
  material_access: '📖',
  material_download: '⬇️',
  material_rating: '⭐',
  material_bookmark: '🔖',
  message_sent: '✉️',
  message_received: '📨',
  announcement: '📢',
  event: '🎉',
  system: '⚙️',
};

export const StudentTimeline: React.FC<StudentTimelineProps> = ({
  studentId,
  studentName,
  userRole: _userRole,
  className = '',
  onEventClick,
}) => {
  const [stats, setStats] = useState<TimelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTypes, setSelectedTypes] = useState<TimelineEventType[]>([]);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'type'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.TIMELINE_ITEMS);
  const [showStats, setShowStats] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([]);

  const loadFilteredTimeline = useCallback(async () => {
    const filter: TimelineFilter = {};
    if (selectedTypes.length > 0) {
      filter.eventTypes = selectedTypes;
    }
    if (dateRange.startDate && dateRange.endDate) {
      filter.dateRange = dateRange;
    }

    const options: TimelineOptions = {
      limit,
      sortBy,
      sortOrder,
    };

    const result = await studentTimelineService.getFilteredTimeline(studentId, filter, options);
    setVisibleEvents(result);
  }, [studentId, selectedTypes, dateRange, limit, sortBy, sortOrder]);

  useEffect(() => {
    loadFilteredTimeline();
  }, [loadFilteredTimeline]);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await studentTimelineService.getTimeline(studentId, {
        sortBy,
        sortOrder,
      });

      const timelineStats = await studentTimelineService.getTimelineStats(studentId);
      setStats(timelineStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load timeline';
      setError(errorMessage);
      logger.error(`StudentTimeline: Failed to load timeline for ${studentId}`, err);
    } finally {
      setLoading(false);
    }
  }, [studentId, sortBy, sortOrder]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handleExportPDF = async () => {
    try {
      pdfExportService.createTimelineReport(
        visibleEvents,
        studentName || `Student ${studentId}`,
        dateRange.startDate,
        dateRange.endDate
      );
      logger.info(`StudentTimeline: Exported timeline for ${studentId} to PDF`);
    } catch (err) {
      logger.error(`StudentTimeline: Failed to export timeline for ${studentId}`, err);
    }
  };

  const handleTypeToggle = (type: TimelineEventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventClick = (event: TimelineEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      logger.debug(`StudentTimeline: Event clicked: ${event.id}`);
    }
  };

  const groupEventsByDate = (eventList: TimelineEvent[]) => {
    const groups: Record<string, TimelineEvent[]> = {};
    for (const event of eventList) {
      const date = new Date(event.timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    }
    return groups;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-600">Memuat timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={loadTimeline}
          aria-label="Coba lagi memuat timeline aktivitas"
          className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(visibleEvents);

  return (
    <div className={`space-y-6 ${className}`}>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Timeline {studentName || `Siswa ${studentId}`}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {visibleEvents.length} aktivitas ditampilkan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {showStats ? 'Sembunyikan Statistik' : 'Tampilkan Statistik'}
          </button>
          <button
            onClick={handleExportPDF}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Ekspor timeline aktivitas siswa ke PDF"
          >
            Ekspor PDF
          </button>
        </div>
      </header>

      {showStats && stats && (
        <section
          className="rounded-lg border border-gray-200 bg-gray-50 p-6"
          aria-labelledby="stats-heading"
        >
          <h3 id="stats-heading" className="text-lg font-semibold text-gray-900">
            Statistik Timeline
          </h3>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-gray-600">Total Aktivitas</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">{stats.totalEvents}</dd>
            </div>
            {stats.averageScore !== undefined && (
              <div>
                <dt className="text-sm text-gray-600">Rata-rata Nilai</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.averageScore.toFixed(2)}
                </dd>
              </div>
            )}
            {stats.attendanceRate !== undefined && (
              <div>
                <dt className="text-sm text-gray-600">Tingkat Kehadiran</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.attendanceRate.toFixed(1)}%
                </dd>
              </div>
            )}
            {stats.totalMaterialsAccessed !== undefined && (
              <div>
                <dt className="text-sm text-gray-600">Materi Diakses</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.totalMaterialsAccessed}
                </dd>
              </div>
            )}
          </dl>
          <h4 className="mt-6 text-sm font-semibold text-gray-900">Aktivitas per Jenis</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(stats.eventsByType).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
              >
                <span>{EVENT_TYPE_ICONS[type as TimelineEventType]}</span>
                <span>{EVENT_TYPE_LABELS[type as TimelineEventType]}</span>
                <span className="font-semibold">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section
        className="rounded-lg border border-gray-200 bg-white p-6"
        aria-labelledby="filters-heading"
      >
        <h3 id="filters-heading" className="text-lg font-semibold text-gray-900">
          Filter dan Urutan
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="event-types" className="block text-sm font-medium text-gray-700">
              Jenis Aktivitas
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type as TimelineEventType)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                    selectedTypes.includes(type as TimelineEventType)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{EVENT_TYPE_ICONS[type as TimelineEventType]}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                Tanggal Mulai
              </label>
              <input
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                Tanggal Akhir
              </label>
              <input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">
                Urutkan Berdasarkan
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'type')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="timestamp">Tanggal</option>
                <option value="type">Jenis</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700">
                Urutan
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </div>
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                Jumlah yang Ditampilkan
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>Semua</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-lg border border-gray-200 bg-white p-6"
        aria-labelledby="timeline-heading"
      >
        <h3 id="timeline-heading" className="text-lg font-semibold text-gray-900">
          Aktivitas
        </h3>
        {Object.entries(groupedEvents).length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">Tidak ada aktivitas yang ditemukan.</p>
        ) : (
          <div className="mt-4 space-y-8">
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
              <div key={date}>
                <h4 className="text-sm font-semibold text-gray-900">{date}</h4>
                <ul className="mt-3 space-y-4">
                  {dayEvents.map((event) => (
                    <li
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="group flex cursor-pointer gap-4 rounded-lg p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${event.color}`}
                      >
                        {event.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {event.title}
                            </h5>
                            <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

StudentTimeline.displayName = 'StudentTimeline';
