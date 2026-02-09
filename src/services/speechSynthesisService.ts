  
 
import type {
  SpeechSynthesisConfig,
  SpeechSynthesisError,
  SpeechSynthesisEventCallbacks,
  SpeechSynthesisState,
  SpeechSynthesis,
  SpeechSynthesisUtterance,
  SpeechSynthesisErrorEvent,
  SpeechSynthesisEvent,
  SpeechSynthesisVoice,
} from '../types';
import { VOICE_CONFIG, RETRY_CONFIG, BACKOFF_CONFIG } from '../constants';
import { logger } from '../utils/logger';
import { validateSpeechSynthesisConfig } from '../utils/voiceSettingsValidation';
import { ErrorRecoveryStrategy } from '../utils/errorRecovery';

class SpeechSynthesisService {
  private synth: SpeechSynthesis | null;
  private state: SpeechSynthesisState = 'idle';
  private config: SpeechSynthesisConfig;
  private callbacks: SpeechSynthesisEventCallbacks = {};
  private voiceCache: Map<string, SpeechSynthesisUtterance> = new Map();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  private errorRecovery: ErrorRecoveryStrategy;
  private speakAttempts: number = 0;
  private readonly maxSpeakAttempts: number = VOICE_CONFIG.MAX_SPEAK_ATTEMPTS;

  constructor(config?: Partial<SpeechSynthesisConfig>) {
    const partialConfig = {
      ...VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG,
      ...config,
      voice: config?.voice ?? null,
    };

    const validation = validateSpeechSynthesisConfig(partialConfig);
    if (!validation.isValid) {
      logger.error('Invalid speech synthesis config:', validation.errors);
      throw new Error(`Konfigurasi speech synthesis tidak valid: ${validation.errors.join(', ')}`);
    }

    this.config = partialConfig;
    this.synth = null;

    this.isSupported = this.checkSupport();

    this.errorRecovery = new ErrorRecoveryStrategy(
      {
        maxAttempts: this.maxSpeakAttempts,
        initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
        maxDelay: BACKOFF_CONFIG.DEFAULT_MAX_DELAY_MS,
        backoffFactor: BACKOFF_CONFIG.DEFAULT_MULTIPLIER,
        shouldRetry: (error: Error, attempt: number) => {
          const shouldRetry = this.shouldRetrySpeakError(error, attempt);
          return shouldRetry;
        },
      },
      {
        failureThreshold: RETRY_CONFIG.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
        resetTimeout: RETRY_CONFIG.CIRCUIT_BREAKER_TIMEOUT,
        monitoringPeriod: RETRY_CONFIG.DEFAULT_MONITORING_PERIOD,
      }
    );

    if (this.isSupported && typeof window !== 'undefined') {
      this.initializeSynthesis();
    }
  }

  private checkSupport(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return 'speechSynthesis' in window;
  }

  private shouldRetrySpeakError(error: Error, attempt: number): boolean {
    const errorMessage = error.message.toLowerCase();

    if (attempt >= this.maxSpeakAttempts) {
      logger.debug('Max retry attempts reached for speech synthesis speak');
      return false;
    }

    if (errorMessage.includes('not-allowed') || errorMessage.includes('permission')) {
      logger.debug('Permission denied error, not retrying');
      return false;
    }

    if (errorMessage.includes('canceled') || errorMessage.includes('interrupted')) {
      logger.debug('User-initiated cancellation, not retrying');
      return false;
    }

    if (errorMessage.includes('network') || errorMessage.includes('audio-capture')) {
      logger.debug(`Retryable error detected (attempt ${attempt}):`, error.message);
      return true;
    }

    logger.debug(`Unknown error, will retry (attempt ${attempt}):`, error.message);
    return true;
  }

  private initializeSynthesis(): void {
    try {
      this.synth = window.speechSynthesis as SpeechSynthesis;
      this.loadVoices();
      this.setupVoiceChangeListener();
    } catch (error) {
      logger.error('Failed to initialize SpeechSynthesis:', error);
      this.isSupported = false;
    }
  }

