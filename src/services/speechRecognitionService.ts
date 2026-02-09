 
  


import type {
  SpeechRecognitionConfig,
  SpeechRecognitionError,
  SpeechRecognitionEventCallbacks,
  SpeechRecognitionState,
  VoiceLanguage,
  SpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechWindow,
  SpeechRecognitionConstructor,
} from '../types';
import {
  VOICE_CONFIG,
  ERROR_MESSAGES,
  VOICE_SERVICE_CONFIG,
  RETRY_CONFIG,
  CIRCUIT_BREAKER_CONFIG,
} from '../constants';
import { logger } from '../utils/logger';
import {
  classifyError,
  logError
} from '../utils/errorHandler';
import { validateSpeechRecognitionConfig } from '../utils/voiceSettingsValidation';
import { ErrorRecoveryStrategy } from '../utils/errorRecovery';

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null;
  private state: SpeechRecognitionState = 'idle';
  private config: SpeechRecognitionConfig;
  private callbacks: SpeechRecognitionEventCallbacks = {};
  private transcript: string = '';
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isSupported: boolean;
  private permissionState: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
  private permissionChangeListener: ((this: globalThis.PermissionStatus, ev: Event) => unknown) | null = null;
  private errorRecovery: ErrorRecoveryStrategy;
  private startAttempts: number = 0;
  private readonly maxStartAttempts: number = VOICE_SERVICE_CONFIG.MAX_START_ATTEMPTS;

  constructor(config?: Partial<SpeechRecognitionConfig>) {
    this.config = {
      ...VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG,
      ...config,
    };

    this.recognition = null;

    this.isSupported = this.checkSupport();

    this.errorRecovery = new ErrorRecoveryStrategy(
      {
        maxAttempts: this.maxStartAttempts,
        initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
        maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
        backoffFactor: 2,
        shouldRetry: (error: Error, attempt: number) => {
          const shouldRetry = this.shouldRetryStartError(error, attempt);
          return shouldRetry;
        },
      },
      {
        failureThreshold: CIRCUIT_BREAKER_CONFIG.DEFAULT_FAILURE_THRESHOLD,
        resetTimeout: CIRCUIT_BREAKER_CONFIG.DEFAULT_RESET_TIMEOUT_MS,
        monitoringPeriod: CIRCUIT_BREAKER_CONFIG.DEFAULT_MONITORING_PERIOD_MS,
      }
    );

    if (this.isSupported && typeof window !== 'undefined') {
      const validation = validateSpeechRecognitionConfig(this.config);
      if (!validation.isValid) {
        logger.error('Invalid speech recognition config:', validation.errors);
        const error: SpeechRecognitionError = {
          error: 'unknown',
          message: `Konfigurasi speech recognition tidak valid: ${validation.errors.join(', ')}`,
        };
        throw new Error(error.message);
      }
      this.checkPermissionState();
      this.initializeRecognition();
    }
  }

  private checkSupport(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const speechWindow = window as unknown as SpeechWindow;
    const SpeechRecognitionAPI = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    return !!SpeechRecognitionAPI;
  }

  private async checkPermissionState(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.permissions) {
      this.permissionState = 'unknown';
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as const });
      this.permissionState = permission.state as 'granted' | 'denied' | 'prompt';
      
      this.permissionChangeListener = () => {
        this.permissionState = permission.state as 'granted' | 'denied' | 'prompt';
        logger.debug('Microphone permission state changed:', this.permissionState);
      };
      permission.addEventListener('change', this.permissionChangeListener);
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'checkMicrophonePermission',
        timestamp: Date.now()
      });
      logError(classifiedError);
      this.permissionState = 'unknown';
    }
  }

  private initializeRecognition(): void {
    try {
    const speechWindow = window as unknown as SpeechWindow;
      const SpeechRecognitionAPI = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      this.recognition = new (SpeechRecognitionAPI as SpeechRecognitionConstructor)() as SpeechRecognition;
      this.configureRecognition();
      this.setupEventListeners();
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'initializeSpeechRecognition',
        timestamp: Date.now()
      });
      logError(classifiedError);
      this.isSupported = false;
    }
  }

  private configureRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
  }

  private setupEventListeners(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleResult(event);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.handleError(event);
    };

    this.recognition.onstart = () => {
      this.state = 'listening';
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      if (this.state !== 'error') {
        this.state = 'idle';
      }
      this.clearTimeout();
      this.callbacks.onEnd?.();
    };

    this.recognition.onspeechstart = () => {
      this.clearTimeout();
      this.callbacks.onSpeechStart?.();
    };

    this.recognition.onspeechend = () => {
      this.setupTimeout();
      this.callbacks.onSpeechEnd?.();
    };
  }

  private handleResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    const isFinal = result.isFinal;

    this.transcript = transcript;
    this.callbacks.onResult?.(transcript, isFinal);

    if (isFinal) {
      logger.debug('Final transcript received:', transcript);

      // Reset circuit breaker on successful recognition
      if (this.errorRecovery.getCircuitBreakerState().failureCount > 0) {
        this.errorRecovery.resetCircuitBreaker();
        logger.debug('Circuit breaker reset after successful recognition');
      }
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent): void {
    const errorType = this.mapErrorType(event.error);
    let errorMessage = event.message || 'Speech recognition error occurred';

    const errorObj = new Error(errorMessage);

    // Track failures for circuit breaker (except no-speech, which is normal)
    if (errorType !== 'no-speech' && errorType !== 'aborted') {
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

    // Provide specific, actionable error messages
    if (errorType === 'not-allowed') {
      errorMessage = this.getPermissionDeniedMessage();
      this.permissionState = 'denied';
      logger.warn('Microphone permission denied');
    } else if (errorType === 'no-speech') {
      errorMessage = ERROR_MESSAGES.NO_SPEECH_DETECTED;
      logger.debug('No speech detected (this is normal, not an error)');
    } else if (errorType === 'audio-capture') {
      errorMessage = 'Tidak dapat mengakses mikrofon. Pastikan mikrofon terhubung dan tidak digunakan aplikasi lain.';
      logger.error('Audio capture error');
    } else if (errorType === 'network') {
      errorMessage = 'Kesalahan jaringan terjadi. Periksa koneksi internet Anda.';
      logger.error('Network error in speech recognition');
    } else {
      logger.error('Unknown speech recognition error:', event.error);
    }

    const error: SpeechRecognitionError = {
      error: errorType,
      message: errorMessage,
    };

    this.state = 'error';
    this.clearTimeout();
    this.callbacks.onError?.(error);
  }

  private getPermissionDeniedMessage(): string {
    const browserInfo = this.getBrowserInfo();
    
    if (browserInfo.isChrome) {
      return 'Izin mikrofon ditolak. Klik ikon gembok di address bar dan pilih "Izinkan" untuk mikrofon.';
    } else if (browserInfo.isFirefox) {
      return 'Izin mikrofon ditolak. Klik ikon gembok di address bar dan ubah pengaturan mikrofon menjadi "Izinkan".';
    } else if (browserInfo.isSafari) {
      return 'Izin mikrofon ditolak. Buka Safari > Preferensi > Situs Web > Mikrofon dan izinkan situs ini.';
    } else if (browserInfo.isEdge) {
      return 'Izin mikrofon ditolak. Klik ikon gembok di address bar dan pilih "Izinkan" untuk mikrofon.';
    }
    
    return ERROR_MESSAGES.MICROPHONE_DENIED;
  }

  private getBrowserInfo(): { isChrome: boolean; isFirefox: boolean; isSafari: boolean; isEdge: boolean } {
    const userAgent = navigator.userAgent.toLowerCase();
    return {
      isChrome: /chrome/.test(userAgent) && !/edg/.test(userAgent),
      isFirefox: /firefox/.test(userAgent),
      isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
      isEdge: /edg/.test(userAgent),
    };
  }

  private mapErrorType(errorName: string): SpeechRecognitionError['error'] {
    const errorMap: Record<string, SpeechRecognitionError['error']> = {
      'no-speech': 'no-speech',
      'audio-capture': 'audio-capture',
      'not-allowed': 'not-allowed',
      'network': 'network',
      'aborted': 'aborted',
    };

    return errorMap[errorName] || 'unknown';
  }

  private shouldRetryStartError(error: Error, attempt: number): boolean {
    const errorMessage = error.message.toLowerCase();

    if (attempt >= this.maxStartAttempts) {
      logger.debug('Max retry attempts reached for speech recognition start');
      return false;
    }

    if (errorMessage.includes('not-allowed') || errorMessage.includes('permission')) {
      logger.debug('Permission denied error, not retrying');
      return false;
    }

    if (errorMessage.includes('network') || errorMessage.includes('audio-capture')) {
      logger.debug(`Retryable error detected (attempt ${attempt}):`, error.message);
      return true;
    }

    if (errorMessage.includes('not-allowed') === false && errorMessage.includes('permission') === false) {
      logger.debug(`Unknown error, will retry (attempt ${attempt}):`, error.message);
      return true;
    }

    return false;
  }

  private setupTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      if (this.state === 'listening') {
        this.stopRecording();
      }
    }, VOICE_CONFIG.SPEECH_RECOGNITION_TIMEOUT);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  public async startRecording(): Promise<void> {
    if (!this.isSupported) {
      const error: SpeechRecognitionError = {
        error: 'unknown',
        message: ERROR_MESSAGES.VOICE_NOT_SUPPORTED,
      };
      this.callbacks.onError?.(error);
      return;
    }

    if (this.state === 'listening') {
      logger.debug('Already listening, ignoring start request');
      return;
    }

    if (this.errorRecovery.getCircuitBreakerState().isOpen) {
      logger.warn('Circuit breaker is open, skipping start attempt');
      const error: SpeechRecognitionError = {
        error: 'network',
        message: 'Speech recognition sementara tidak tersedia karena terlalu banyak kegagalan. Silakan coba lagi dalam beberapa saat.',
      };
      this.callbacks.onError?.(error);
      return;
    }

    // Check permission state before attempting to record
    if (this.permissionState === 'denied') {
      const error: SpeechRecognitionError = {
        error: 'not-allowed',
        message: this.getPermissionDeniedMessage(),
      };
      this.callbacks.onError?.(error);
      return;
    }

    this.startAttempts = 0;

    try {
      await this.errorRecovery.execute(
        async () => {
          this.startAttempts++;
          logger.debug(`Starting speech recognition (attempt ${this.startAttempts}/${this.maxStartAttempts})`);

          if (!this.recognition) {
            throw new Error('Speech recognition not initialized');
          }

          this.transcript = '';
          this.recognition.start();
          logger.debug('Speech recognition started successfully');
        },
        'startRecording'
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to start speech recognition after retries:', err);

      let errorMessage = 'Gagal memulai perekaman suara';

      if (err.message.includes('not-allowed') || err.message.includes('Permission denied')) {
        errorMessage = this.getPermissionDeniedMessage();
        this.permissionState = 'denied';
      } else if (err.message.includes('circuit breaker')) {
        errorMessage = 'Speech recognition sementara tidak tersedia karena terlalu banyak kegagalan. Silakan coba lagi dalam beberapa saat.';
      } else {
        errorMessage = err.message;
      }

      const speechError: SpeechRecognitionError = {
        error: this.mapErrorTypeFromMessage(errorMessage),
        message: errorMessage,
      };
      this.callbacks.onError?.(speechError);
    }
  }

  private mapErrorTypeFromMessage(message: string): SpeechRecognitionError['error'] {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('not-allowed') || lowerMessage.includes('permission')) {
      return 'not-allowed';
    } else if (lowerMessage.includes('network') || lowerMessage.includes('koneksi')) {
      return 'network';
    } else if (lowerMessage.includes('audio-capture') || lowerMessage.includes('mikrofon')) {
      return 'audio-capture';
    } else if (lowerMessage.includes('circuit breaker')) {
      return 'network';
    }

    return 'unknown';
  }

  public stopRecording(): void {
    if (!this.recognition || this.state !== 'listening') {
      return;
    }

    try {
      this.recognition.stop();
      logger.debug('Speech recognition stopped');
    } catch (error) {
      logger.error('Failed to stop speech recognition:', error);
    }
  }

  public abortRecording(): void {
    if (!this.recognition) {
      return;
    }

    try {
      this.recognition.abort();
      this.state = 'idle';
      this.clearTimeout();
      logger.debug('Speech recognition aborted');
    } catch (error) {
      logger.error('Failed to abort speech recognition:', error);
    }
  }

  public isListening(): boolean {
    return this.state === 'listening';
  }

  public getTranscript(): string {
    return this.transcript;
  }

  public getState(): SpeechRecognitionState {
    return this.state;
  }

  public setLanguage(language: VoiceLanguage): void {
    this.config.language = language;
    this.transcript = '';

    if (this.recognition) {
      this.recognition.lang = language;
    }

    logger.debug('Language set to:', language);
  }

  public setContinuous(continuous: boolean): void {
    this.config.continuous = continuous;

    if (this.recognition) {
      this.recognition.continuous = continuous;
    }

    logger.debug('Continuous mode set to:', continuous);
  }

  public setInterimResults(enabled: boolean): void {
    this.config.interimResults = enabled;

    if (this.recognition) {
      this.recognition.interimResults = enabled;
    }

    logger.debug('Interim results set to:', enabled);
  }

  public onResult(callback: (transcript: string, isFinal: boolean) => void): void {
    this.callbacks.onResult = callback;
  }

  public onError(callback: (error: SpeechRecognitionError) => void): void {
    this.callbacks.onError = callback;
  }

  public onStart(callback: () => void): void {
    this.callbacks.onStart = callback;
  }

  public onEnd(callback: () => void): void {
    this.callbacks.onEnd = callback;
  }

  public onSpeechStart(callback: () => void): void {
    this.callbacks.onSpeechStart = callback;
  }

  public onSpeechEnd(callback: () => void): void {
    this.callbacks.onSpeechEnd = callback;
  }

  public cleanup(): void {
    this.clearTimeout();
    this.abortRecording();
    
    this.callbacks = {};
    this.transcript = '';
    this.state = 'idle';
    
    // Remove permission change listener to prevent memory leak
    if (this.permissionChangeListener && typeof window !== 'undefined' && navigator.permissions) {
      const listenerToRemove = this.permissionChangeListener;
      this.permissionChangeListener = null;
      
      navigator.permissions.query({ name: 'microphone' as const })
        .then(permission => {
          permission.removeEventListener('change', listenerToRemove);
        })
        .catch(error => {
          logger.warn('Failed to remove permission listener:', error);
        });
    } else {
      this.permissionChangeListener = null;
    }
    logger.debug('SpeechRecognitionService cleaned up');
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getPermissionState(): 'granted' | 'denied' | 'prompt' | 'unknown' {
    return this.permissionState;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      // Try to access getUserMedia to trigger permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      // Re-check permission state
      await this.checkPermissionState();
      return this.permissionState === 'granted';
    } catch (error) {
      logger.warn('Microphone permission request failed:', error);
      this.permissionState = 'denied';
      return false;
    }
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
    startAttempts: number;
  } {
    return {
      circuitBreaker: this.getCircuitBreakerState(),
      startAttempts: this.startAttempts,
    };
  }
}

export default SpeechRecognitionService;