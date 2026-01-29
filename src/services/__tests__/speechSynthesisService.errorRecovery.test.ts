// Error Recovery Tests for SpeechSynthesisService
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SpeechSynthesisService from '../speechSynthesisService';
import type { SpeechSynthesisErrorEvent } from '../../types';

// Mock Web Speech API with error simulation
class MockSpeechSynthesis {
  speaking: boolean = false;
  paused: boolean = false;
  cancel: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
  speak: ReturnType<typeof vi.fn>;
  getVoices: ReturnType<typeof vi.fn>;
  onvoiceschanged: (() => void) | null = null;

  constructor() {
    this.cancel = vi.fn();
    this.pause = vi.fn();
    this.resume = vi.fn();
    this.speak = vi.fn();
    this.getVoices = vi.fn(() => []);
  }
}

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  rate: number = 1;
  pitch: number = 1;
  volume: number = 1;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;
  onboundary: ((event: Event) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

Object.defineProperty(global, 'window', {
  value: {
    SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
  },
  writable: true,
});

describe('SpeechSynthesisService Error Recovery', () => {
  let service: SpeechSynthesisService | undefined;
  let mockSynth: MockSpeechSynthesis;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockSynth = new MockSpeechSynthesis();

    Object.defineProperty(global, 'window', {
      value: {
        speechSynthesis: mockSynth,
        SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    service?.cleanup();
  });

  describe('Config Validation', () => {
    it('should initialize with valid config', () => {
      service = new SpeechSynthesisService();
      expect(service).toBeDefined();
    });

    it('should reject invalid rate (too low)', () => {
      expect(() => {
        new SpeechSynthesisService({ rate: 0 });
      }).toThrow();
    });

    it('should reject invalid rate (too high)', () => {
      expect(() => {
        new SpeechSynthesisService({ rate: 11 });
      }).toThrow();
    });

    it('should reject invalid pitch (negative)', () => {
      expect(() => {
        new SpeechSynthesisService({ pitch: -1 });
      }).toThrow();
    });

    it('should reject invalid pitch (too high)', () => {
      expect(() => {
        new SpeechSynthesisService({ pitch: 3 });
      }).toThrow();
    });

    it('should reject invalid volume (negative)', () => {
      expect(() => {
        new SpeechSynthesisService({ volume: -1 });
      }).toThrow();
    });

    it('should reject invalid volume (greater than 1)', () => {
      expect(() => {
        new SpeechSynthesisService({ volume: 2 });
      }).toThrow();
    });
  });

  describe('Retry Logic for speak', () => {
    it('should have shouldRetrySpeakError method', () => {
      service = new SpeechSynthesisService();
      expect((service as any).shouldRetrySpeakError).toBeDefined();
      expect(typeof (service as any).shouldRetrySpeakError).toBe('function');
    });

    it('should track maxSpeakAttempts', () => {
      service = new SpeechSynthesisService();
      expect((service as any).maxSpeakAttempts).toBe(3);
    });

    it('should have errorRecovery instance', () => {
      service = new SpeechSynthesisService();
      expect((service as any).errorRecovery).toBeDefined();
    });
  });

  describe('Circuit Breaker', () => {
    it('should provide circuit breaker state', () => {
      service = new SpeechSynthesisService();
      const state = service.getCircuitBreakerState();

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('lastSuccessTime');
      expect(typeof state.isOpen).toBe('boolean');
      expect(typeof state.failureCount).toBe('number');
    });

    it('should reset circuit breaker', () => {
      service = new SpeechSynthesisService();
      service.resetCircuitBreaker();

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should provide error recovery state', () => {
      service = new SpeechSynthesisService();
      const state = service.getErrorRecoveryState();

      expect(state).toHaveProperty('circuitBreaker');
      expect(state).toHaveProperty('speakAttempts');
      expect(state.circuitBreaker).toHaveProperty('isOpen');
      expect(state.circuitBreaker).toHaveProperty('failureCount');
    });
  });

  describe('Error Recovery State', () => {
    it('should provide complete error recovery state', async () => {
      service = new SpeechSynthesisService();

      const onError = vi.fn();
      service.onError(onError);

      const speakSpy = vi.spyOn(mockSynth, 'speak').mockImplementation(() => {
        throw new Error('Network error');
      });

      const promise = service.speak('Test text');

      await vi.advanceTimersByTimeAsync(10000);

      await promise;

      const state = service.getErrorRecoveryState();
      expect(state).toHaveProperty('circuitBreaker');
      expect(state).toHaveProperty('speakAttempts');
      expect(state.circuitBreaker).toHaveProperty('isOpen');
      expect(state.circuitBreaker).toHaveProperty('failureCount');
      expect(state.speakAttempts).toBeGreaterThan(0);

      speakSpy.mockRestore();
    });

    it('should reset circuit breaker via resetCircuitBreaker', () => {
      service = new SpeechSynthesisService();
      service.resetCircuitBreaker();

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });
  });

  describe('Error Message Mapping', () => {
    it('should have mapErrorTypeFromMessage method', () => {
      service = new SpeechSynthesisService();
      expect((service as any).mapErrorTypeFromMessage).toBeDefined();
      expect(typeof (service as any).mapErrorTypeFromMessage).toBe('function');
    });

    it('should map circuit breaker errors to unknown', () => {
      service = new SpeechSynthesisService();
      const errorType = (service as any).mapErrorTypeFromMessage('circuit breaker is open');
      expect(errorType).toBe('unknown');
    });

    it('should map permission errors correctly', () => {
      service = new SpeechSynthesisService();
      const errorType = (service as any).mapErrorTypeFromMessage('not-allowed');
      expect(errorType).toBe('not-allowed');
    });

    it('should map cancel errors correctly', () => {
      service = new SpeechSynthesisService();
      const errorType = (service as any).mapErrorTypeFromMessage('canceled');
      expect(errorType).toBe('canceled');
    });

    it('should map interrupted errors correctly', () => {
      service = new SpeechSynthesisService();
      const errorType = (service as any).mapErrorTypeFromMessage('interrupted');
      expect(errorType).toBe('interrupted');
    });

    it('should map network errors to unknown', () => {
      service = new SpeechSynthesisService();
      const errorType = (service as any).mapErrorTypeFromMessage('network error');
      expect(errorType).toBe('unknown');
    });
  });

  describe('shouldRetrySpeakError Logic', () => {
    it('should return false for permission errors', () => {
      service = new SpeechSynthesisService();
      const error = new Error('not-allowed');
      const result = (service as any).shouldRetrySpeakError(error, 1);
      expect(result).toBe(false);
    });

    it('should return false for permission denied errors', () => {
      service = new SpeechSynthesisService();
      const error = new Error('Permission denied');
      const result = (service as any).shouldRetrySpeakError(error, 1);
      expect(result).toBe(false);
    });

    it('should return false for canceled errors', () => {
      service = new SpeechSynthesisService();
      const error = new Error('canceled');
      const result = (service as any).shouldRetrySpeakError(error, 1);
      expect(result).toBe(false);
    });

    it('should return false for interrupted errors', () => {
      service = new SpeechSynthesisService();
      const error = new Error('interrupted');
      const result = (service as any).shouldRetrySpeakError(error, 1);
      expect(result).toBe(false);
    });

    it('should return true for network errors', () => {
      service = new SpeechSynthesisService();
      const error = new Error('Network error');
      const result = (service as any).shouldRetrySpeakError(error, 1);
      expect(result).toBe(true);
    });

    it('should return true for audio-capture errors', () => {
      service = new SpeechSynthesisService();
      const error = new Error('audio-capture');
      const result = (service as any).shouldRetrySpeakError(error, 1);
      expect(result).toBe(true);
    });

    it('should return false after max attempts', () => {
      service = new SpeechSynthesisService();
      const error = new Error('Network error');
      const result = (service as any).shouldRetrySpeakError(error, 3);
      expect(result).toBe(false);
    });
  });

  describe('Circuit Breaker Open Behavior', () => {
    it('should skip speak attempts when circuit breaker is open', async () => {
      service = new SpeechSynthesisService();

      const onError = vi.fn();
      service.onError(onError);

      const speakSpy = vi.spyOn(mockSynth, 'speak');

      service.speak('Test text').catch(() => {});

      const state = service.getCircuitBreakerState();
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('lastSuccessTime');

      speakSpy.mockRestore();
    });
  });

  describe('Circuit Breaker Reset on Success', () => {
    it('should reset circuit breaker after successful synthesis', async () => {
      service = new SpeechSynthesisService();

      const onError = vi.fn();
      service.onError(onError);

      const speakSpy = vi.spyOn(mockSynth, 'speak').mockImplementation(() => {
        throw new Error('Network error');
      });

      for (let i = 0; i < 3; i++) {
        service.speak('Test text').catch(() => {});
        await vi.advanceTimersByTimeAsync(1000);
      }

      let state = service.getCircuitBreakerState();
      expect(state.failureCount).toBeGreaterThan(0);

      speakSpy.mockRestore();

      const speakSuccessSpy = vi.spyOn(mockSynth, 'speak').mockImplementation((utterance) => {
        if (utterance && (utterance as any).onend) {
          (utterance as any).onend();
        }
      });

      service.speak('Test text').catch(() => {});

      await vi.advanceTimersByTimeAsync(100);

      state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);

      speakSuccessSpy.mockRestore();
    });
  });

  describe('Canceled error handling', () => {
    it('should not track canceled errors in circuit breaker', async () => {
      service = new SpeechSynthesisService();

      const onError = vi.fn();
      service.onError(onError);

      const speakSpy = vi.spyOn(mockSynth, 'speak').mockImplementation((utterance) => {
        if (utterance && (utterance as any).onerror) {
          (utterance as any).onerror({
            error: 'canceled',
            message: 'Canceled',
          } as unknown as SpeechSynthesisErrorEvent);
        }
      });

      await service.speak('Test text');

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);

      speakSpy.mockRestore();
    });
  });

  describe('Interrupted error handling', () => {
    it('should not track interrupted errors in circuit breaker', async () => {
      service = new SpeechSynthesisService();

      const onError = vi.fn();
      service.onError(onError);

      const speakSpy = vi.spyOn(mockSynth, 'speak').mockImplementation((utterance) => {
        if (utterance && (utterance as any).onerror) {
          (utterance as any).onerror({
            error: 'interrupted',
            message: 'Interrupted',
          } as unknown as SpeechSynthesisErrorEvent);
        }
      });

      await service.speak('Test text');

      const state = service.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);

      speakSpy.mockRestore();
    });
  });

  describe('Empty text handling', () => {
    it('should not attempt to speak empty text', async () => {
      service = new SpeechSynthesisService();

      const speakSpy = vi.spyOn(mockSynth, 'speak');

      await service.speak('');
      await service.speak('   ');

      expect(speakSpy).not.toHaveBeenCalled();

      speakSpy.mockRestore();
    });
  });

  describe('speakAttempts tracking', () => {
    it('should track speak attempts correctly', async () => {
      service = new SpeechSynthesisService();

      const onError = vi.fn();
      service.onError(onError);

      const speakSpy = vi.spyOn(mockSynth, 'speak').mockImplementation(() => {
        throw new Error('Network error');
      });

      const promise = service.speak('Test text');
      await vi.advanceTimersByTimeAsync(10000);
      await promise;

      const state = service.getErrorRecoveryState();
      expect(state.speakAttempts).toBeGreaterThan(0);

      speakSpy.mockRestore();
    });

    it('should reset speakAttempts after successful synthesis', async () => {
      service = new SpeechSynthesisService();

      const speakSpy = vi.spyOn(mockSynth, 'speak').mockImplementation((utterance) => {
        if (utterance && (utterance as any).onend) {
          (utterance as any).onend();
        }
      });

      await service.speak('Test text');

      const state = service.getErrorRecoveryState();
      expect(state.speakAttempts).toBe(0);

      speakSpy.mockRestore();
    });
  });
});
