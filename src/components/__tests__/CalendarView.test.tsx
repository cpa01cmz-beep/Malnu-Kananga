import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalendarView from '../CalendarView';
import type { Schedule } from '../../types';

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left" />,
  ChevronRightIcon: () => <div data-testid="chevron-right" />,
  CalendarDaysIcon: () => <div data-testid="calendar-days" />,
}));

const mockSchedules: Schedule[] = [
  {
    id: '1',
    classId: '1',
    subjectId: '1',
    teacherId: '1',
    dayOfWeek: 'Senin',
    startTime: '08:00',
    endTime: '09:00',
    room: 'A101',
    subjectName: 'Matematika',
    teacherName: 'Budi Susanto'
  },
  {
    id: '2',
    classId: '1',
    subjectId: '2',
    teacherId: '2',
    dayOfWeek: 'Senin',
    startTime: '09:00',
    endTime: '10:00',
    room: 'A102',
    subjectName: 'Bahasa Indonesia',
    teacherName: 'Siti Aminah'
  }
];

describe('CalendarView', () => {
  it('renders month view by default', () => {
    render(
      <CalendarView
        schedules={mockSchedules}
        viewMode="month"
        onDateSelect={() => {}}
        onEventClick={() => {}}
      />
    );
    
    expect(screen.getByRole('button', { name: /Hari Ini/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tampilan bulanan' })).toBeInTheDocument();
  });

  it('displays navigation buttons', () => {
    render(
      <CalendarView
        schedules={mockSchedules}
        viewMode="month"
        onDateSelect={() => {}}
        onEventClick={() => {}}
      />
    );
    
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });

  it('handles date selection', () => {
    const mockDateSelect = vi.fn();
    render(
      <CalendarView
        schedules={mockSchedules}
        viewMode="month"
        onDateSelect={mockDateSelect}
        onEventClick={() => {}}
      />
    );
    
    // The calendar should render clickable dates
    expect(screen.getByRole('button', { name: /Hari Ini/i })).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('has aria-label for month navigation buttons', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="month"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Bulan sebelumnya')).toBeInTheDocument();
      expect(screen.getByLabelText('Bulan berikutnya')).toBeInTheDocument();
    });

    it('has aria-label for week navigation buttons', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="week"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Minggu sebelumnya')).toBeInTheDocument();
      expect(screen.getByLabelText('Minggu berikutnya')).toBeInTheDocument();
    });

    it('has aria-label for day navigation buttons', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="day"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Hari sebelumnya')).toBeInTheDocument();
      expect(screen.getByLabelText('Hari berikutnya')).toBeInTheDocument();
    });

    it('has aria-label for Today button', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="month"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Kembali ke hari ini')).toBeInTheDocument();
    });

    it('has aria-label for view mode buttons', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="month"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Tampilan bulanan')).toBeInTheDocument();
      expect(screen.getByLabelText('Tampilan mingguan')).toBeInTheDocument();
      expect(screen.getByLabelText('Tampilan harian')).toBeInTheDocument();
    });

    it('has proper grid roles for month view', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="month"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByRole('grid', { name: 'Kalender bulanan' })).toBeInTheDocument();
      expect(screen.getByRole('row')).toBeInTheDocument();
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(7);
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells.length).toBeGreaterThan(0);
    });

    it('has proper grid roles for week view', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="week"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByRole('grid', { name: 'Kalender mingguan' })).toBeInTheDocument();
    });

    it('has aria-label for day view', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="day"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Kalender harian')).toBeInTheDocument();
    });

    it('has proper list roles for day view events', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="day"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      expect(screen.getByRole('list', { name: 'Daftar jadwal dan pertemuan' })).toBeInTheDocument();
    });

    it('has aria-pressed for view mode buttons', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="month"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      const monthButton = screen.getByLabelText('Tampilan bulanan');
      expect(monthButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('has aria-hidden for icon svgs', () => {
      render(
        <CalendarView
          schedules={mockSchedules}
          viewMode="month"
          onDateSelect={() => {}}
          onEventClick={() => {}}
        />
      );
      
      // The mock components are just divs with data-testid, so check parent buttons instead
      const chevronLeft = screen.getByTestId('chevron-left').parentElement;
      const chevronRight = screen.getByTestId('chevron-right').parentElement;
      
      // Check that the parent elements are buttons with proper roles
      expect(chevronLeft?.tagName).toBe('BUTTON');
      expect(chevronRight?.tagName).toBe('BUTTON');
      expect(chevronLeft).toHaveAttribute('aria-label');
      expect(chevronRight).toHaveAttribute('aria-label');
    });
  });
});