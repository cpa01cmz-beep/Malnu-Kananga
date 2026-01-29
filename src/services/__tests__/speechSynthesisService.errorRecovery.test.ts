import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import SpeechSynthesisService from '../speechSynthesisService';

/* eslint-disable no-undef */

describe('SpeechSynthesisService - Error Recovery', () => {
  let service: SpeechSynthesisService;

  beforeEach(() => {
    cleanup();

    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    const mockPause = vi.fn();
    const mockResume = vi.fn();
    const mockGetVoices = vi.fn(() => []);

    global.window = {
      speechSynthesis: {
        speak: mockSpeak,
        cancel: mockCancel,
        pause: mockPause,
        resume: mockResume,
        getVoices: mockGetVoices,
        speaking: false,
        paused: false,
        onvoiceschanged: null,
      } as unknown as SpeechSynthesis,
      SpeechSynthesisUtterance: vi.fn(function(this: unknown, text: string) {
        (this as { text: string }).text = text;
        (this as { rate: number }).rate = 1;
        (this as { pitch: number }).pitch = 1;
        (this as { volume: number }).volume = 1;
        (this as { voice: unknown }).voice = null;
        (this as { onstart: unknown }).onstart = null;
        (this as { onend: unknown }).onend = null;
        (this as { onerror: unknown }).onerror = null;
        (this as { onpause: unknown }).onpause = null;
        (this as { onresume: unknown }).onresume = null;
        (this as { onboundary: unknown }).onboundary = null;
      }) as unknown as typeof window.SpeechSynthesisUtterance,
    } as unknown as Window & typeof globalThis;

    service = new SpeechSynthesisService();
  });

  afterEach(() => {
    if (service) {
      service.cleanup();
    }
    cleanup();
  });

  describe('Constructor Validation', () => {
    it('should accept valid config without throwing', () => {
      expect(() => {
        const validService = new SpeechSynthesisService({
          rate: 1,
          pitch: 1,
          volume: 1,
        });
        validService.cleanup();
      }).not.toThrow();
    });

    it('should throw error for rate below minimum (0.1)', () => {
      expect(() => {
        new SpeechSynthesisService({ rate: 0.05 });
      }).toThrow('Invalid rate');
    });

    it('should throw error for rate above maximum (10)', () => {
      expect(() => {
        new SpeechSynthesisService({ rate: 11 });
      }).toThrow('Invalid rate');
    });

    it('should throw error for pitch below minimum (0)', () => {
      expect(() => {
        new SpeechSynthesisService({ pitch: -0.1 });
      }).toThrow('Invalid pitch');
    });

    it('should throw error for pitch above maximum (2)', () => {
      expect(() => {
        new SpeechSynthesisService({ pitch: 2.1 });
      }).toThrow('Invalid pitch');
    });

    it('should throw error for volume below minimum (0)', () => {
      expect(() => {
        new SpeechSynthesisService({ volume: -0.1 });
      }).toThrow('Invalid volume');
    });

    it('should throw error for volume above maximum (1)', () => {
      expect(() => {
        new SpeechSynthesisService({ volume: 1.1 });
      }).toThrow('Invalid volume');
    });

    it('should accept boundary values', () => {
      expect(() => {
        const validService = new SpeechSynthesisService({
          rate: 0.1,
          pitch: 0,
          volume: 0,
        });
        validService.cleanup();
      }).not.toThrow();

      expect(() => {
        const validService2 = new SpeechSynthesisService({
          rate: 10,
          pitch: 2,
          volume: 1,
        });
        validService2.cleanup();
      }).not.toThrow();
    });
  });

  describe('Error Recovery State Management', () => {
    it('should return complete error recovery state', () => {
      const state = service.getErrorRecoveryState();

      expect(state).toHaveProperty('errorCount');
      expect(state).toHaveProperty('lastErrorTime');
      expect(state).toHaveProperty('circuitBreakerOpen');
      expect(state).toHaveProperty('circuitBreakerFailureCount');
      expect(state).toHaveProperty('circuitBreakerLastFailureTime');
      expect(state).toHaveProperty('circuitBreakerLastSuccessTime');
    });

    it('should initialize with zero errors and closed circuit', () => {
      const state = service.getErrorRecoveryState();

      expect(state.errorCount).toBe(0);
      expect(state.lastErrorTime).toBeNull();
      expect(state.circuitBreakerOpen).toBe(false);
      expect(state.circuitBreakerFailureCount).toBe(0);
    });

    it('should return correct circuit breaker open state', () => {
      expect(service.isCircuitBreakerOpen()).toBe(false);

      service.resetErrorRecovery();

      expect(service.isCircuitBreakerOpen()).toBe(false);
    });

    it('should reset circuit breaker after reset is called', () => {
      service.resetErrorRecovery();

      const errorState = service.getErrorRecoveryState();
      expect(errorState.errorCount).toBe(0);
      expect(errorState.lastErrorTime).toBeNull();
      expect(errorState.circuitBreakerOpen).toBe(false);
      expect(errorState.circuitBreakerFailureCount).toBe(0);
      expect(errorState.circuitBreakerLastFailureTime).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text gracefully', async () => {
      const mockSynth = global.window.speechSynthesis as unknown as {
        speak: ReturnType<typeof vi.fn>;
        cancel: ReturnType<typeof vi.fn>;
      };

      service.speak('');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSynth.speak).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only text gracefully', async () => {
      const mockSynth = global.window.speechSynthesis as unknown as {
        speak: ReturnType<typeof vi.fn>;
        cancel: ReturnType<typeof vi.fn>;
      };

      service.speak('   ');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSynth.speak).not.toHaveBeenCalled();
    });

    it('should handle special characters in text', async () => {
      const mockSynth = global.window.speechSynthesis as unknown as {
        speak: ReturnType<typeof vi.fn>;
        cancel: ReturnType<typeof vi.fn>;
      };

      const specialText = 'Hello, world! @#$%^&*()_+-=[]{}|;:,.<>?/~`';
      service.speak(specialText);
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(mockSynth.speak).toHaveBeenCalledTimes(1);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate all config properties on initialization', () => {
      const invalidConfigs = [
        { rate: 0.05 },
        { rate: 11 },
        { pitch: -0.1 },
        { pitch: 2.1 },
        { volume: -0.1 },
        { volume: 1.1 },
      ];

      invalidConfigs.forEach(config => {
        expect(() => {
          const testService = new SpeechSynthesisService(config);
          testService.cleanup();
        }).toThrow();
      });
    });

    it('should merge config with defaults correctly', () => {
      const testService = new SpeechSynthesisService({ rate: 0.5 });
      const config = testService.getConfig();

      expect(config.rate).toBe(0.5);
      expect(config.pitch).toBeDefined();
      expect(config.volume).toBeDefined();

      testService.cleanup();
    });
  });

  describe('Error Recovery Infrastructure', () => {
    it('should have error recovery strategy initialized', () => {
      const state = service.getErrorRecoveryState();

      expect(state).toBeDefined();
      expect(state.circuitBreakerOpen).toBeDefined();
    });

    it('should provide methods to access error recovery state', () => {
      expect(typeof service.getErrorRecoveryState).toBe('function');
      expect(typeof service.resetErrorRecovery).toBe('function');
      expect(typeof service.isCircuitBreakerOpen).toBe('function');
    });

    it('should reset error tracking on demand', () => {
      service.resetErrorRecovery();

      const state = service.getErrorRecoveryState();
      expect(state.errorCount).toBe(0);
      expect(state.lastErrorTime).toBeNull();
    });
  });
});
