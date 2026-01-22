import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssignmentGrading from '../AssignmentGrading';
import { assignmentsAPI, assignmentSubmissionsAPI } from '../../services/apiService';
import { generateAssignmentFeedback } from '../../services/geminiService';
import { Assignment, AssignmentSubmission, User, AssignmentType, AssignmentStatus } from '../../types';
import { STORAGE_KEYS } from '../../constants';

vi.mock('../../services/apiService');
vi.mock('../../services/geminiService');
vi.mock('../../hooks/useEventNotifications', () => ({
  useEventNotifications: () => ({
    notifyGradeUpdate: vi.fn(),
    notifyPPDBStatus: vi.fn(),
    notifyLibraryUpdate: vi.fn(),
    notifyAssignmentCreate: vi.fn(),
    notifyAssignmentSubmit: vi.fn(),
    notifyMeetingRequest: vi.fn(),
    notifyScheduleChange: vi.fn(),
    notifyMaterialUpdate: vi.fn(),
    notifyPPDBStatusChange: vi.fn(),
    notifyNewAnnouncement: vi.fn()
  })
}));
vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: () => ({
    user: { id: 'teacher-1', role: 'teacher', name: 'Guru', email: 'guru@malnu.sch.id', status: 'active' },
    userRole: 'teacher',
    userExtraRole: null,
    canAccess: vi.fn(() => true),
    canAccessAny: vi.fn(() => true),
    canAccessResource: vi.fn(() => true),
    userPermissions: [],
    userPermissionIds: [],
  })
}));
vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    addAction: vi.fn()
  })
}));
vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true })
}));
vi.mock('./OfflineIndicator', () => ({
  OfflineIndicator: () => <div data-testid="offline-indicator" />
}));

const mockCurrentUser: User = {
  id: 'teacher-1',
  name: 'Teacher Test',
  email: 'teacher@test.com',
  role: 'teacher',
  extraRole: null,
  status: 'active'
};

const mockAssignment: Assignment = {
  id: 'assignment-1',
  title: 'Matematika: Aljabar Linear',
  description: 'Selesaikan soal-soal aljabar linear pada halaman 45-47',
  type: AssignmentType.ASSIGNMENT,
  subjectId: 'subject-1',
  classId: 'class-1',
  teacherId: 'teacher-1',
  academicYear: '2024/2025',
  semester: 'Ganjil',
  maxScore: 100,
  dueDate: '2025-02-01',
  status: AssignmentStatus.PUBLISHED,
  createdAt: '2025-01-15',
  updatedAt: '2025-01-15'
};

const mockSubmission: AssignmentSubmission = {
  id: 'submission-1',
  assignmentId: 'assignment-1',
  studentId: 'student-1',
  studentName: 'Siswa Test',
  submissionText: 'Aljabar linear adalah studi persamaan linear. Berikut adalah solusi untuk soal nomor 1-5...',
  attachments: [
    {
      id: 'att-1',
      submissionId: 'submission-1',
      fileName: 'jawaban_matematika.pdf',
      fileUrl: 'https://example.com/jawaban.pdf',
      fileType: 'application/pdf',
      fileSize: 1024000,
      uploadedAt: '2025-01-20'
    }
  ],
  submittedAt: '2025-01-20T10:30:00Z',
  status: 'submitted'
};

