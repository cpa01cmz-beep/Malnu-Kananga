import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssignmentGrading from '../AssignmentGrading';
import { assignmentsAPI, assignmentSubmissionsAPI } from '../../services/apiService';
import * as useEventNotifications from '../../hooks/useEventNotifications';
import { AssignmentType, AssignmentStatus } from '../../types';

vi.mock('../../services/apiService', () => ({
  assignmentsAPI: {
    getByTeacher: vi.fn(),
  },
  assignmentSubmissionsAPI: {
    getByAssignment: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../hooks/useEventNotifications', () => ({
  useEventNotifications: vi.fn(() => ({
    notifyGradeUpdate: vi.fn(),
    notifyPPDBStatus: vi.fn(),
    notifyLibraryUpdate: vi.fn(),
    notifyAssignmentCreate: vi.fn(),
    notifyAssignmentSubmit: vi.fn(),
    notifyMeetingRequest: vi.fn(),
    notifyScheduleChange: vi.fn(),
    notifyAttendanceAlert: vi.fn(),
    notifyOCRValidation: vi.fn(),
    useMonitorLocalStorage: vi.fn(),
    useOCRValidationMonitor: vi.fn(),
  })),
}));

vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: vi.fn(() => ({
    user: { id: 'teacher-1', role: 'teacher', name: 'Guru', email: 'guru@malnu.sch.id', status: 'active' },
    userRole: 'teacher',
    userExtraRole: null,
    canAccess: vi.fn(() => ({ canAccess: true, requiredPermission: 'content.create' })),
    canAccessAny: vi.fn(() => true),
    canAccessResource: vi.fn(() => true),
    userPermissions: [],
    userPermissionIds: [],
  })),
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
}));

vi.mock('../../hooks/useOfflineActionQueue', () => ({
  useOfflineActionQueue: vi.fn(() => ({
    addAction: vi.fn(),
    removeAction: vi.fn(),
    getQueue: vi.fn(() => []),
    getPendingCount: vi.fn(() => 0),
    getFailedCount: vi.fn(() => 0),
    clearCompletedActions: vi.fn(),
    sync: vi.fn(),
    retryFailedActions: vi.fn(),
    resolveConflict: vi.fn(),
    onSyncComplete: vi.fn(),
    isOnline: true,
    isSlow: false,
    isSyncing: false,
  })),
}));

const mockUser = {
  id: 'teacher-1',
  username: 'guru',
  email: 'guru@malnu.sch.id',
  role: 'teacher',
  extraRole: null,
};

const mockAssignments = [
  {
    id: 'assignment-1',
    title: 'Matematika Bab 1',
    description: 'Selesaikan soal-soal berikut',
    type: AssignmentType.ASSIGNMENT,
    subjectId: 'subject-1',
    classId: 'class-1',
    teacherId: 'teacher-1',
    academicYear: '2026',
    semester: 'Ganjil',
    maxScore: 100,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: AssignmentStatus.PUBLISHED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    className: 'X IPA 1',
    subjectName: 'Matematika',
    teacherName: 'Budi Santoso',
  },
  {
    id: 'assignment-2',
    title: 'Fisika Dasar',
    description: 'Tugas fisika tentang hukum Newton',
    type: AssignmentType.PROJECT,
    subjectId: 'subject-2',
    classId: 'class-1',
    teacherId: 'teacher-1',
    academicYear: '2026',
    semester: 'Ganjil',
    maxScore: 100,
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: AssignmentStatus.CLOSED,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    className: 'X IPA 1',
    subjectName: 'Fisika',
    teacherName: 'Budi Santoso',
  },
];

