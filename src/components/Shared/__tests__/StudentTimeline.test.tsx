import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StudentTimeline } from '../StudentTimeline';
import { studentTimelineService } from '../../../services/studentTimelineService';
import { pdfExportService } from '../../../services/pdfExportService';
import type { TimelineEvent } from '../../../types/timeline';
import type { UserRole } from '../../../types/common';

vi.mock('../../../services/studentTimelineService');
vi.mock('../../../services/pdfExportService');

const mockStudentId = 'student-123';
const mockStudentName = 'John Doe';
const mockUserRole: UserRole = 'teacher';

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'event-1',
    type: 'grade',
    studentId: mockStudentId,
    title: 'Nilai: Matematika',
    description: 'Skor: 85/100',
    icon: '📊',
    color: 'text-green-600',
    timestamp: '2024-01-15T10:00:00Z',
    data: {
      gradeId: 'grade-1',
      subjectId: 'subject-1',
      score: 85,
      maxScore: 100,
    },
    relatedId: 'grade-1',
    relatedType: 'grade',
  },
  {
    id: 'event-2',
    type: 'attendance',
    studentId: mockStudentId,
    title: 'Absensi: 2024-01-15',
    description: 'Kelas: 10A | Status: HADIR',
    icon: '✅',
    color: 'text-green-600',
    timestamp: '2024-01-15T08:00:00Z',
    data: {
      attendanceId: 'attendance-1',
      classId: 'class-1',
      date: '2024-01-15',
      status: 'hadir',
    },
    relatedId: 'attendance-1',
    relatedType: 'attendance',
  },
];

const mockStats = {
  totalEvents: 2,
  eventsByType: {
    grade: 1,
    assignment: 0,
    submission: 0,
    attendance: 1,
    material_access: 0,
    material_download: 0,
    material_rating: 0,
    material_bookmark: 0,
    message_sent: 0,
    message_received: 0,
    announcement: 0,
    event: 0,
    system: 0,
  },
  dateRange: {
    firstEvent: '2024-01-15T08:00:00Z',
    lastEvent: '2024-01-15T10:00:00Z',
  },
  averageScore: 85,
  attendanceRate: 100,
  totalMaterialsAccessed: 0,
  totalMessages: 0,
};

describe('StudentTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('alert', vi.fn());
    (studentTimelineService.getTimeline as ReturnType<typeof vi.fn>).mockResolvedValue(mockTimelineEvents);
    (studentTimelineService.getFilteredTimeline as ReturnType<typeof vi.fn>).mockResolvedValue(mockTimelineEvents);
    (studentTimelineService.getTimelineStats as ReturnType<typeof vi.fn>).mockResolvedValue(mockStats);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('rendering', () => {
    it('should render loading state initially', () => {
      (studentTimelineService.getTimeline as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      expect(screen.getByText('Memuat timeline...')).toBeInTheDocument();
    });

    it('should render timeline after loading', async () => {
      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(`Timeline ${mockStudentName}`)).toBeInTheDocument();
      });
    });

    it('should render event count', async () => {
      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2 aktivitas ditampilkan')).toBeInTheDocument();
      });
    });

    it('should display event details', async () => {
      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Nilai: Matematika')).toBeInTheDocument();
        expect(screen.getByText('Skor: 85/100')).toBeInTheDocument();
        expect(screen.getByText('Absensi: 2024-01-15')).toBeInTheDocument();
      });
    });
  });

  describe('statistics', () => {
    it('should show statistics when toggle is clicked', async () => {
      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Statistik Timeline')).not.toBeInTheDocument();
      });

      const showStatsButton = screen.getByText('Tampilkan Statistik');
      fireEvent.click(showStatsButton);

      await waitFor(() => {
        expect(screen.getByText('Statistik Timeline')).toBeInTheDocument();
      });
    });

    it('should display total events count', async () => {
      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Tampilkan Statistik')).toBeInTheDocument();
      });

      const showStatsButton = screen.getByText('Tampilkan Statistik');
      fireEvent.click(showStatsButton);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('filters', () => {
    it('should filter by event type when clicked', async () => {
      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Nilai')).toBeInTheDocument();
      });

      const gradeFilter = screen.getByText('Nilai');
      fireEvent.click(gradeFilter);

      expect(studentTimelineService.getFilteredTimeline).toHaveBeenCalledWith(
        mockStudentId,
        expect.objectContaining({
          eventTypes: ['grade'],
        }),
        expect.any(Object)
      );
    });
  });

  describe('PDF export', () => {
    it('should call pdfExportService when export button is clicked', async () => {
      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Ekspor PDF')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Ekspor PDF');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(pdfExportService.createTimelineReport).toHaveBeenCalledWith(
          mockTimelineEvents,
          mockStudentName,
          '',
          ''
        );
      });
    });
  });

  describe('event click', () => {
    it('should call onEventClick when event is clicked', async () => {
      const onEventClickMock = vi.fn();

      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
          onEventClick={onEventClickMock}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Nilai: Matematika')).toBeInTheDocument();
      });

      const gradeEvent = screen.getByText('Nilai: Matematika');
      fireEvent.click(gradeEvent);

      expect(onEventClickMock).toHaveBeenCalledWith(mockTimelineEvents[0]);
    });
  });

  describe('error handling', () => {
    it('should display error message when loading fails', async () => {
      (studentTimelineService.getTimeline as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to load timeline')
      );

      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
        expect(screen.getByText('Failed to load timeline')).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button is clicked', async () => {
      (studentTimelineService.getTimeline as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Failed to load timeline'))
        .mockResolvedValueOnce(mockTimelineEvents);

      render(
        <StudentTimeline
          studentId={mockStudentId}
          studentName={mockStudentName}
          userRole={mockUserRole}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Coba Lagi');
      fireEvent.click(retryButton);

      expect(studentTimelineService.getTimeline).toHaveBeenCalledTimes(2);
    });
  });
});
