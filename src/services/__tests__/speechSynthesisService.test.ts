import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SpeechSynthesisService from '../speechSynthesisService';
import type { SpeechSynthesisErrorEvent, SpeechSynthesisVoice } from '../../types';

// Mock Web Speech API
class MockSpeechSynthesis {
  speaking: boolean = false;
  paused: boolean = false;
  pending: boolean = false;
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

class MockSpeechSynthesisUtterance {
  text: string;
  rate: number = 1;
  pitch: number = 1;
  volume: number = 1;
  voice: SpeechSynthesisVoice | null = null;
  lang: string = '';
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

describe('SpeechSynthesisService', () => {
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

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      service = new SpeechSynthesisService();
      expect(service).toBeDefined();
      expect(service.getIsSupported()).toBe(true);
    });

    it('should handle unsupported browsers', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      service = new SpeechSynthesisService();
      expect(service.getIsSupported()).toBe(false);
    });

    it('should load voices and set default voice', () => {
      const mockVoice: SpeechSynthesisVoice = {
        name: 'Google Bahasa Indonesia',
        lang: 'id-ID',
        localService: true,
        voiceURI: 'urn:moz-tts:indonesian',
        default: false,
      };

      mockSynth.getVoices = vi.fn(() => [mockVoice]);

      service = new SpeechSynthesisService();
      const config = service.getConfig();
      expect(config.voice).toEqual(mockVoice);
    });

