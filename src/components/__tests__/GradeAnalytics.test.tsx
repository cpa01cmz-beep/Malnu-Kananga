import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GradeAnalytics from '../GradeAnalytics';
import { gradesAPI, assignmentsAPI, assignmentSubmissionsAPI, subjectsAPI } from '../../services/apiService';
import { authAPI } from '../../services/apiService';

vi.mock('../../services/apiService', () => ({
  gradesAPI: {
    getAll: vi.fn()
  },
  assignmentsAPI: {
    getByTeacher: vi.fn()
  },
  assignmentSubmissionsAPI: {
    getAll: vi.fn()
  },
  subjectsAPI: {
    getAll: vi.fn()
  },
  authAPI: {
    getCurrentUser: vi.fn()
  }
}));

describe('GradeAnalytics', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();
  
  const mockCurrentUser = {
    id: 'teacher-1',
    name: 'Teacher Name',
    role: 'teacher',
    extraRole: 'staff'
  };

  const mockGrades = [
    {
      id: 'grade-1',
      studentId: 'student-1',
      subjectId: 'subject-1',
      classId: 'class-1',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      assignmentType: 'tugas',
      assignmentName: 'Tugas 1',
      score: 85,
      maxScore: 100,
      assignment: 85,
      subjectName: 'Matematika',
      createdBy: 'teacher-1',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'grade-2',
      studentId: 'student-2',
      subjectId: 'subject-1',
      classId: 'class-1',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      assignmentType: 'tugas',
      assignmentName: 'Tugas 1',
      score: 90,
      maxScore: 100,
      assignment: 90,
      subjectName: 'Matematika',
      createdBy: 'teacher-1',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'grade-3',
      studentId: 'student-3',
      subjectId: 'subject-1',
      classId: 'class-1',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      assignmentType: 'tugas',
      assignmentName: 'Tugas 1',
      score: 55,
      maxScore: 100,
      assignment: 55,
      subjectName: 'Matematika',
      createdBy: 'teacher-1',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockAssignments = [
    {
      id: 'assignment-1',
      title: 'Tugas 1',
      type: 'ASSIGNMENT',
      subjectId: 'subject-1',
      classId: 'class-1',
      teacherId: 'teacher-1',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      maxScore: 100,
      dueDate: '2024-12-31T23:59:59Z',
      status: 'PUBLISHED',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockSubmissions = [
    {
      id: 'submission-1',
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      studentName: 'Student One',
      submissionText: 'Submission text',
      attachments: [],
      submittedAt: '2024-01-15T00:00:00Z',
      status: 'graded'
    },
    {
      id: 'submission-2',
      assignmentId: 'assignment-1',
      studentId: 'student-2',
      studentName: 'Student Two',
      submissionText: 'Submission text',
      attachments: [],
      submittedAt: '2024-01-15T00:00:00Z',
      status: 'graded'
    },
    {
      id: 'submission-3',
      assignmentId: 'assignment-1',
      studentId: 'student-3',
      studentName: 'Student Three',
      submissionText: 'Submission text',
      attachments: [],
      submittedAt: '2024-01-15T00:00:00Z',
      status: 'graded'
    }
  ];

  const mockSubjects = [
    {
      id: 'subject-1',
      name: 'Matematika',
      code: 'MAT',
      description: 'Matematika',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue(mockCurrentUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    expect(screen.getByText('Analitik Nilai Kelas')).toBeInTheDocument();
    expect(screen.queryByText('Rata-rata Nilai')).not.toBeInTheDocument();
  });

  it('renders analytics overview tab with data', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
        classId="class-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Analitik Nilai Kelas')).toBeInTheDocument();
      expect(screen.getByText('Kelas class-1')).toBeInTheDocument();
      expect(screen.getByText('3 Siswa')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Rata-rata Nilai')).toBeInTheDocument();
      expect(screen.getByText('76.7')).toBeInTheDocument();
    });
  });

  it('renders grade distribution pie chart', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Distribusi Nilai')).toBeInTheDocument();
    });
  });

  it('renders top performers section', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Top Performer (2)')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });

  it('renders needs attention section for low performers', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Membutuhkan Perhatian (1)')).toBeInTheDocument();
      expect(screen.getByText('Student Three')).toBeInTheDocument();
    });
  });

  it('switches between tabs', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const subjectsTab = screen.getByText('Mata Pelajaran');
    subjectsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Matematika')).toBeInTheDocument();
      expect(screen.getByText('1 Tugas')).toBeInTheDocument();
    });

    const studentsTab = screen.getByText('Siswa');
    studentsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Semua Siswa (3)')).toBeInTheDocument();
    });

    const assignmentsTab = screen.getByText('Tugas');
    assignmentsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Fitur analitik tugas akan segera tersedia')).toBeInTheDocument();
    });
  });

  it('exports analytics report', async () => {
    const mockLocalStorage = {
      setItem: vi.fn()
    };
    
   global.localStorage = mockLocalStorage;

    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Export Laporan')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export Laporan');
    exportButton.click();

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith(
        'Laporan analitik berhasil disimpan',
        'success'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  it('handles error state', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
      expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Coba Lagi');
    retryButton.click();

    expect(gradesAPI.getAll).toHaveBeenCalledTimes(2);
  });

  it('shows empty state when no data', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tidak ada data analitik yang tersedia')).toBeInTheDocument();
    });
  });

  it('displays correct grade distribution counts', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      const averageScore = screen.getByText('76.7');
      expect(averageScore).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('90')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('55')).toBeInTheDocument();
    });
  });

  it('calculates submission rate correctly', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('300%')).toBeInTheDocument();
    });
  });

  it('handles missing user gracefully', async () => {
    (authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('User tidak ditemukan')).toBeInTheDocument();
    });
  });

  it('renders back button and navigates correctly', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('← Kembali ke Portal')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Kembali ke Portal');
    backButton.click();

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('displays subject breakdown with metrics', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const subjectsTab = screen.getByText('Mata Pelajaran');
    subjectsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Matematika')).toBeInTheDocument();
      expect(screen.getByText('76.7')).toBeInTheDocument();
    });
  });

  it('shows correct student ranking', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });

  it('displays all students with correct metrics in students tab', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const studentsTab = screen.getByText('Siswa');
    studentsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Student One')).toBeInTheDocument();
      expect(screen.getByText('Student Two')).toBeInTheDocument();
      expect(screen.getByText('Student Three')).toBeInTheDocument();
    });
  });

  it('shows empty state for subjects tab when no data', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const subjectsTab = screen.getByText('Mata Pelajaran');
    subjectsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Tidak ada data mata pelajaran')).toBeInTheDocument();
    });
  });

  it('shows empty state for students tab when no data', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: []
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const studentsTab = screen.getByText('Siswa');
    studentsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Tidak ada data siswa')).toBeInTheDocument();
    });
  });

  it('handles classId parameter correctly', async () => {
    (gradesAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockGrades
    });

    (assignmentsAPI.getByTeacher as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockAssignments
    });

    (assignmentSubmissionsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubmissions
    });

    (subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockSubjects
    });

    render(
      <GradeAnalytics 
        onBack={mockOnBack} 
        onShowToast={mockOnShowToast}
        classId="class-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Kelas class-1')).toBeInTheDocument();
    });
  });
});