describe('AssignmentGrading - AI Feedback Feature', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockCurrentUser));
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify({
      token: 'test-token',
      user: mockCurrentUser
    }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render AI feedback button in grading form', async () => {
    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [mockSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Penilaian Tugas')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(mockAssignment.title));

    await waitFor(() => {
      expect(screen.getByText('Buat Feedback AI')).toBeInTheDocument();
    });
  });

  it('should disable AI feedback button when submission has no content', async () => {
    const emptySubmission: AssignmentSubmission = {
      ...mockSubmission,
      submissionText: undefined,
      attachments: []
    };

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [emptySubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
    });

    await waitFor(() => {
      const aiButton = screen.getByText('Buat Feedback AI');
      expect(aiButton).toBeDisabled();
    });
  });

  it('should call generateAssignmentFeedback when AI feedback button clicked', async () => {
    const mockFeedback = {
      feedback: 'Siswa menunjukkan pemahaman yang baik tentang aljabar linear.',
      strengths: [
        'Menyelesaikan soal nomor 1-3 dengan benar',
        'Menunjukkan langkah-langkah yang jelas',
        'Menggunakan notasi matematika yang tepat'
      ],
      improvements: [
        'Perlu memperhatikan tanda positif/negatif pada soal nomor 4',
        'Solusi soal nomor 5 perlu diperiksa kembali',
        'Dianjurkan untuk latihan soal-soal tambahan'
      ],
      suggestedScore: 85,
      confidence: 0.88
    };

    vi.mocked(generateAssignmentFeedback).mockResolvedValue(mockFeedback);

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [mockSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockSubmission.studentName));
    });

    await waitFor(() => {
      const aiButton = screen.getByText('Buat Feedback AI');
      fireEvent.click(aiButton);
    });

    await waitFor(() => {
      expect(generateAssignmentFeedback).toHaveBeenCalledWith(
        {
          title: mockAssignment.title,
          description: mockAssignment.description,
          type: 'assignment',
          subjectName: undefined,
          maxScore: mockAssignment.maxScore
        },
        {
          studentName: mockSubmission.studentName,
          submissionText: mockSubmission.submissionText,
          attachments: [
            {
              fileName: mockSubmission.attachments[0].fileName,
              fileType: mockSubmission.attachments[0].fileType
            }
          ]
        },
        undefined
      );
    });
  });

  it('should show AI feedback modal after generation', async () => {
    const mockFeedback = {
      feedback: 'Siswa menunjukkan pemahaman yang baik.',
      strengths: ['Kekuatan 1', 'Kekuatan 2'],
      improvements: ['Perbaikan 1', 'Perbaikan 2'],
      suggestedScore: 85,
      confidence: 0.88
    };

    vi.mocked(generateAssignmentFeedback).mockResolvedValue(mockFeedback);

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [mockSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
      fireEvent.click(screen.getByText(mockSubmission.studentName));
      fireEvent.click(screen.getByText('Buat Feedback AI'));
    });

    await waitFor(() => {
      expect(screen.getByText('Feedback AI')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Feedback Utama')).toBeInTheDocument();
      expect(screen.getByText('Kekuatan (2)')).toBeInTheDocument();
      expect(screen.getByText('Perbaikan (2)')).toBeInTheDocument();
      expect(screen.getByText('Saran Nilai')).toBeInTheDocument();
    });
  });

  it('should display suggested score from AI feedback', async () => {
    const mockFeedback = {
      feedback: 'Test feedback',
      strengths: ['Strength 1'],
      improvements: ['Improvement 1'],
      suggestedScore: 85,
      confidence: 0.85
    };

    vi.mocked(generateAssignmentFeedback).mockResolvedValue(mockFeedback);

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [mockSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
      fireEvent.click(screen.getByText(mockSubmission.studentName));
      fireEvent.click(screen.getByText('Buat Feedback AI'));
    });

    await waitFor(() => {
      expect(screen.getByText('85/100')).toBeInTheDocument();
      expect(screen.getByText(/88%/)).toBeInTheDocument();
    });
  });

  it('should apply AI feedback when Terapkan button clicked', async () => {
    const mockFeedback = {
      feedback: 'Test feedback yang diterapkan',
      strengths: ['Strength 1'],
      improvements: ['Improvement 1'],
      suggestedScore: 85,
      confidence: 0.85
    };

    vi.mocked(generateAssignmentFeedback).mockResolvedValue(mockFeedback);

    vi.mocked(assignmentSubmissionsAPI).update.mockResolvedValue({
      success: true,
      data: { ...mockSubmission, feedback: mockFeedback.feedback, score: mockFeedback.suggestedScore },
      message: 'Success'
    });

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [mockSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
      fireEvent.click(screen.getByText(mockSubmission.studentName));
      fireEvent.click(screen.getByText('Buat Feedback AI'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Terapkan Feedback'));
    });

    await waitFor(() => {
      const feedbackInput = screen.getByPlaceholderText('Berikan feedback untuk siswa...');
      expect(feedbackInput).toHaveValue(mockFeedback.feedback);

      const scoreInput = screen.getByPlaceholderText(/Masukkan nilai/);
      expect(scoreInput).toHaveValue(mockFeedback.suggestedScore);

      expect(mockOnShowToast).toHaveBeenCalledWith('Feedback AI diterapkan', 'success');
    });

    expect(screen.queryByText('Feedback AI')).not.toBeInTheDocument();
  });

  it('should show loading state while generating AI feedback', async () => {
    let feedbackResolver: ((value: {
      feedback: string;
      strengths: string[];
      improvements: string[];
      suggestedScore?: number;
      confidence: number;
    }) => void) | null = null;
    const pendingPromise: Promise<{
      feedback: string;
      strengths: string[];
      improvements: string[];
      suggestedScore?: number;
      confidence: number;
    }> = new Promise((resolve) => {
      feedbackResolver = resolve;
    });

    vi.mocked(generateAssignmentFeedback).mockReturnValue(pendingPromise);

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [mockSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
      fireEvent.click(screen.getByText(mockSubmission.studentName));
      fireEvent.click(screen.getByText('Buat Feedback AI'));
    });

    await waitFor(() => {
      const aiButton = screen.getByText('Membuat...');
      expect(aiButton).toBeDisabled();
    });

    if (feedbackResolver) {
      (feedbackResolver as any)({
        feedback: 'Test',
        strengths: [],
        improvements: [],
        confidence: 0.8
      });
    }
  });

  it('should handle AI feedback generation error', async () => {
    vi.mocked(generateAssignmentFeedback).mockRejectedValue(new Error('AI service error'));

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [mockSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
      fireEvent.click(screen.getByText(mockSubmission.studentName));
      fireEvent.click(screen.getByText('Buat Feedback AI'));
    });

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith('Gagal membuat feedback AI', 'error');
    });
  });

  it('should pass current score to AI feedback function when already graded', async () => {
    const gradedSubmission: AssignmentSubmission = {
      ...mockSubmission,
      score: 75,
      feedback: 'Previous feedback',
      status: 'graded',
      gradedBy: 'teacher-1',
      gradedAt: '2025-01-21'
    };

    const mockFeedback = {
      feedback: 'Updated feedback',
      strengths: ['New strength'],
      improvements: ['New improvement'],
      suggestedScore: 80,
      confidence: 0.85
    };

    vi.mocked(generateAssignmentFeedback).mockResolvedValue(mockFeedback);

    vi.mocked(assignmentsAPI).getByTeacher.mockResolvedValue({
      success: true,
      data: [mockAssignment],
      message: 'Success'
    });

    vi.mocked(assignmentSubmissionsAPI).getByAssignment.mockResolvedValue({
      success: true,
      data: [gradedSubmission],
      message: 'Success'
    });

    render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockAssignment.title));
      fireEvent.click(screen.getByText(gradedSubmission.studentName));
    });

    const scoreInput = await waitFor(() => screen.getByPlaceholderText(/Masukkan nilai/));
    fireEvent.change(scoreInput, { target: { value: '75' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Buat Feedback AI'));
    });

    await waitFor(() => {
      expect(generateAssignmentFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockAssignment.title,
          description: mockAssignment.description,
          maxScore: mockAssignment.maxScore
        }),
        expect.objectContaining({
          studentName: gradedSubmission.studentName,
          submissionText: gradedSubmission.submissionText
        }),
        75
      );
    });
  });
});