    it('should setup voice change listener', () => {
      service = new SpeechSynthesisService();
      expect(mockSynth.onvoiceschanged).toBeDefined();
      expect(typeof mockSynth.onvoiceschanged).toBe('function');
    });
  });

  describe('Voice Management', () => {
    beforeEach(() => {
      const mockVoices: SpeechSynthesisVoice[] = [
        {
          name: 'Google Bahasa Indonesia',
          lang: 'id-ID',
          localService: true,
          voiceURI: 'urn:moz-tts:indonesian',
          default: false,
        },
        {
          name: 'Google English US',
          lang: 'en-US',
          localService: true,
          voiceURI: 'urn:moz-tts:english',
          default: false,
        },
        {
          name: 'Microsoft Zira',
          lang: 'en-US',
          localService: false,
          voiceURI: 'urn:moz-tts:zira',
          default: false,
        },
      ];

      mockSynth.getVoices = vi.fn(() => mockVoices);
      service = new SpeechSynthesisService();
    });

    it('should get available voices', () => {
      const voices = service!.getAvailableVoices();
      expect(voices).toHaveLength(3);
      expect(voices[0].name).toBe('Google Bahasa Indonesia');
    });

    it('should filter voices by language', () => {
      const indonesianVoices = service!.getVoicesByLanguage('id');
      expect(indonesianVoices).toHaveLength(1);
      expect(indonesianVoices[0].lang).toBe('id-ID');

      const englishVoices = service!.getVoicesByLanguage('en');
      expect(englishVoices).toHaveLength(2);
    });

    it('should set voice', () => {
      const voices = service!.getAvailableVoices();
      const newVoice = voices[1];

      service!.setVoice(newVoice);
      const config = service!.getConfig();
      expect(config.voice).toBe(newVoice);
    });
  });

  describe('Configuration', () => {
    beforeEach(() => {
      service = new SpeechSynthesisService();
    });

    it('should get initial config', () => {
      const config = service!.getConfig();
      expect(config).toHaveProperty('rate');
      expect(config).toHaveProperty('pitch');
      expect(config).toHaveProperty('volume');
      expect(config.rate).toBeGreaterThan(0);
      expect(config.pitch).toBeGreaterThanOrEqual(0);
      expect(config.volume).toBeGreaterThanOrEqual(0);
    });

    it('should set rate within valid range', () => {
      service!.setRate(1.5);
      expect(service!.getConfig().rate).toBe(1.5);

      service!.setRate(0.1);
      expect(service!.getConfig().rate).toBe(0.1);

      service!.setRate(10);
      expect(service!.getConfig().rate).toBe(10);
    });

    it('should reject invalid rate values', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      service!.setRate(0);
      expect(service!.getConfig().rate).not.toBe(0);

      service!.setRate(11);
      expect(service!.getConfig().rate).not.toBe(11);

      consoleSpy.mockRestore();
    });

    it('should set pitch within valid range', () => {
      service!.setPitch(1.5);
      expect(service!.getConfig().pitch).toBe(1.5);

      service!.setPitch(0);
      expect(service!.getConfig().pitch).toBe(0);

      service!.setPitch(2);
      expect(service!.getConfig().pitch).toBe(2);
    });

    it('should reject invalid pitch values', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      service!.setPitch(-1);
      expect(service!.getConfig().pitch).not.toBe(-1);

      service!.setPitch(3);
      expect(service!.getConfig().pitch).not.toBe(3);

      consoleSpy.mockRestore();
    });

    it('should set volume within valid range', () => {
      service!.setVolume(0.5);
      expect(service!.getConfig().volume).toBe(0.5);

      service!.setVolume(0);
      expect(service!.getConfig().volume).toBe(0);

      service!.setVolume(1);
      expect(service!.getConfig().volume).toBe(1);
    });

    it('should reject invalid volume values', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      service!.setVolume(-1);
      expect(service!.getConfig().volume).not.toBe(-1);

      service!.setVolume(2);
      expect(service!.getConfig().volume).not.toBe(2);

      consoleSpy.mockRestore();
    });
  });

  describe('Speech Control', () => {
    beforeEach(() => {
      service = new SpeechSynthesisService();
    });

    it('should pause speech', () => {
      const pauseSpy = vi.spyOn(mockSynth, 'pause');
      (service as any).state = 'speaking';

      service!.pause();

      expect(pauseSpy).toHaveBeenCalled();
    });

    it('should not pause when not speaking', () => {
      const pauseSpy = vi.spyOn(mockSynth, 'pause');
      (service as any).state = 'idle';

      service!.pause();

      expect(pauseSpy).not.toHaveBeenCalled();
    });

    it('should resume speech', () => {
      const resumeSpy = vi.spyOn(mockSynth, 'resume');
      (service as any).state = 'paused';

      service!.resume();

      expect(resumeSpy).toHaveBeenCalled();
    });

    it('should not resume when not paused', () => {
      const resumeSpy = vi.spyOn(mockSynth, 'resume');
      (service as any).state = 'idle';

      service!.resume();

      expect(resumeSpy).not.toHaveBeenCalled();
    });

    it('should stop speech', () => {
      const cancelSpy = vi.spyOn(mockSynth, 'cancel');

      service!.stop();

      expect(cancelSpy).toHaveBeenCalled();
      expect((service as any).currentUtterance).toBeNull();
      expect(service!.getState()).toBe('idle');
    });

    it('should report speaking status', () => {
      mockSynth.speaking = true;
      (service as any).state = 'speaking';

      expect(service!.isSpeaking()).toBe(true);

      mockSynth.speaking = false;
      (service as any).state = 'idle';

      expect(service!.isSpeaking()).toBe(false);
    });

    it('should report paused status', () => {
      mockSynth.paused = true;
      (service as any).state = 'paused';

      expect(service!.isPaused()).toBe(true);

      mockSynth.paused = false;
      (service as any).state = 'speaking';

      expect(service!.isPaused()).toBe(false);
    });
  });

  describe('Event Callbacks', () => {
    beforeEach(() => {
      service = new SpeechSynthesisService();
    });

    it('should register and trigger onStart callback', async () => {
      const onStartSpy = vi.fn();
      
      service!.onStart(onStartSpy);

      mockSynth.speak = vi.fn((utterance) => {
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
        }, 0);
      });

      await service!.speak('Test');
      await vi.advanceTimersByTimeAsync(50);

      expect(onStartSpy).toHaveBeenCalled();
    });

    it('should register and trigger onEnd callback', async () => {
      const onEndSpy = vi.fn();
      
      service!.onEnd(onEndSpy);

      mockSynth.speak = vi.fn((utterance) => {
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
          setTimeout(() => {
            if (utterance.onend) utterance.onend();
          }, 50);
        }, 0);
      });

      await service!.speak('Test');
      await vi.advanceTimersByTimeAsync(100);

      expect(onEndSpy).toHaveBeenCalled();
    });

    it('should register and trigger onPause callback', async () => {
      const onPauseSpy = vi.fn();
      
      service!.onPause(onPauseSpy);

      mockSynth.speak = vi.fn((utterance) => {
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
          setTimeout(() => {
            if (utterance.onpause) utterance.onpause();
          }, 50);
        }, 0);
      });

      await service!.speak('Test');
      await vi.advanceTimersByTimeAsync(100);

      expect(onPauseSpy).toHaveBeenCalled();
    });

    it('should register and trigger onResume callback', async () => {
      const onResumeSpy = vi.fn();
      
      service!.onResume(onResumeSpy);

      mockSynth.speak = vi.fn((utterance) => {
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
          setTimeout(() => {
            if (utterance.onpause) utterance.onpause();
            setTimeout(() => {
              if (utterance.onresume) utterance.onresume();
            }, 25);
          }, 25);
        }, 0);
      });

      await service!.speak('Test');
      await vi.advanceTimersByTimeAsync(100);

      expect(onResumeSpy).toHaveBeenCalled();
    });

    it('should register and trigger onBoundary callback', async () => {
      const onBoundarySpy = vi.fn();
      
      service!.onBoundary(onBoundarySpy);

      mockSynth.speak = vi.fn((utterance) => {
        setTimeout(() => {
          if (utterance.onboundary) {
            utterance.onboundary(new Event('boundary'));
          }
        }, 0);
      });

      await service!.speak('Test');
      await vi.advanceTimersByTimeAsync(50);

      expect(onBoundarySpy).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      service = new SpeechSynthesisService();
    });

    it('should cleanup resources', () => {
      const stopSpy = vi.spyOn(mockSynth, 'cancel');
      
      service!.cleanup();

      expect(stopSpy).toHaveBeenCalled();
      expect((service as any).currentUtterance).toBeNull();
      expect((service as any).voiceCache.size).toBe(0);
      expect(service!.getState()).toBe('idle');
    });

    it('should provide circuit breaker state', () => {
      const state = service!.getCircuitBreakerState();

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('lastSuccessTime');
      expect(typeof state.isOpen).toBe('boolean');
      expect(typeof state.failureCount).toBe('number');
    });

    it('should reset circuit breaker', () => {
      service!.resetCircuitBreaker();

      const state = service!.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should provide error recovery state', () => {
      const state = service!.getErrorRecoveryState();

      expect(state).toHaveProperty('circuitBreaker');
      expect(state).toHaveProperty('speakAttempts');
      expect(state.circuitBreaker).toHaveProperty('isOpen');
      expect(state.circuitBreaker).toHaveProperty('failureCount');
    });
  });

  describe('Speech Synthesis', () => {
    beforeEach(() => {
      service = new SpeechSynthesisService();
    });

    it('should handle empty text', async () => {
      const speakSpy = vi.spyOn(mockSynth, 'speak');

      await service!.speak('');
      await service!.speak('   ');

      expect(speakSpy).not.toHaveBeenCalled();
    });

    it('should stop current speech before starting new one', async () => {
      const stopSpy = vi.spyOn(mockSynth, 'cancel');
      
      // Set initial state to speaking
      (service as any).state = 'speaking';

      await service!.speak('New text');

      expect(stopSpy).toHaveBeenCalled();
    });

    it('should handle unsupported browser', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      const errorSpy = vi.fn();
      const unsupportedService = new SpeechSynthesisService();
      unsupportedService.onError(errorSpy);

      await unsupportedService.speak('Hello');

      expect(errorSpy).toHaveBeenCalledWith({
        error: 'unknown',
        message: 'Browser does not support speech synthesis',
      });
    });

    it('should cache utterances', async () => {
      const text = 'Cached text';
      
      mockSynth.speak = vi.fn((utterance) => {
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
          setTimeout(() => {
            if (utterance.onend) utterance.onend();
          }, 50);
        }, 0);
      });

      // First call
      await service!.speak(text);
      await vi.advanceTimersByTimeAsync(100);

      // Second call should use cache
      const speakSpy = vi.spyOn(mockSynth, 'speak');
      await service!.speak(text);
      await vi.advanceTimersByTimeAsync(100);

      // Should still call speak, but with cached utterance
      expect(speakSpy).toHaveBeenCalled();
    });
  });
});