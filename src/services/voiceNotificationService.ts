import type { 
    PushNotification, 
    VoiceNotificationSettings, 
    VoiceNotification, 
    VoiceNotificationCategory,
    NotificationSettings,
    SpeechSynthesisVoice 
} from '../types';
import { 
    VOICE_NOTIFICATION_CONFIG, 
    STORAGE_KEYS,
    NOTIFICATION_CONFIG 
} from '../constants';
import { logger } from '../utils/logger';
import SpeechSynthesisService from './speechSynthesisService';

class VoiceNotificationService {
    private synthesisService: SpeechSynthesisService;
    private voiceQueue: VoiceNotification[] = [];
    private history: VoiceNotification[] = [];
    private isProcessing: boolean = false;
    private settings: VoiceNotificationSettings;

    constructor() {
        this.synthesisService = new SpeechSynthesisService();
        this.settings = { ...VOICE_NOTIFICATION_CONFIG.DEFAULT_VOICE_SETTINGS };
        
        // Initialize settings and load data
        this.loadSettings();
        this.loadQueue();
        this.loadHistory();
        
        // Setup speech synthesis event handlers
        this.setupSpeechHandlers();
        
        logger.info('VoiceNotificationService initialized');
    }

    private setupSpeechHandlers(): void {
        this.synthesisService.onStart(() => {
            logger.debug('Voice notification started');
        });

        this.synthesisService.onEnd(() => {
            this.isProcessing = false;
            this.processQueue();
            logger.debug('Voice notification ended, processing next in queue');
        });

        this.synthesisService.onError((error) => {
            logger.error('Voice notification error:', error);
            this.isProcessing = false;
            // Retry mechanism for failed notifications
            this.retryFailedNotification();
        });
    }

