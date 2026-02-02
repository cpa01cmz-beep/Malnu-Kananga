import {
  PushNotification,
  NotificationPriority,
  VoiceNotification,
  VoiceNotificationCategory,
} from '../../types';
import {
  STORAGE_KEYS,
  VOICE_NOTIFICATION_CONFIG
} from '../../constants';
import { logger } from '../../utils/logger';
import SpeechSynthesisService from '../speechSynthesisService';

/**
 * Voice Notification Handler
 * Manages text-to-speech notifications for important events
 */
export class VoiceNotificationHandler {
  private voiceQueue: VoiceNotification[] = [];
  private voiceHistory: VoiceNotification[] = [];
  private isProcessingVoice: boolean = false;
  private synthesisService: SpeechSynthesisService;
  private quietHours: { start: string; end: string };
  private enabled: boolean;

  constructor(
    quietHours: { start: string; end: string } = { start: '22:00', end: '07:00' },
    enabled: boolean = true
  ) {
    this.synthesisService = new SpeechSynthesisService();
    this.quietHours = quietHours;
    this.enabled = enabled;
    this.setupVoiceHandlers();
    this.loadVoiceQueue();
    this.loadVoiceHistory();
  }

  private setupVoiceHandlers(): void {
    this.synthesisService.onStart(() => {
      logger.debug('Voice notification started');
    });

    this.synthesisService.onEnd(() => {
      this.isProcessingVoice = false;
      this.processVoiceQueue();
      logger.debug('Voice notification ended, processing next in queue');
    });

    this.synthesisService.onError((error) => {
      logger.error('Voice notification error:', error);
      this.isProcessingVoice = false;
      this.retryFailedVoiceNotification();
    });
  }

  private loadVoiceQueue(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_QUEUE);
      if (saved) {
        this.voiceQueue = JSON.parse(saved);
        logger.info(`Loaded ${this.voiceQueue.length} voice notifications from queue`);
      }
    } catch (error) {
      logger.error('Failed to load voice queue:', error);
    }
  }

  private saveVoiceQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_QUEUE, JSON.stringify(this.voiceQueue));
    } catch (error) {
      logger.error('Failed to save voice queue:', error);
    }
  }

  private loadVoiceHistory(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_HISTORY);
      if (saved) {
        this.voiceHistory = JSON.parse(saved);
        logger.info(`Loaded ${this.voiceHistory.length} voice notifications from history`);
      }
    } catch (error) {
      logger.error('Failed to load voice history:', error);
    }
  }

  private saveVoiceHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_HISTORY, JSON.stringify(this.voiceHistory));
    } catch (error) {
      logger.error('Failed to save voice history:', error);
    }
  }

  private isQuietHours(): boolean {
    if (!this.quietHours.start || !this.quietHours.end) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [startHour, startMinute] = this.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.quietHours.end.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  private shouldVoiceAnnounce(notification: PushNotification): boolean {
    if (!this.enabled) {
      return false;
    }

    if (this.isQuietHours()) {
      return false;
    }

    const category = this.getVoiceNotificationCategory(notification);
    if (!category) {
      return false;
    }

    const categories = VOICE_NOTIFICATION_CONFIG.DEFAULT_VOICE_SETTINGS.categories;
    switch (category) {
      case 'grade':
        return categories.grades;
      case 'attendance':
        return categories.attendance;
      case 'system':
        return categories.system;
      case 'meeting':
        return categories.meetings;
      default:
        return false;
    }
  }

  private getVoiceNotificationCategory(notification: PushNotification): VoiceNotificationCategory | null {
    const type = notification.type;

    if (type === 'grade' || type === 'missing_grades') {
      return 'grade';
    }

    if (type === 'system' || type === 'ocr' || type === 'ocr_validation') {
      return 'system';
    }

    if (type === 'event') {
      return 'meeting';
    }

    return null;
  }

  private generateVoiceText(notification: PushNotification): string {
    const type = notification.type;

    switch (type) {
      case 'announcement':
        return `Pengumuman baru: ${notification.title}. ${notification.body}`;
      case 'grade':
        return `Update nilai: ${notification.title}`;
      case 'ppdb':
        return `Status PPDB: ${notification.title}`;
      case 'event':
        return `Kegiatan baru: ${notification.title}`;
      case 'library':
        return `Materi baru: ${notification.title}`;
      case 'system':
        return `Sistem: ${notification.title}`;
      case 'ocr':
      case 'ocr_validation':
        return `OCR: ${notification.title}`;
      default:
        return `Notifikasi: ${notification.title}`;
    }
  }

  private createVoiceNotification(pushNotification: PushNotification): VoiceNotification | null {
    const category = this.getVoiceNotificationCategory(pushNotification);
    if (!category) {
      return null;
    }

    return {
      id: `voice-${pushNotification.id}-${Date.now()}`,
      notificationId: pushNotification.id,
      text: this.generateVoiceText(pushNotification),
      priority: this.getPriorityFromType(pushNotification.type),
      category: category,
      timestamp: new Date().toISOString(),
      isSpeaking: false,
      wasSpoken: false
    };
  }

  private getPriorityFromType(type: string): NotificationPriority {
    if (type === 'grade' || type === 'missing_grades' || type === 'ppdb') {
      return 'high';
    }

    if (type === 'system' || type === 'ocr' || type === 'ocr_validation') {
      return 'normal';
    }

    return 'low';
  }

  private retryFailedVoiceNotification(): void {
    if (this.voiceQueue.length > 0) {
      logger.info('Retrying failed voice notification');
      this.processVoiceQueue();
    }
  }

  private processVoiceQueue(): void {
    if (this.isProcessingVoice || this.voiceQueue.length === 0) {
      return;
    }

    const voiceNotification = this.voiceQueue[0];
    this.isProcessingVoice = true;

    void this.synthesisService.speak(voiceNotification.text);

    logger.info('Processing voice notification:', voiceNotification.id);
  }

  public announceNotification(notification: PushNotification): boolean {
    if (!this.shouldVoiceAnnounce(notification)) {
      return false;
    }

    const voiceNotification = this.createVoiceNotification(notification);
    if (!voiceNotification) {
      return false;
    }

    this.voiceQueue.push(voiceNotification);
    this.saveVoiceQueue();

    if (!this.isProcessingVoice) {
      this.processVoiceQueue();
    }

    return true;
  }

  public stopCurrentVoiceNotification(): void {
    this.synthesisService.stop();
    this.isProcessingVoice = false;
    logger.info('Current voice notification stopped');
  }

  public skipCurrentVoiceNotification(): void {
    if (this.voiceQueue.length > 0) {
      const skipped = this.voiceQueue.shift();
      logger.info('Voice notification skipped:', skipped?.id);
      this.saveVoiceQueue();
    }
    this.processVoiceQueue();
  }

  public clearVoiceQueue(): void {
    this.synthesisService.stop();
    this.voiceQueue = [];
    this.isProcessingVoice = false;
    this.saveVoiceQueue();
    logger.info('Voice notification queue cleared');
  }

  public getVoiceQueue(): VoiceNotification[] {
    return [...this.voiceQueue];
  }

  public getVoiceHistory(): VoiceNotification[] {
    return [...this.voiceHistory];
  }

  public clearVoiceHistory(): void {
    this.voiceHistory = [];
    this.saveVoiceHistory();
    logger.info('Voice notification history cleared');
  }

  public isCurrentlySpeaking(): boolean {
    return this.isProcessingVoice;
  }

  public cleanup(): void {
    this.synthesisService.stop();
    this.voiceQueue = [];
    this.voiceHistory = [];
    this.isProcessingVoice = false;
  }
}
