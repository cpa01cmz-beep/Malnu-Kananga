import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentDashboard } from '../ParentDashboard';

const mockStudent = {
  id: '1',
  name: 'Test Student',
  class: '10A',
  grade: '10',
};

const mockGrades = [
  { subject: 'Math', score: 85, grade: 'B' },
  { subject: 'Science', score: 92, grade: 'A' },
];

const mockAttendance = [
  { date: '2023-11-01', status: 'present' },
  { date: '2023-11-02', status: 'absent' },
];

describe('ParentDashboard Component', () => {
  const mockOnViewDetails = jest.fn();
  const mockOnContactTeacher = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders parent dashboard with student info', () => {
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    expect(screen.getByText('Test Student')).toBeInTheDocument();
    expect(screen.getByText('Kelas 10A')).toBeInTheDocument();
  });

  test('displays grades overview', () => {
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    expect(screen.getByText('Matematika')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('IPA')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  test('displays attendance summary', () => {
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    expect(screen.getByText(/kehadiran/i)).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('handles view details click', async () => {
    const user = userEvent.setup();
    
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    const viewDetailsButton = screen.getByRole('button', { name: /lihat detail/i });
    await user.click(viewDetailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith('grades');
  });

  test('handles contact teacher click', async () => {
    const user = userEvent.setup();
    
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    const contactButton = screen.getByRole('button', { name: /hubungi guru/i });
    await user.click(contactButton);

    expect(mockOnContactTeacher).toHaveBeenCalled();
  });

  test('switches between tabs', async () => {
    const user = userEvent.setup();
    
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    const attendanceTab = screen.getByRole('tab', { name: /kehadiran/i });
    await user.click(attendanceTab);

    expect(screen.getByText('2023-11-01')).toBeInTheDocument();
    expect(screen.getByText('Hadir')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <ParentDashboard
        student={mockStudent}
        grades={[]}
        attendance={[]}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('displays empty state when no data', () => {
    render(
      <ParentDashboard
        student={mockStudent}
        grades={[]}
        attendance={[]}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    expect(screen.getByText(/belum ada data nilai/i)).toBeInTheDocument();
  });

  test('filters grades by subject', async () => {
    const user = userEvent.setup();
    
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    const filterSelect = screen.getByLabelText(/filter mata pelajaran/i);
    await user.selectOptions(filterSelect, 'Math');

    expect(screen.getByText('Matematika')).toBeInTheDocument();
    expect(screen.queryByText('IPA')).not.toBeInTheDocument();
  });

  test('exports data to PDF', async () => {
    const user = userEvent.setup();
    const mockPrint = jest.fn();
    global.print = mockPrint;
    
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    const exportButton = screen.getByRole('button', { name: /ekspor pdf/i });
    await user.click(exportButton);

    expect(mockPrint).toHaveBeenCalled();
  });

  test('shows grade trend visualization', () => {
    render(
      <ParentDashboard
        student={mockStudent}
        grades={mockGrades}
        attendance={mockAttendance}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
      />
    );

    expect(screen.getByTestId('grade-chart')).toBeInTheDocument();
  });

  test('handles error state', () => {
    render(
      <ParentDashboard
        student={mockStudent}
        grades={[]}
        attendance={[]}
        onViewDetails={mockOnViewDetails}
        onContactTeacher={mockOnContactTeacher}
        error="Failed to load data"
      />
    );

    expect(screen.getByText(/gagal memuat data/i)).toBeInTheDocument();
  });
});