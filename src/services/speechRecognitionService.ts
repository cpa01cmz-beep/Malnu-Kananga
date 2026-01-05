 

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
} from '../types';
import { VOICE_CONFIG } from '../constants';
import { logger } from '../utils/logger';

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null;
  private state: SpeechRecognitionState = 'idle';
  private config: SpeechRecognitionConfig;
  private callbacks: SpeechRecognitionEventCallbacks = {};
  private transcript: string = '';
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isSupported: boolean;

  constructor(config?: Partial<SpeechRecognitionConfig>) {
    this.config = {
      ...VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG,
      ...config,
    };

    this.recognition = null;

    this.isSupported = this.checkSupport();

    if (this.isSupported && typeof window !== 'undefined') {
      this.initializeRecognition();
    }
  }

  private checkSupport(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const speechWindow = window as SpeechWindow;
    const SpeechRecognitionAPI = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    return !!SpeechRecognitionAPI;
  }

  private initializeRecognition(): void {
    try {
      const speechWindow = window as SpeechWindow;
      const SpeechRecognitionAPI = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      this.configureRecognition();
      this.setupEventListeners();
    } catch (error) {
      logger.error('Failed to initialize SpeechRecognition:', error);
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
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent): void {
    const error: SpeechRecognitionError = {
      error: this.mapErrorType(event.error),
      message: event.message || 'Speech recognition error occurred',
    };

    logger.error('Speech recognition error:', error);

    this.state = 'error';
    this.clearTimeout();
    this.callbacks.onError?.(error);

    if (error.error === 'not-allowed') {
      logger.warn('Microphone permission denied');
    }
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
        message: 'Browser does not support speech recognition',
      };
      this.callbacks.onError?.(error);
      return;
    }

    if (this.state === 'listening') {
      logger.debug('Already listening, ignoring start request');
      return;
    }

    try {
      if (this.recognition) {
        this.transcript = '';
        this.recognition.start();
        logger.debug('Speech recognition started');
      }
    } catch (error) {
      logger.error('Failed to start speech recognition:', error);
      const speechError: SpeechRecognitionError = {
        error: 'unknown',
        message: error instanceof Error ? error.message : 'Failed to start recording',
      };
      this.callbacks.onError?.(speechError);
    }
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
    logger.debug('SpeechRecognitionService cleaned up');
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }
}

export default SpeechRecognitionService;