  private setupVoiceChangeListener(): void {
    if (!this.synth) return;

    const handleVoicesChanged = () => {
      this.loadVoices();
    };

    this.synth.onvoiceschanged = handleVoicesChanged;

    if (this.synth.getVoices().length > 0) {
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;

    try {
      this.voices = this.synth.getVoices();
      logger.debug(`Loaded ${this.voices.length} voices`);

      if (this.config.voice === null) {
        this.setDefaultVoice();
      }
    } catch (error) {
      logger.error('Failed to load voices:', error);
    }
  }

  private setDefaultVoice(): void {
    const preferredLanguage = 'id-ID';
    const fallbackLanguage = 'en-US';

    let voice = this.voices.find((v: SpeechSynthesisVoice) => v.lang === preferredLanguage && v.localService);

    if (!voice) {
      voice = this.voices.find((v: SpeechSynthesisVoice) => v.lang === fallbackLanguage && v.localService);
    }

    if (!voice) {
      voice = this.voices.find((v: SpeechSynthesisVoice) => v.lang === preferredLanguage);
    }

    if (!voice && this.voices.length > 0) {
      voice = this.voices[0];
    }

    if (voice) {
      this.config.voice = voice;
      logger.debug('Default voice set:', voice.name, voice.lang);
    }
  }

  private createUtterance(text: string): SpeechSynthesisUtterance {
    const utterance = new window.SpeechSynthesisUtterance(text);

    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;

    if (this.config.voice) {
      (utterance as unknown as { voice: unknown }).voice = this.config.voice;
    }

    return utterance as unknown as SpeechSynthesisUtterance;
  }

  private setupUtteranceListeners(utterance: SpeechSynthesisUtterance): void {
    utterance.onstart = () => {
      this.state = 'speaking';
      this.callbacks.onStart?.();
    };

    utterance.onend = () => {
      this.state = 'idle';
      this.currentUtterance = null;

      this.speakAttempts = 0;

      if (this.errorRecovery.getCircuitBreakerState().failureCount > 0) {
        this.errorRecovery.resetCircuitBreaker();
        logger.debug('Circuit breaker reset after successful synthesis');
      }

      this.callbacks.onEnd?.();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      const errorType = event.error || 'unknown';
      const error: SpeechSynthesisError = {
        error: this.mapErrorType(errorType),
        message: (event as unknown as { message?: string }).message || 'Speech synthesis error occurred',
      };

      logger.error('Speech synthesis error:', error);

      const errorObj = new Error(error.message);

      if (errorType !== 'canceled' && errorType !== 'interrupted') {
        try {
          this.errorRecovery.execute(
            async () => {
              throw errorObj;
            },
            'handleError'
          ).catch(() => {
            logger.debug('Error tracked in circuit breaker');
          });
        } catch (err) {
          logger.warn('Failed to track error in circuit breaker:', err);
        }
      }

      this.state = 'error';
      this.currentUtterance = null;
      this.callbacks.onError?.(error);
    };

    utterance.onpause = () => {
      this.state = 'paused';
      this.callbacks.onPause?.();
    };

    utterance.onresume = () => {
      this.state = 'speaking';
      this.callbacks.onResume?.();
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      this.callbacks.onBoundary?.(event);
    };
  }

  private mapErrorType(errorName: string): SpeechSynthesisError['error'] {
    const errorMap: Record<string, SpeechSynthesisError['error']> = {
      'canceled': 'canceled',
      'interrupted': 'interrupted',
      'not-allowed': 'not-allowed',
      'unknown': 'unknown',
    };

    return errorMap[errorName] || 'unknown';
  }

  private mapErrorTypeFromMessage(message: string): SpeechSynthesisError['error'] {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('not-allowed') || lowerMessage.includes('permission')) {
      return 'not-allowed';
    } else if (lowerMessage.includes('canceled') || lowerMessage.includes('cancel')) {
      return 'canceled';
    } else if (lowerMessage.includes('interrupted')) {
      return 'interrupted';
    } else if (lowerMessage.includes('circuit breaker') || lowerMessage.includes('network')) {
      return 'unknown';
    }

    return 'unknown';
  }

  private checkCache(text: string): SpeechSynthesisUtterance | null {
    return this.voiceCache.get(text) || null;
  }

  private addToCache(text: string, utterance: SpeechSynthesisUtterance): void {
    if (this.voiceCache.size >= VOICE_CONFIG.MAX_VOICE_CACHE_SIZE) {
      const firstKey = this.voiceCache.keys().next().value;
      if (firstKey) {
        this.voiceCache.delete(firstKey);
      }
    }

    this.voiceCache.set(text, utterance);
  }