    private loadSettings(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY);
            if (stored) {
                const notificationSettings: NotificationSettings = JSON.parse(stored);
                if (notificationSettings.voiceNotifications) {
                    this.settings = {
                        ...VOICE_NOTIFICATION_CONFIG.DEFAULT_VOICE_SETTINGS,
                        ...notificationSettings.voiceNotifications
                    };
                }
            }
        } catch (error) {
            logger.error('Failed to load voice notification settings:', error);
        }
    }

    private saveSettings(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY);
            if (stored) {
                const notificationSettings: NotificationSettings = JSON.parse(stored);
                notificationSettings.voiceNotifications = this.settings;
                localStorage.setItem(
                    STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY,
                    JSON.stringify(notificationSettings)
                );
            }
        } catch (error) {
            logger.error('Failed to save voice notification settings:', error);
        }
    }

    private loadQueue(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_QUEUE);
            if (stored) {
                this.voiceQueue = JSON.parse(stored);
                // Limit queue size
                if (this.voiceQueue.length > VOICE_NOTIFICATION_CONFIG.MAX_QUEUE_SIZE) {
                    this.voiceQueue = this.voiceQueue.slice(-VOICE_NOTIFICATION_CONFIG.MAX_QUEUE_SIZE);
                }
            }
        } catch (error) {
            logger.error('Failed to load voice notification queue:', error);
        }
    }

    private saveQueue(): void {
        try {
            localStorage.setItem(
                STORAGE_KEYS.VOICE_NOTIFICATIONS_QUEUE,
                JSON.stringify(this.voiceQueue)
            );
        } catch (error) {
            logger.error('Failed to save voice notification queue:', error);
        }
    }

    private loadHistory(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_HISTORY);
            if (stored) {
                this.history = JSON.parse(stored);
                // Limit history size
                if (this.history.length > VOICE_NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
                    this.history = this.history.slice(-VOICE_NOTIFICATION_CONFIG.MAX_HISTORY_SIZE);
                }
            }
        } catch (error) {
            logger.error('Failed to load voice notification history:', error);
        }
    }

    private saveHistory(): void {
        try {
            localStorage.setItem(
                STORAGE_KEYS.VOICE_NOTIFICATIONS_HISTORY,
                JSON.stringify(this.history)
            );
        } catch (error) {
            logger.error('Failed to save voice notification history:', error);
        }
    }

    public updateSettings(newSettings: Partial<VoiceNotificationSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Update synthesis service with new voice settings
        if (newSettings.voiceSettings) {
            const voiceSettings = newSettings.voiceSettings;
            if (voiceSettings.rate !== undefined) {
                this.synthesisService.setRate(voiceSettings.rate);
            }
            if (voiceSettings.pitch !== undefined) {
                this.synthesisService.setPitch(voiceSettings.pitch);
            }
            if (voiceSettings.volume !== undefined) {
                this.synthesisService.setVolume(voiceSettings.volume);
            }
        }
        
        logger.info('Voice notification settings updated');
    }

    public getSettings(): VoiceNotificationSettings {
        return { ...this.settings };
    }

    private isQuietHours(): boolean {
        const quietHours = NOTIFICATION_CONFIG.DEFAULT_SETTINGS.quietHours;
        if (!this.settings.respectQuietHours || !quietHours.enabled) {
            return false;
        }

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Handle overnight quiet hours (e.g., 22:00 to 07:00)
        if (quietHours.start > quietHours.end) {
            return currentTime >= quietHours.start || currentTime <= quietHours.end;
        } else {
            return currentTime >= quietHours.start && currentTime <= quietHours.end;
        }
    }

    private shouldVoiceAnnounce(notification: PushNotification): boolean {
        // Check if voice notifications are enabled
        if (!this.settings.enabled) {
            return false;
        }

        // Check quiet hours
        if (this.isQuietHours()) {
            logger.debug('Voice notification suppressed during quiet hours');
            return false;
        }

        // Check if it's high priority only mode
        if (this.settings.highPriorityOnly && notification.priority !== 'high') {
            logger.debug('Voice notification suppressed: not high priority');
            return false;
        }

        // Check notification category
        const category = this.getNotificationCategory(notification);
        const categoryKey = category === 'grade' ? 'grades' : category;
        if (!this.settings.categories[categoryKey as keyof typeof this.settings.categories]) {
            logger.debug(`Voice notification suppressed: ${category} category disabled`);
            return false;
        }

        return true;
    }

    private getNotificationCategory(notification: PushNotification): VoiceNotificationCategory {
        // Determine category based on notification type and content
        switch (notification.type) {
            case 'grade':
                return 'grade';
            case 'system':
                // Check if it's attendance-related
                if (notification.body.toLowerCase().includes('kehadiran') || 
                    notification.body.toLowerCase().includes('absen')) {
                    return 'attendance';
                }
                // Check if it's meeting-related
                if (notification.body.toLowerCase().includes('rapat') || 
                    notification.body.toLowerCase().includes('meeting')) {
                    return 'meeting';
                }
                return 'system';
            default:
                return 'system';
        }
    }

    private generateVoiceText(notification: PushNotification): string {
        const category = this.getNotificationCategory(notification);
        
        // Generate context-aware voice text based on category
        switch (category) {
            case 'grade':
                return `Perhatian. ${notification.title}. ${notification.body}. Nilai baru telah dipublikasikan.`;
            case 'attendance':
                return `Perhatian. ${notification.title}. ${notification.body}. Status kehadiran diperbarui.`;
            case 'meeting':
                return `Perhatian. ${notification.title}. ${notification.body}. Pengingat rapat.`;
            case 'system':
                return `Perhatian. ${notification.title}. ${notification.body}. Pesan sistem penting.`;
            default:
                return `${notification.title}. ${notification.body}.`;
        }
    }

    private createVoiceNotification(pushNotification: PushNotification): VoiceNotification {
        return {
            id: `voice-${pushNotification.id}-${Date.now()}`,
            notificationId: pushNotification.id,
            text: this.generateVoiceText(pushNotification),
            priority: pushNotification.priority,
            category: this.getNotificationCategory(pushNotification),
            timestamp: new Date().toISOString(),
            isSpeaking: false,
            wasSpoken: false,
        };
    }

