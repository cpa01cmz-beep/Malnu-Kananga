import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AssignmentGrading from '../AssignmentGrading';
import { useEventNotifications } from '../../hooks/useEventNotifications';
import { useCanAccess } from '../../hooks/useCanAccess';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { assignmentsAPI, assignmentSubmissionsAPI } from '../../services/apiService';
import { STORAGE_KEYS } from '../../constants';

// Mock hooks
vi.mock('../../hooks/useEventNotifications');
vi.mock('../../hooks/useCanAccess');
vi.mock('../../hooks/useVoiceRecognition');
vi.mock('../../services/apiService');
vi.mock('../../services/ai');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock voice recognition
const mockVoiceRecognition = {
  isSupported: true,
  permissionState: 'granted' as const,
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  abortRecording: vi.fn(),
  transcript: '',
  state: 'idle' as const,
  isListening: false,
  setLanguage: vi.fn(),
  setContinuous: vi.fn(),
  language: 'id' as const,
  continuous: false,
  requestPermission: vi.fn(),
};

// Mock notifications
const mockNotifyGradeUpdate = vi.fn();

// Mock permissions
const mockCanAccess = vi.fn();

describe('AssignmentGrading - Voice Recognition', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockUseEventNotifications = useEventNotifications as any;
    const mockUseCanAccess = useCanAccess as any;
    const mockUseVoiceRecognition = useVoiceRecognition as any;
    
    mockUseEventNotifications.mockReturnValue({
      notifyGradeUpdate: mockNotifyGradeUpdate
    });
    
    mockUseCanAccess.mockReturnValue({
      canAccess: mockCanAccess.mockReturnValue(true)
    });
    
    mockUseVoiceRecognition.mockImplementation((options: any) => {
      return {
        ...mockVoiceRecognition,
        onTranscript: options.onTranscript,
        onError: options.onError,
      };
    });

    // Mock successful API calls
    const mockAssignmentsAPI = assignmentsAPI as any;
    const mockAssignmentSubmissionsAPI = assignmentSubmissionsAPI as any;
    
    mockAssignmentsAPI.getByTeacher.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'assignment-1',
          title: 'Test Assignment',
          description: 'Test Description',
          type: 'essay',
          subjectName: 'Math',
          maxScore: 100,
          status: 'published',
          className: 'Class A',
          dueDate: '2024-12-01',
        }
      ]
    });

    mockAssignmentSubmissionsAPI.getByAssignment.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'submission-1',
          studentName: 'Test Student',
          assignmentId: 'assignment-1',
          submissionText: 'Test submission text',
          status: 'submitted',
          submittedAt: '2024-11-15T10:00:00Z',
          score: undefined,
          feedback: undefined,
          attachments: []
        }
      ]
    });

    mockAssignmentSubmissionsAPI.update.mockResolvedValue({
      success: true
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === STORAGE_KEYS.USER) {
        return JSON.stringify({ id: 'teacher-1', name: 'Test Teacher', role: 'teacher' });
      }
      return null;
    });
  });

  const renderComponent = () => {
    return render(
      <AssignmentGrading
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );
  };

  it('shows voice recognition controls when supported', async () => {
    mockCanAccess.mockReturnValue(true);
    renderComponent();

    // Wait for assignments to load
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    // Click on assignment
    fireEvent.click(screen.getByText('Test Assignment'));

    // Wait for submissions to load
    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    // Click on submission
    fireEvent.click(screen.getByText('Test Student'));

    // Wait for detail view
    await waitFor(() => {
      expect(screen.getByText('Beri Penilaian')).toBeInTheDocument();
    });

    // Check for voice recognition button
    expect(screen.getByText('Rekaman Suara')).toBeInTheDocument();
    expect(screen.getByText('Perintah Suara')).toBeInTheDocument();
  });

  it('shows unsupported message when voice recognition is not supported', async () => {
    mockCanAccess.mockReturnValue(true);
    const mockUseVoiceRecognition = useVoiceRecognition as any;
    mockUseVoiceRecognition.mockReturnValue({
      ...mockVoiceRecognition,
      isSupported: false
    });

    renderComponent();

    // Navigate to submission detail
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Assignment'));

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Student'));

    await waitFor(() => {
      expect(screen.getByText('Fitur Suara Tidak Tersedia')).toBeInTheDocument();
    });
  });

  it('starts voice recording when microphone button is clicked', async () => {
    const mockStartRecording = vi.fn();
    const mockUseVoiceRecognition = useVoiceRecognition as any;
    mockUseVoiceRecognition.mockImplementation((options: any) => {
      return {
        ...mockVoiceRecognition,
        startRecording: mockStartRecording,
        onTranscript: options.onTranscript,
        onError: options.onError,
      };
    });

    mockCanAccess.mockReturnValue(true);
    renderComponent();

    // Navigate to submission detail
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Assignment'));

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Student'));

    await waitFor(() => {
      expect(screen.getByText('Rekaman Suara')).toBeInTheDocument();
    });

    // Click voice recording button
    const voiceButton = screen.getByText('Rekaman Suara');
    fireEvent.click(voiceButton);

    expect(mockStartRecording).toHaveBeenCalled();
    expect(mockOnShowToast).toHaveBeenCalledWith('Mulai merekan suara...', 'info');
  });

  it('handles voice transcript and adds it to feedback', async () => {
    let onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | undefined;

    const mockUseVoiceRecognition = useVoiceRecognition as any;
    mockUseVoiceRecognition.mockImplementation((options: any) => {
      onTranscriptCallback = options.onTranscript;
      return {
        ...mockVoiceRecognition,
        startRecording: vi.fn(),
        onTranscript: options.onTranscript,
        onError: options.onError,
      };
    });

    mockCanAccess.mockReturnValue(true);
    renderComponent();

    // Navigate to submission detail
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Assignment'));

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Student'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Berikan feedback untuk siswa...')).toBeInTheDocument();
    });

    // Simulate voice transcript
    if (onTranscriptCallback) {
      onTranscriptCallback('Kerja bagus!', true);
    }

    await waitFor(() => {
      expect(screen.getByDisplayValue('Kerja bagus!')).toBeInTheDocument();
    });

    expect(mockOnShowToast).toHaveBeenCalledWith('Feedback ditambahkan dari rekaman suara', 'success');
  });

  it('handles voice commands for navigation', async () => {
    let onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | undefined;

    const mockUseVoiceRecognition = useVoiceRecognition as any;
    mockUseVoiceRecognition.mockImplementation((options: any) => {
      onTranscriptCallback = options.onTranscript;
      return {
        ...mockVoiceRecognition,
        startRecording: vi.fn(),
        onTranscript: options.onTranscript,
        onError: options.onError,
      };
    });

    // Add multiple submissions for navigation testing
    const mockAssignmentSubmissionsAPI = assignmentSubmissionsAPI as any;
    mockAssignmentSubmissionsAPI.getByAssignment.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'submission-1',
          studentName: 'Student 1',
          assignmentId: 'assignment-1',
          submissionText: 'Submission 1',
          status: 'submitted',
          submittedAt: '2024-11-15T10:00:00Z',
          score: undefined,
          feedback: undefined,
          attachments: []
        },
        {
          id: 'submission-2',
          studentName: 'Student 2',
          assignmentId: 'assignment-1',
          submissionText: 'Submission 2',
          status: 'submitted',
          submittedAt: '2024-11-15T10:01:00Z',
          score: undefined,
          feedback: undefined,
          attachments: []
        }
      ]
    });

    mockCanAccess.mockReturnValue(true);
    renderComponent();

    // Navigate to submission detail
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Assignment'));

    await waitFor(() => {
      expect(screen.getByText('Student 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Student 1'));

    await waitFor(() => {
      expect(screen.getByText('Beri Penilaian')).toBeInTheDocument();
    });

    // Simulate voice command "selanjutnya"
    if (onTranscriptCallback) {
      onTranscriptCallback('selanjutnya', true);
    }

    // Should navigate to next submission
    await waitFor(() => {
      expect(screen.getByText('Student 2')).toBeInTheDocument();
    });
  });

  it('shows permission denied message when microphone access is denied', async () => {
    const mockUseVoiceRecognition = useVoiceRecognition as any;
    mockUseVoiceRecognition.mockReturnValue({
      ...mockVoiceRecognition,
      permissionState: 'denied' as const
    });

    mockCanAccess.mockReturnValue(true);
    renderComponent();

    // Navigate to submission detail
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Assignment'));

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Student'));

    // Click voice recording button
    await waitFor(() => {
      expect(screen.getByText('Rekaman Suara')).toBeInTheDocument();
    });

    const voiceButton = screen.getByText('Rekaman Suara');
    fireEvent.click(voiceButton);

    expect(mockOnShowToast).toHaveBeenCalledWith(
      'Izin mikrofon ditolak. Silakan izinkan akses mikrofon di pengaturan browser.',
      'error'
    );
  });

  it('displays voice command instructions', async () => {
    mockCanAccess.mockReturnValue(true);
    renderComponent();

    // Navigate to submission detail
    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Assignment'));

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Student'));

    await waitFor(() => {
      expect(screen.getByText('Perintah Suara')).toBeInTheDocument();
    });

    // Check for command instructions
    expect(screen.getByText('Feedback:')).toBeInTheDocument();
    expect(screen.getByText('Navigasi:')).toBeInTheDocument();
    expect(screen.getByText('"selanjutnya", "sebelumnya", "simpan", "batal"')).toBeInTheDocument();
  });
});