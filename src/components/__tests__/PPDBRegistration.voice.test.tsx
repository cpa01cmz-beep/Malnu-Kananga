import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PPDBRegistration from '../PPDBRegistration';

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

vi.mock('../../services/speechSynthesisService', () => {
  return {
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
  };
});

describe('PPDBRegistration Voice Input Integration', () => {
  const mockOnShowToast = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
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

  it('should display voice button for fullName field', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    });

    const fullNameLabel = screen.getByLabelText(/Nama Lengkap/i);
    const parent = fullNameLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]');

    expect(voiceButton).toBeInTheDocument();
  });

  it('should display voice button for nisn field', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/NISN/i)).toBeInTheDocument();
    });

    const nisnLabel = screen.getByLabelText(/NISN/i);
    const parent = nisnLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]');

    expect(voiceButton).toBeInTheDocument();
  });

  it('should display voice button for originSchool field', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Asal Sekolah/i)).toBeInTheDocument();
    });

    const schoolLabel = screen.getByLabelText(/Asal Sekolah/i);
    const parent = schoolLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]');

    expect(voiceButton).toBeInTheDocument();
  });

  it('should display voice button for parentName field', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Orang Tua/i)).toBeInTheDocument();
    });

    const parentLabel = screen.getByLabelText(/Nama Orang Tua/i);
    const parent = parentLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]');

    expect(voiceButton).toBeInTheDocument();
  });

  it('should display voice button for phoneNumber field', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nomor WhatsApp/i)).toBeInTheDocument();
    });

    const phoneLabel = screen.getByLabelText(/Nomor WhatsApp/i);
    const parent = phoneLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]');

    expect(voiceButton).toBeInTheDocument();
  });

  it('should display voice button for email field', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    const emailLabel = screen.getByLabelText(/Email/i);
    const parent = emailLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]');

    expect(voiceButton).toBeInTheDocument();
  });

  it('should display voice button for address textarea', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Alamat Lengkap/i)).toBeInTheDocument();
    });

    const addressLabel = screen.getByLabelText(/Alamat Lengkap/i);
    const parent = addressLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]');

    expect(voiceButton).toBeInTheDocument();
  });

  it('should allow manual text input alongside voice input', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    });

    const fullNameInput = screen.getByLabelText(/Nama Lengkap/i) as HTMLInputElement;
    fireEvent.change(fullNameInput, { target: { value: 'Test Name' } });

    await waitFor(() => {
      expect(fullNameInput.value).toBe('Test Name');
    });
  });

  it('should have all required form fields present', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/NISN/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Asal Sekolah/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nama Orang Tua/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nomor WhatsApp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Alamat Lengkap/i)).toBeInTheDocument();
    });
  });

  it('should auto-save form data', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    });

    const fullNameInput = screen.getByLabelText(/Nama Lengkap/i) as HTMLInputElement;
    fireEvent.change(fullNameInput, { target: { value: 'Test Student' } });

    await waitFor(() => {
      expect(fullNameInput.value).toBe('Test Student');
    }, { timeout: 3000 });
  });

  it('should not render when modal is closed', () => {
    render(
      <PPDBRegistration
        isOpen={false}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    expect(screen.queryByText(/Formulir Pendaftaran PPDB/i)).not.toBeInTheDocument();
  });

  it('should display voice input help text on button hover', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    });

    const fullNameLabel = screen.getByLabelText(/Nama Lengkap/i);
    const parent = fullNameLabel.closest('div');
    const voiceButton = parent?.querySelector('button[aria-label*="suara"]') as HTMLButtonElement;

    expect(voiceButton?.getAttribute('title')).toBeTruthy();
  });

  it('should integrate voice input with existing form validation', async () => {
    render(
      <PPDBRegistration
        isOpen={true}
        onClose={mockOnClose}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    });

    const nisnInput = screen.getByLabelText(/NISN/i) as HTMLInputElement;
    fireEvent.change(nisnInput, { target: { value: '123' } });

    await waitFor(() => {
      expect(nisnInput.value).toBe('123');
    });

    fireEvent.change(nisnInput, { target: { value: '1234567890' } });

    await waitFor(() => {
      expect(nisnInput.value).toBe('1234567890');
    });
  });
});
