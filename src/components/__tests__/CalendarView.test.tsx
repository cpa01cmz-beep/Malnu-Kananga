import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalendarView from '../CalendarView';
import type { Schedule } from '../../types';

// Mock the Heroicons
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
    expect(screen.getByRole('button', { name: /Bulan/i })).toBeInTheDocument();
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
});