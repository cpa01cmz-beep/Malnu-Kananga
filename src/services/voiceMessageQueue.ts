 
import { VOICE_CONFIG, ERROR_MESSAGES } from '../constants';
import type { ChatMessage } from '../types';
import { logger } from '../utils/logger';

interface MessageQueueItem {
  id: string;
  text: string;
  index: number;
  timestamp: number;
}

interface VoiceMessageQueueCallbacks {
  onQueueStart?: () => void;
  onQueueEnd?: () => void;
  onMessageStart?: (message: MessageQueueItem) => void;
  onMessageEnd?: (message: MessageQueueItem) => void;
  onQueueError?: (error: string) => void;
}

class VoiceMessageQueue {
  private queue: MessageQueueItem[];
  private currentIndex: number;
  private isPlaying: boolean;
  private isPaused: boolean;
  private callbacks: VoiceMessageQueueCallbacks;
  private speakFunction: (text: string) => void;
  private stopFunction: () => void;

  constructor(
    speakFunction: (text: string) => void,
    stopFunction: () => void,
    callbacks: VoiceMessageQueueCallbacks = {}
  ) {
    this.queue = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.callbacks = callbacks;
    this.speakFunction = speakFunction;
    this.stopFunction = stopFunction;

    logger.debug('VoiceMessageQueue initialized');
  }

  public addMessages(messages: ChatMessage[]): void {
    if (messages.length === 0) {
      logger.debug('No messages to add to queue');
      return;
    }

    const startIndex = this.queue.length;
    const newItems: MessageQueueItem[] = messages
      .filter((msg) => msg.sender === 'ai' && msg.text && msg.text.trim() !== '')
      .map((msg, index) => ({
        id: msg.id,
        text: msg.text,
        index: startIndex + index,
        timestamp: Date.now(),
      }));

    if (newItems.length === 0) {
      logger.debug('No valid AI messages to add');
      return;
    }

    if (this.queue.length + newItems.length > VOICE_CONFIG.MESSAGE_QUEUE_MAX_SIZE) {
      const error = ERROR_MESSAGES.QUEUE_FULL;
      logger.warn('Queue full:', error);
      this.callbacks.onQueueError?.(error);
      return;
    }

    this.queue.push(...newItems);
    logger.debug(`Added ${newItems.length} messages to queue (total: ${this.queue.length})`);

    if (!this.isPlaying) {
      this.startQueue();
    }
  }

  public addMessage(message: ChatMessage): void {
    if (message.sender !== 'ai' || !message.text || message.text.trim() === '') {
      return;
    }

    if (this.queue.length >= VOICE_CONFIG.MESSAGE_QUEUE_MAX_SIZE) {
      const error = ERROR_MESSAGES.QUEUE_FULL;
      logger.warn('Queue full:', error);
      this.callbacks.onQueueError?.(error);
      return;
    }

    const item: MessageQueueItem = {
      id: message.id,
      text: message.text,
      index: this.queue.length,
      timestamp: Date.now(),
    };

    this.queue.push(item);
    logger.debug(`Added message to queue (total: ${this.queue.length})`);

    if (!this.isPlaying) {
      this.startQueue();
    }
  }

  private async startQueue(): Promise<void> {
    if (this.isPlaying || this.queue.length === 0) {
      return;
    }

    this.isPlaying = true;
    this.currentIndex = 0;
    this.isPaused = false;

    logger.debug('Starting message queue playback');
    this.callbacks.onQueueStart?.();

    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.isPlaying && this.currentIndex < this.queue.length) {
      if (this.isPaused) {
        await this.waitForResume();
        continue;
      }

      const message = this.queue[this.currentIndex];
      logger.debug(`Playing message ${this.currentIndex + 1}/${this.queue.length}:`, message.id);

      this.callbacks.onMessageStart?.(message);
      this.speakFunction(message.text);

      await this.waitForMessageEnd();

      this.callbacks.onMessageEnd?.(message);
      this.currentIndex++;
    }

    this.stopQueue();
  }

  private waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isPaused || !this.isPlaying) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  private waitForMessageEnd(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isPlaying) {
          clearInterval(checkInterval);
          resolve();
          return;
        }

        const synth = window.speechSynthesis;
        if (synth && !synth.speaking) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 30000);
    });
  }

  public pause(): void {
    if (!this.isPlaying || this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.stopFunction();
    logger.debug('Queue paused');
  }

  public resume(): void {
    if (!this.isPlaying || !this.isPaused) {
      return;
    }

    this.isPaused = false;
    logger.debug('Queue resumed');
  }

  public stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.stopFunction();
    logger.debug('Queue stopped');
  }

  public stopQueue(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.queue = [];
    this.stopFunction();

    logger.debug('Queue cleared and stopped');
    this.callbacks.onQueueEnd?.();
  }

  public skip(): void {
    if (!this.isPlaying || this.queue.length === 0) {
      return;
    }

    this.stopFunction();
    this.currentIndex++;

    if (this.currentIndex >= this.queue.length) {
      this.stopQueue();
    }

    logger.debug(`Skipped to message ${this.currentIndex + 1}/${this.queue.length}`);
  }

  public previous(): void {
    if (!this.isPlaying || this.queue.length === 0 || this.currentIndex === 0) {
      return;
    }

    this.stopFunction();
    this.currentIndex--;

    logger.debug(`Went back to message ${this.currentIndex + 1}/${this.queue.length}`);
  }

  public getCurrentMessage(): MessageQueueItem | null {
    if (this.queue.length === 0 || this.currentIndex >= this.queue.length) {
      return null;
    }

    return this.queue[this.currentIndex];
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public isQueuePlaying(): boolean {
    return this.isPlaying;
  }

  public isQueuePaused(): boolean {
    return this.isPaused;
  }

  public clear(): void {
    this.queue = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.stopFunction();

    logger.debug('Queue cleared');
  }

  public onQueueStart(callback: () => void): void {
    this.callbacks.onQueueStart = callback;
  }

  public onQueueEnd(callback: () => void): void {
    this.callbacks.onQueueEnd = callback;
  }

  public onMessageStart(callback: (message: MessageQueueItem) => void): void {
    this.callbacks.onMessageStart = callback;
  }

  public onMessageEnd(callback: (message: MessageQueueItem) => void): void {
    this.callbacks.onMessageEnd = callback;
  }

  public onQueueError(callback: (error: string) => void): void {
    this.callbacks.onQueueError = callback;
  }

  public cleanup(): void {
    this.stop();
    this.queue = [];
    this.callbacks = {};
    logger.debug('VoiceMessageQueue cleaned up');
  }
}

export default VoiceMessageQueue;