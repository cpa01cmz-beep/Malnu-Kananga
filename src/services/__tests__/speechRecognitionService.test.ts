// Basic smoke test for SpeechRecognitionService memory leak fix
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SpeechRecognitionService from '../speechRecognitionService';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../../types';

type PermissionState = 'granted' | 'denied' | 'prompt';

// Mock the Web Speech API
const mockSpeechRecognition = {
  continuous: true,
  interimResults: true,
  lang: 'id-ID',
  maxAlternatives: 1,
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  onresult: null as ((event: SpeechRecognitionEvent) => void) | null,
  onerror: null as ((event: SpeechRecognitionErrorEvent) => void) | null,
  onstart: null as (() => void) | null,
  onend: null as (() => void) | null,
  onspeechstart: null as (() => void) | null,
  onspeechend: null as (() => void) | null,
};

const mockPermission = {
  state: 'granted' as PermissionState,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockPermissions = {
  query: vi.fn().mockResolvedValue(mockPermission),
};

Object.defineProperty(global, 'window', {
  value: {
    SpeechRecognition: vi.fn(() => mockSpeechRecognition),
    webkitSpeechRecognition: vi.fn(() => mockSpeechRecognition),
  },
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: {
    permissions: mockPermissions,
    userAgent: 'Mozilla/5.0',
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  },
  writable: true,
});

describe('SpeechRecognitionService Memory Leak Fix', () => {
  let service: SpeechRecognitionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SpeechRecognitionService();
  });

  afterEach(() => {
    service.cleanup();
  });

  it('should remove permission change listener during cleanup', async () => {
    // Wait for constructor's async permission check to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify listener was added during initialization
    expect(mockPermission.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    // Capture the added listener function for verification
    const addedListener = mockPermission.addEventListener.mock.calls[0][1];
    
    // Reset removeEventListener mock to track cleanup call
    mockPermission.removeEventListener.mockClear();
    
    // Cleanup service
    service.cleanup();
    
    // Wait for cleanup's async permission query to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify same listener was removed
    expect(mockPermission.removeEventListener).toHaveBeenCalledWith('change', addedListener);
  });

  it('should handle cleanup when permissions not available', () => {
    // Mock permissions as unavailable
    Object.defineProperty(navigator, 'permissions', {
      value: undefined,
      writable: true,
    });

    const serviceNoPermissions = new SpeechRecognitionService();
    
    // Should not throw error during cleanup
    expect(() => serviceNoPermissions.cleanup()).not.toThrow();
  });
});