private retryFailedNotification(): void {
    if (this.voiceQueue.length > 0) {
      // Retry with delay
      setTimeout(() => {
        this.processQueue();
      }, VOICE_NOTIFICATION_CONFIG.RETRY_DELAY);
    }
  }

    private processQueue(): void {
        if (this.isProcessing || this.voiceQueue.length === 0) {
            return;
        }

        const voiceNotification = this.voiceQueue[0];
        
        // Check if already spoken
        if (voiceNotification.wasSpoken) {
            this.voiceQueue.shift();
            this.saveQueue();
            this.processQueue();
            return;
        }

        // Mark as processing
        this.isProcessing = true;
        voiceNotification.isSpeaking = true;
        voiceNotification.wasSpoken = true;
        
        // Update queue in storage
        this.saveQueue();

        // Speak the notification
        this.synthesisService.speak(voiceNotification.text);
        
        logger.info('Speaking voice notification:', voiceNotification.text.substring(0, 50));
    }

    public announceNotification(notification: PushNotification): boolean {
        if (!this.shouldVoiceAnnounce(notification)) {
            return false;
        }

        // Create voice notification
        const voiceNotification = this.createVoiceNotification(notification);
        
        // Check queue size
        if (this.voiceQueue.length >= VOICE_NOTIFICATION_CONFIG.MAX_QUEUE_SIZE) {
            logger.warn('Voice notification queue is full, dropping oldest notification');
            this.voiceQueue.shift();
        }

        // Add to queue
        this.voiceQueue.push(voiceNotification);
        this.saveQueue();

        // Start processing if not already processing
        if (!this.isProcessing) {
            this.processQueue();
        }

        // Add to history
        this.history.push(voiceNotification);
        if (this.history.length > VOICE_NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
            this.history.shift();
        }
        this.saveHistory();

        logger.info('Voice notification queued:', voiceNotification.id);
        return true;
    }

    public stopCurrent(): void {
        this.synthesisService.stop();
        this.isProcessing = false;
        
        // Mark current notification as not spoken so it can be retried
        if (this.voiceQueue.length > 0) {
            this.voiceQueue[0].isSpeaking = false;
            this.voiceQueue[0].wasSpoken = false;
            this.saveQueue();
        }
        
        logger.info('Voice notification stopped');
    }

    public skipCurrent(): void {
        this.synthesisService.stop();
        this.isProcessing = false;
        
        // Remove current notification from queue
        if (this.voiceQueue.length > 0) {
            const skipped = this.voiceQueue.shift();
            logger.info('Voice notification skipped:', skipped?.id);
            this.saveQueue();
        }
        
        // Process next in queue
        this.processQueue();
    }

    public clearQueue(): void {
        this.synthesisService.stop();
        this.voiceQueue = [];
        this.isProcessing = false;
        this.saveQueue();
        logger.info('Voice notification queue cleared');
    }

    public getQueue(): VoiceNotification[] {
        return [...this.voiceQueue];
    }

    public getHistory(): VoiceNotification[] {
        return [...this.history];
    }

    public clearHistory(): void {
        this.history = [];
        this.saveHistory();
        logger.info('Voice notification history cleared');
    }

    public isCurrentlySpeaking(): boolean {
        return this.isProcessing && this.synthesisService.isSpeaking();
    }

    public setVoice(voice: SpeechSynthesisVoice): void {
        this.synthesisService.setVoice(voice);
    }

    public getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.synthesisService.getAvailableVoices();
    }

    public cleanup(): void {
        this.synthesisService.stop();
        this.synthesisService.cleanup();
        this.voiceQueue = [];
        this.history = [];
        this.isProcessing = false;
        logger.info('VoiceNotificationService cleaned up');
    }
}

export const voiceNotificationService = new VoiceNotificationService();