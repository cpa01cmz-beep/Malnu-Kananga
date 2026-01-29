// Error Recovery Tests for SpeechRecognitionService
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SpeechRecognitionService from '../speechRecognitionService';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../../types';

type PermissionState = 'granted' | 'denied' | 'prompt';

// Mock Web Speech API with error simulation
class MockSpeechRecognition {
  continuous: boolean = true;
  interimResults: boolean = true;
  lang: string = 'id-ID';
  maxAlternatives: number = 1;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
  onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;

  constructor() {
    this.start = vi.fn();
    this.stop = vi.fn();
    this.abort = vi.fn();
  }
}

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
    SpeechRecognition: MockSpeechRecognition,
    webkitSpeechRecognition: MockSpeechRecognition,
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

describe('SpeechRecognitionService Error Recovery', () => {
  let service: SpeechRecognitionService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    service = new SpeechRecognitionService();
  });

  afterEach(() => {
    vi.useRealTimers();
    service.cleanup();
  });

  describe('Config Validation', () => {
    it('should initialize with valid config', () => {
      expect(() => new SpeechRecognitionService()).not.toThrow();
    });

    it('should reject invalid language', () => {
      expect(() => {
        new SpeechRecognitionService({ language: 'fr-FR' as any });
      }).toThrow();
    });

    it('should reject invalid maxAlternatives (too low)', () => {
      expect(() => {
        new SpeechRecognitionService({ maxAlternatives: 0 });
      }).toThrow();
    });

    it('should reject invalid maxAlternatives (too high)', () => {
      expect(() => {
        new SpeechRecognitionService({ maxAlternatives: 11 });
      }).toThrow();
    });

    it('should reject non-integer maxAlternatives', () => {
      expect(() => {
        new SpeechRecognitionService({ maxAlternatives: 1.5 });
      }).toThrow();
    });
  });

  describe('Retry Logic for startRecording', () => {
    it('should have shouldRetryStartError method', () => {
      expect((service as any).shouldRetryStartError).toBeDefined();
      expect(typeof (service as any).shouldRetryStartError).toBe('function');
    });

    it('should track maxStartAttempts', () => {
      expect((service as any).maxStartAttempts).toBe(3);
    });

    it('should have errorRecovery instance', () => {
      expect((service as any).errorRecovery).toBeDefined();
    });
  });



  describe('Circuit Breaker', () => {
    it('should provide circuit breaker state', () => {
      const state = service.getCircuitBreakerState();

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('lastSuccessTime');
      expect(typeof state.isOpen).toBe('boolean');
      expect(typeof state.failureCount).toBe('number');
    });

    it('should reset circuit breaker', () => {
      service.resetCircuitBreaker();

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should provide error recovery state', () => {
      const state = service.getErrorRecoveryState();

      expect(state).toHaveProperty('circuitBreaker');
      expect(state).toHaveProperty('startAttempts');
      expect(state.circuitBreaker).toHaveProperty('isOpen');
      expect(state.circuitBreaker).toHaveProperty('failureCount');
    });
  });

  describe('Error Recovery State', () => {
    it('should provide complete error recovery state', async () => {
      const mockStart = vi.fn().mockRejectedValue(new Error('Network error'));

      Object.defineProperty(service as any, 'recognition', {
        value: { start: mockStart },
      });

      const onError = vi.fn();
      service.onError(onError);

      await service.startRecording();

      const state = service.getErrorRecoveryState();
      expect(state).toHaveProperty('circuitBreaker');
      expect(state).toHaveProperty('startAttempts');
      expect(state.circuitBreaker).toHaveProperty('isOpen');
      expect(state.circuitBreaker).toHaveProperty('failureCount');
      expect(state.startAttempts).toBeGreaterThan(0);
    });

    it('should reset circuit breaker via resetCircuitBreaker', () => {
      service.resetCircuitBreaker();

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });
  });

  describe('Error Message Mapping', () => {
    it('should have mapErrorTypeFromMessage method', () => {
      expect((service as any).mapErrorTypeFromMessage).toBeDefined();
      expect(typeof (service as any).mapErrorTypeFromMessage).toBe('function');
    });

    it('should map circuit breaker errors to network', () => {
      const errorType = (service as any).mapErrorTypeFromMessage('circuit breaker is open');
      expect(errorType).toBe('network');
    });

    it('should map permission errors correctly', () => {
      const errorType = (service as any).mapErrorTypeFromMessage('not-allowed');
      expect(errorType).toBe('not-allowed');
    });

    it('should map network errors correctly', () => {
      const errorType = (service as any).mapErrorTypeFromMessage('network error');
      expect(errorType).toBe('network');
    });

    it('should map audio-capture errors correctly', () => {
      const errorType = (service as any).mapErrorTypeFromMessage('audio-capture');
      expect(errorType).toBe('audio-capture');
    });
  });

  describe('shouldRetryStartError Logic', () => {
    it('should return false for permission errors', () => {
      const error = new Error('not-allowed');
      const result = (service as any).shouldRetryStartError(error, 1);
      expect(result).toBe(false);
    });

    it('should return false for permission denied errors', () => {
      const error = new Error('Permission denied');
      const result = (service as any).shouldRetryStartError(error, 1);
      expect(result).toBe(false);
    });

    it('should return true for network errors', () => {
      const error = new Error('Network error');
      const result = (service as any).shouldRetryStartError(error, 1);
      expect(result).toBe(true);
    });

    it('should return true for audio-capture errors', () => {
      const error = new Error('audio-capture');
      const result = (service as any).shouldRetryStartError(error, 1);
      expect(result).toBe(true);
    });

    it('should return false after max attempts', () => {
      const error = new Error('Network error');
      const result = (service as any).shouldRetryStartError(error, 3);
      expect(result).toBe(false);
    });
  });



  describe('No-speech error handling', () => {
    it('should not track no-speech errors in circuit breaker', () => {
      const onError = vi.fn();
      service.onError(onError);

      const mockRecognition = (service as any).recognition;
      if (mockRecognition && mockRecognition.onerror) {
        mockRecognition.onerror({
          error: 'no-speech',
          message: 'No speech detected',
        } as SpeechRecognitionErrorEvent);
      }

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
    });
  });

  describe('Aborted error handling', () => {
    it('should not track aborted errors in circuit breaker', () => {
      const onError = vi.fn();
      service.onError(onError);

      const mockRecognition = (service as any).recognition;
      if (mockRecognition && mockRecognition.onerror) {
        mockRecognition.onerror({
          error: 'aborted',
          message: 'Aborted',
        } as SpeechRecognitionErrorEvent);
      }

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
    });
  });
});
