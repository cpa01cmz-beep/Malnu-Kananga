import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudentAssignments from '../StudentAssignments';
import { assignmentsAPI, assignmentSubmissionsAPI } from '../../services/apiService';
import { AssignmentType, AssignmentStatus, Student } from '../../types';
import { STORAGE_KEYS } from '../../constants';

vi.mock('../../services/apiService');
vi.mock('../../hooks/useEventNotifications');
vi.mock('../../hooks/useCanAccess');
vi.mock('../../services/offlineActionQueueService');
vi.mock('../../utils/networkStatus');

describe('StudentAssignments', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();
  const mockStudentId = 'student-123';
  const mockStudentName = 'John Doe';

  const mockStudent: Student = {
    id: 'student-123',
    userId: 'user-123',
    nisn: '1234567890',
    nis: '12345',
    class: 'class-123',
    className: 'X-A',
    address: 'Jalan Test',
    phoneNumber: '081234567890',
    parentName: 'Parent Name',
    parentPhone: '08987654321',
    dateOfBirth: '2008-01-01',
    enrollmentDate: '2023-07-01'
  };

  const mockAssignments: Assignment[] = [
    {
      id: 'assign-1',
      title: 'Matematika Bab 1',
      description: 'Selesaikan latihan soal bab 1',
      type: AssignmentType.ASSIGNMENT,
      subjectId: 'subject-1',
      classId: 'class-123',
      teacherId: 'teacher-1',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      maxScore: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: AssignmentStatus.PUBLISHED,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      subjectName: 'Matematika',
      className: 'X-A',
      teacherName: 'Guru Matematika'
    },
    {
      id: 'assign-2',
      title: 'Fisika Quiz',
      description: 'Kuis tentang hukum Newton',
      type: AssignmentType.QUIZ,
      subjectId: 'subject-2',
      classId: 'class-123',
      teacherId: 'teacher-2',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      maxScore: 50,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: AssignmentStatus.PUBLISHED,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      subjectName: 'Fisika',
      className: 'X-A',
      teacherName: 'Guru Fisika'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockStudent));
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render loading state initially', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Memuat tugas/i)).toBeInTheDocument();
      });
    });

    it('should render assignment list after loading', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Daftar Tugas')).toBeInTheDocument();
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
        expect(screen.getByText('Fisika Quiz')).toBeInTheDocument();
      });
    });

    it('should render empty state when no assignments', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Tidak Ada Tugas/i)).toBeInTheDocument();
      });
    });
  });

  describe('Assignment Display', () => {
    it('should display assignment details correctly', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
        expect(screen.getByText(/Matematika/)).toBeInTheDocument();
        expect(screen.getByText(/Nilai Maksimal: 100/)).toBeInTheDocument();
      });
    });

    it('should show correct assignment type badge', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Tugas')).toBeInTheDocument();
        expect(screen.getByText('Kuis')).toBeInTheDocument();
      });
    });

    it('should show days remaining correctly', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/hari/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        const backButton = screen.getByText('Kembali');
        fireEvent.click(backButton);
        expect(mockOnBack).toHaveBeenCalledTimes(1);
      });
    });

    it('should navigate to detail view when clicking submitted assignment', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: [{
          id: 'sub-1',
          assignmentId: 'assign-1',
          studentId: mockStudentId,
          studentName: mockStudentName,
          submittedAt: '2024-01-15T10:00:00.000Z',
          status: 'submitted',
          attachments: []
        }]
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        const assignmentCard = screen.getByText('Matematika Bab 1');
        fireEvent.click(assignmentCard);
      });
    });
  });

  describe('Submission', () => {
    it('should show submission view for unsubmitted assignment', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        const assignmentCard = screen.getByText('Matematika Bab 1');
        fireEvent.click(assignmentCard);
      });

      await waitFor(() => {
        expect(screen.getByText('Kirim Tugas')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Tulis jawaban tugas/i)).toBeInTheDocument();
      });
    });

    it('should validate submission before submitting', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        const assignmentCard = screen.getByText('Matematika Bab 1');
        fireEvent.click(assignmentCard);
      });

      await waitFor(() => {
        const submitButton = screen.getByText('Kirim Tugas');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Harap Perbaiki Error Berikut/i)).toBeInTheDocument();
        expect(screen.getByText(/Mohon isi teks tugas/i)).toBeInTheDocument();
      });
    });
  });

  describe('Submission Status', () => {
    it('should show "Belum Dikirim" for unsubmitted assignments', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Belum Dikirim')).toBeInTheDocument();
      });
    });

    it('should show "Dikirim" for submitted assignments', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: [{
          id: 'sub-1',
          assignmentId: 'assign-1',
          studentId: mockStudentId,
          studentName: mockStudentName,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          attachments: []
        }]
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Dikirim')).toBeInTheDocument();
      });
    });

    it('should show "Dinilai" for graded assignments', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: [{
          id: 'sub-1',
          assignmentId: 'assign-1',
          studentId: mockStudentId,
          studentName: mockStudentName,
          submittedAt: new Date().toISOString(),
          score: 85,
          feedback: 'Bagus!',
          status: 'graded',
          gradedAt: new Date().toISOString(),
          attachments: []
        }]
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Dinilai')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when API fails', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockRejectedValue(new Error('API Error'));

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Gagal memuat data tugas/i)).toBeInTheDocument();
      });
    });

    it('should show error message on submission failure', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      vi.mocked(assignmentSubmissionsAPI.create).mockRejectedValue(new Error('Submission Error'));

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        const assignmentCard = screen.getByText('Matematika Bab 1');
        fireEvent.click(assignmentCard);
      });

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Tulis jawaban tugas/i);
        fireEvent.change(textarea, {
          target: { value: 'Jawaban tugas saya' }
        });

        const submitButton = screen.getByText('Kirim Tugas');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnShowToast).toHaveBeenCalledWith('Gagal mengirim tugas', 'error');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Kembali/i })).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      vi.mocked(assignmentsAPI.getByStatus).mockResolvedValue({
        success: true,
        data: mockAssignments
      });

      vi.mocked(assignmentSubmissionsAPI.getByStudent).mockResolvedValue({
        success: true,
        data: []
      });

      render(
        <StudentAssignments
          onBack={mockOnBack}
          onShowToast={mockOnShowToast}
          studentId={mockStudentId}
          studentName={mockStudentName}
        />
      );

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });
});
