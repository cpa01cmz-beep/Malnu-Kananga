  
 
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
import { VOICE_CONFIG } from '../constants';
import { logger } from '../utils/logger';

class SpeechSynthesisService {
  private synth: SpeechSynthesis | null;
  private state: SpeechSynthesisState = 'idle';
  private config: SpeechSynthesisConfig;
  private callbacks: SpeechSynthesisEventCallbacks = {};
  private voiceCache: Map<string, SpeechSynthesisUtterance> = new Map();
  // @ts-expect-error: This property is used across multiple methods but TypeScript doesn't detect it
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];

  constructor(config?: Partial<SpeechSynthesisConfig>) {
    this.config = {
      ...VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG,
      ...config,
      voice: config?.voice ?? null,
    };

    this.synth = null;

    this.isSupported = this.checkSupport();

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
      this.callbacks.onEnd?.();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      const error: SpeechSynthesisError = {
        error: this.mapErrorType(event.error || 'unknown'),
        message: (event as unknown as { message?: string }).message || 'Speech synthesis error occurred',
      };

      logger.error('Speech synthesis error:', error);

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

  public speak(text: string): void {
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

    try {
      const utterance = this.checkCache(text) || this.createUtterance(text);
      this.setupUtteranceListeners(utterance);

      if (!this.voiceCache.has(text)) {
        this.addToCache(text, utterance);
      }

      this.currentUtterance = utterance;
      this.synth?.speak(utterance);
      logger.debug('Speaking:', text.substring(0, 50));
    } catch (error) {
      logger.error('Failed to speak:', error);
      const speechError: SpeechSynthesisError = {
        error: 'unknown',
        message: error instanceof Error ? error.message : 'Failed to speak',
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
}

export default SpeechSynthesisService;
