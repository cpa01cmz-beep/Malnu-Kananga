import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PPDBRegistration from '../PPDBRegistration';

vi.mock('../../services/speechRecognitionService', () => ({
  default: vi.fn().mockImplementation(function() {
    return {
      startRecording: vi.fn(() => Promise.resolve()),
      stopRecording: vi.fn(),
      abortRecording: vi.fn(),
      isListening: vi.fn(() => false),
      getTranscript: vi.fn(() => ''),
      getState: vi.fn(() => 'idle'),
      setLanguage: vi.fn(),
      setContinuous: vi.fn(),
      setInterimResults: vi.fn(),
      onResult: vi.fn(),
      onError: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      onSpeechStart: vi.fn(),
      onSpeechEnd: vi.fn(),
      cleanup: vi.fn(),
      getIsSupported: vi.fn(() => true),
      getPermissionState: vi.fn(() => 'granted' as const),
      requestPermission: vi.fn(() => Promise.resolve(true)),
    };
  }),
}));

vi.mock('../../services/speechSynthesisService', () => ({
  default: vi.fn().mockImplementation(function() {
    return {
      speak: vi.fn(),
      cancel: vi.fn(),
      cleanup: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
    };
  }),
}));

vi.mock('../../services/apiService', () => ({
  ppdbAPI: {
    create: vi.fn(() => Promise.resolve({ success: true, data: {} })),
  },
}));

vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    sync: vi.fn(),
    addAction: vi.fn(() => 'mock-action-id'),
    getPendingCount: () => 0,
    getFailedCount: () => 0,
    isSyncing: false,
    retryFailedActions: vi.fn(),
    clearCompletedActions: vi.fn(),
  }),
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlow: false,
  }),
}));

vi.mock('../../services/ocrService', () => ({
  ocrService: {
    initialize: vi.fn(() => Promise.resolve()),
    extractTextFromImage: vi.fn(() => Promise.resolve({
      data: {
        grades: {},
        fullName: '',
        nisn: '',
        schoolName: '',
      },
      confidence: 0.9,
      quality: 'high',
      extractedText: '',
    })),
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('PPDBRegistration Voice Input Integration', () => {
  const mockOnShowToast = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render voice buttons for all form fields', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Formulir Pendaftaran PPDB/i)).toBeInTheDocument();
    });

    const voiceButtons = screen.getAllByRole('button').filter(
      button => button.getAttribute('aria-label')?.includes('suara')
    );

    expect(voiceButtons.length).toBeGreaterThanOrEqual(6);
  });

  it('should render with voice input features available', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Formulir Pendaftaran PPDB/i)).toBeInTheDocument();
    });

    const voiceButtons = screen.getAllByRole('button').filter(
      button => button.getAttribute('aria-label')?.includes('suara')
    );

    expect(voiceButtons.length).toBeGreaterThanOrEqual(6);
  });
});