  public async speak(text: string): Promise<void> {
    if (!this.isSupported) {
      const error: SpeechSynthesisError = {
        error: 'unknown',
        message: 'Browser does not support speech synthesis',
      };
      this.callbacks.onError?.(error);
      return;
    }

    if (!text || text.trim() === '') {
      logger.debug('Empty text provided to speak');
      return;
    }

    if (this.state === 'speaking') {
      this.stop();
    }

    if (this.errorRecovery.getCircuitBreakerState().isOpen) {
      logger.warn('Circuit breaker is open, skipping speak attempt');
      const error: SpeechSynthesisError = {
        error: 'unknown',
        message: 'Speech synthesis sementara tidak tersedia karena terlalu banyak kegagalan. Silakan coba lagi dalam beberapa saat.',
      };
      this.callbacks.onError?.(error);
      return;
    }

    this.speakAttempts = 0;

    try {
      await this.errorRecovery.execute(
        async () => {
          this.speakAttempts++;
          logger.debug(`Speaking text (attempt ${this.speakAttempts}/${this.maxSpeakAttempts}):`, text.substring(0, 50));

          const utterance = this.checkCache(text) || this.createUtterance(text);
          this.setupUtteranceListeners(utterance);

          if (!this.voiceCache.has(text)) {
            this.addToCache(text, utterance);
          }

          this.currentUtterance = utterance;

          if (!this.synth) {
            throw new Error('Speech synthesis not initialized');
          }

          this.synth.speak(utterance);
          logger.debug('Speech synthesis started successfully');
        },
        'speak'
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to speak after retries:', err);

      let errorMessage = 'Gagal memproses sintesis suara';

      if (err.message.includes('not-allowed') || err.message.includes('Permission denied')) {
        errorMessage = 'Izin sintesis suara ditolak. Pastikan browser Anda mengizinkan sintesis suara.';
      } else if (err.message.includes('circuit breaker')) {
        errorMessage = 'Speech synthesis sementara tidak tersedia karena terlalu banyak kegagalan. Silakan coba lagi dalam beberapa saat.';
      } else {
        errorMessage = err.message;
      }

      const speechError: SpeechSynthesisError = {
        error: this.mapErrorTypeFromMessage(errorMessage),
        message: errorMessage,
      };
      this.callbacks.onError?.(speechError);
    }
  }

  public pause(): void {
    if (!this.synth || this.state !== 'speaking') {
      return;
    }

    try {
      this.synth.pause();
      logger.debug('Speech synthesis paused');
    } catch (error) {
      logger.error('Failed to pause speech synthesis:', error);
    }
  }

  public resume(): void {
    if (!this.synth || this.state !== 'paused') {
      return;
    }

    try {
      this.synth.resume();
      logger.debug('Speech synthesis resumed');
    } catch (error) {
      logger.error('Failed to resume speech synthesis:', error);
    }
  }

  public stop(): void {
    if (!this.synth) {
      return;
    }

    try {
      this.synth.cancel();
      this.state = 'idle';
      this.currentUtterance = null;
      logger.debug('Speech synthesis stopped');
    } catch (error) {
      logger.error('Failed to stop speech synthesis:', error);
    }
  }

  public isSpeaking(): boolean {
    return this.state === 'speaking' && (this.synth?.speaking || false);
  }

  public isPaused(): boolean {
    return this.state === 'paused' && (this.synth?.paused || false);
  }

  public getState(): SpeechSynthesisState {
    return this.state;
  }

  public setVoice(voice: SpeechSynthesisVoice): void {
    this.config.voice = voice;
    logger.debug('Voice set to:', voice.name, voice.lang);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.voices.filter((voice: SpeechSynthesisVoice) => voice.lang.startsWith(language));
  }

  public setRate(rate: number): void {
    if (rate < 0.1 || rate > 10) {
      logger.warn('Rate must be between 0.1 and 10');
      return;
    }

    this.config.rate = rate;
    logger.debug('Rate set to:', rate);
  }

  public setPitch(pitch: number): void {
    if (pitch < 0 || pitch > 2) {
      logger.warn('Pitch must be between 0 and 2');
      return;
    }

    this.config.pitch = pitch;
    logger.debug('Pitch set to:', pitch);
  }

  public setVolume(volume: number): void {
    if (volume < 0 || volume > 1) {
      logger.warn('Volume must be between 0 and 1');
      return;
    }

    this.config.volume = volume;
    logger.debug('Volume set to:', volume);
  }

  public getConfig(): SpeechSynthesisConfig {
    return { ...this.config };
  }

  public onStart(callback: () => void): void {
    this.callbacks.onStart = callback;
  }

  public onEnd(callback: () => void): void {
    this.callbacks.onEnd = callback;
  }

  public onError(callback: (error: SpeechSynthesisError) => void): void {
    this.callbacks.onError = callback;
  }

  public onPause(callback: () => void): void {
    this.callbacks.onPause = callback;
  }

  public onResume(callback: () => void): void {
    this.callbacks.onResume = callback;
  }

  public onBoundary(callback: (event: Event) => void): void {
    this.callbacks.onBoundary = callback;
  }

  public cleanup(): void {
    this.stop();
    this.callbacks = {};
    this.voiceCache.clear();
    this.currentUtterance = null;
    this.state = 'idle';
    logger.debug('SpeechSynthesisService cleaned up');
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getCircuitBreakerState(): { isOpen: boolean; failureCount: number; lastFailureTime: number | null; lastSuccessTime: number | null } {
    return this.errorRecovery.getCircuitBreakerState();
  }

  public resetCircuitBreaker(): void {
    this.errorRecovery.resetCircuitBreaker();
    logger.info('Circuit breaker reset');
  }

  public getErrorRecoveryState(): {
    circuitBreaker: { isOpen: boolean; failureCount: number; lastFailureTime: number | null; lastSuccessTime: number | null };
    speakAttempts: number;
  } {
    return {
      circuitBreaker: this.getCircuitBreakerState(),
      speakAttempts: this.speakAttempts,
    };
  }
}

export default SpeechSynthesisService;