const mockSubmissions = [
  {
    id: 'submission-1',
    assignmentId: 'assignment-1',
    studentId: 'student-1',
    studentName: 'Ahmad Fauzi',
    submissionText: 'Jawaban saya untuk tugas ini...',
    attachments: [
      {
        id: 'attach-1',
        submissionId: 'submission-1',
        fileName: 'tugas_matematika.pdf',
        fileUrl: 'https://example.com/tugas.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        uploadedAt: new Date().toISOString(),
      },
    ],
    submittedAt: new Date().toISOString(),
    status: 'submitted' as const,
  },
  {
    id: 'submission-2',
    assignmentId: 'assignment-1',
    studentId: 'student-2',
    studentName: 'Siti Aminah',
    submissionText: 'Ini adalah jawaban tugas fisika...',
    attachments: [],
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    score: 85,
    feedback: 'Bagus! Tingkatkan lagi di bagian perhitungan.',
    gradedBy: 'teacher-1',
    gradedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'graded' as const,
  },
  {
    id: 'submission-3',
    assignmentId: 'assignment-1',
    studentId: 'student-3',
    studentName: 'Dewi Sartika',
    submissionText: 'Jawaban untuk tugas...',
    attachments: [],
    submittedAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'late' as const,
  },
];

describe('AssignmentGrading Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('malnu_user', JSON.stringify(mockUser));
  });

  describe('Assignment List View', () => {
    it('renders assignment list with published and closed assignments', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Penilaian Tugas')).toBeInTheDocument();
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
        expect(screen.getByText('Fisika Dasar')).toBeInTheDocument();
      });
    });

    it('shows empty state when no assignments', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: [],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Anda belum memiliki tugas untuk dinilai')).toBeInTheDocument();
      });
    });

    it('handles assignment selection', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockSubmissions,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });
    });

    it('shows back button on assignment list', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Penilaian Tugas')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Kembali');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Submissions List View', () => {
    it('renders submissions list with status badges', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockSubmissions,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Dikirim')).toBeInTheDocument();
        expect(screen.getByText('Terlambat')).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Semua (3)'));
      }, { timeout: 100 });

      await waitFor(() => {
        expect(screen.getByText('Dinilai')).toBeInTheDocument();
      });
    });

    it('shows submission count and filter options', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockSubmissions,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText(/3 pengumpulan/)).toBeInTheDocument();
        expect(screen.getByText('Semua (3)')).toBeInTheDocument();
        expect(screen.getByText('Belum Dinilai (2)')).toBeInTheDocument();
        expect(screen.getByText('Sudah Dinilai (1)')).toBeInTheDocument();
      });
    });

    it('filters submissions by status', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockSubmissions,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
        expect(screen.queryByText('Siti Aminah')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Semua (3)'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
        expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
        expect(screen.getByText('Dewi Sartika')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Belum Dinilai (2)'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
        expect(screen.queryByText('Siti Aminah')).not.toBeInTheDocument();
      });
    });

    it('handles submission selection', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockSubmissions,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        expect(screen.getByText('Detail Pengumpulan')).toBeInTheDocument();
      });
    });
  });

  describe('Submission Detail View', () => {
    it('renders submission details with assignment info', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[0]],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        expect(screen.getByText('Informasi Tugas')).toBeInTheDocument();
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
        expect(screen.getByText(/Nilai Maksimal:/)).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('renders submission with attachments', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[0]],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        expect(screen.getByText('Lampiran (1)')).toBeInTheDocument();
        expect(screen.getByText('tugas_matematika.pdf')).toBeInTheDocument();
      });
    });

    it('pre-fills score and feedback for graded submission', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[1]],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Semua (1)'));
      }, { timeout: 100 });

      await waitFor(() => {
        expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Siti Aminah'));

      await waitFor(() => {
        expect(screen.getByDisplayValue('85')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bagus! Tingkatkan lagi di bagian perhitungan.')).toBeInTheDocument();
      });
    });

    it('validates score input', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[0]],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        expect(screen.getByText('Beri Penilaian')).toBeInTheDocument();
      });

      const scoreInput = screen.getByPlaceholderText(/Masukkan nilai/);
      const saveButton = screen.getAllByText('Simpan Nilai')[0];

      fireEvent.change(scoreInput, { target: { value: '' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Validasi Gagal')).toBeInTheDocument();
        expect(screen.getByText('• Mohon masukkan nilai')).toBeInTheDocument();
      });
    });

    it('validates score range', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[0]],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        expect(screen.getByText('Beri Penilaian')).toBeInTheDocument();
      });

      const scoreInput = screen.getByPlaceholderText(/Masukkan nilai/);
      const saveButton = screen.getAllByText('Simpan Nilai')[0];

      fireEvent.change(scoreInput, { target: { value: '150' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Validasi Gagal')).toBeInTheDocument();
        expect(screen.getByText('Nilai harus antara 0 dan 100')).toBeInTheDocument();
      });
    });

    it('submits grade successfully', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[0]],
      });

      vi.mocked(assignmentSubmissionsAPI.update).mockResolvedValue({
        success: true,
        message: "Success",
        data: { ...mockSubmissions[0], score: 90, status: 'graded' as const },
      });

      const mockNotifyGradeUpdate = vi.fn();
      (useEventNotifications.useEventNotifications as any).mockReturnValue({
        notifyGradeUpdate: mockNotifyGradeUpdate,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        expect(screen.getByText('Beri Penilaian')).toBeInTheDocument();
      });

      const scoreInput = screen.getByPlaceholderText(/Masukkan nilai/);
      const feedbackInput = screen.getByPlaceholderText('Berikan feedback untuk siswa...');
      const saveButton = screen.getAllByText('Simpan Nilai')[0];

      fireEvent.change(scoreInput, { target: { value: '90' } });
      fireEvent.change(feedbackInput, { target: { value: 'Kerja bagus!' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(assignmentSubmissionsAPI.update).toHaveBeenCalledWith('submission-1', {
          score: 90,
          feedback: 'Kerja bagus!',
          status: 'graded',
          gradedBy: 'teacher-1',
          gradedAt: expect.any(String),
        });
        expect(mockNotifyGradeUpdate).toHaveBeenCalledWith(
          'Ahmad Fauzi',
          'Matematika Bab 1',
          undefined,
          90
        );
        expect(mockOnShowToast).toHaveBeenCalledWith('Nilai berhasil disimpan', 'success');
      });
    });

    it('shows previous feedback for graded submissions', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[1]],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Semua (1)'));
      }, { timeout: 100 });

      await waitFor(() => {
        expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Siti Aminah'));

      await waitFor(() => {
        expect(screen.getByText('Feedback Sebelumnya')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back from submissions list to assignments', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockSubmissions,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      const backButton = screen.getAllByText('Kembali')[0];
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });
    });

    it('navigates back from submission detail to submissions list', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockSubmissions,
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        expect(screen.getByText('Detail Pengumpulan')).toBeInTheDocument();
      });

      const backButton = screen.getAllByText('Kembali')[0];
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when assignments fail to load', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: false,
        error: 'Gagal memuat data',
        message: 'Gagal memuat data',
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Gagal memuat data tugas')).toBeInTheDocument();
      });
    });

    it('shows error when submissions fail to load', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: false,
        error: 'Gagal memuat pengumpulan',
        message: 'Gagal memuat pengumpulan',
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Gagal memuat data pengumpulan')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state when fetching assignments', () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockImplementation(
        () => new Promise(() => {})
      );

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      expect(screen.getByText('Memuat data...')).toBeInTheDocument();
    });

    it('shows loading state when submitting grade', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[0]],
      });

      vi.mocked(assignmentSubmissionsAPI.update).mockImplementation(
        () => new Promise(() => {})
      );

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        const scoreInput = screen.getByPlaceholderText(/Masukkan nilai/);
        const saveButton = screen.getByText('Simpan Nilai');

        fireEvent.change(scoreInput, { target: { value: '90' } });
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on interactive elements', async () => {
      vi.mocked(assignmentsAPI.getByTeacher).mockResolvedValue({
        success: true,
        message: "Success",
        data: mockAssignments,
      });

      vi.mocked(assignmentSubmissionsAPI.getByAssignment).mockResolvedValue({
        success: true,
        message: "Success",
        data: [mockSubmissions[0]],
      });

      const mockOnBack = vi.fn();
      const mockOnShowToast = vi.fn();

      render(<AssignmentGrading onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Matematika Bab 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Matematika Bab 1'));

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ahmad Fauzi'));

      await waitFor(() => {
        const saveButton = screen.getByText('Simpan Nilai');
        const scoreInput = screen.getByPlaceholderText(/Masukkan nilai/);

        expect(saveButton).not.toBeDisabled();

        expect(scoreInput).toHaveAttribute('type', 'number');
        expect(scoreInput).toHaveAttribute('min', '0');
        expect(scoreInput).toHaveAttribute('max', '100');
      });
    });
  });
});
