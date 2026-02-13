import { useState, useEffect, useCallback } from 'react';
import { voiceNotificationService } from '../services/voiceNotificationService';
import type {
    VoiceNotificationSettings,
    VoiceNotification,
    SpeechSynthesisVoice
} from '../types';
import { logger } from '../utils/logger';
import { SCHEDULER_INTERVALS, APP_CONFIG } from '../constants';

interface UseVoiceNotificationsReturn {
    settings: VoiceNotificationSettings;
    queue: VoiceNotification[];
    history: VoiceNotification[];
    isSpeaking: boolean;
    availableVoices: SpeechSynthesisVoice[];
    updateSettings: (settings: Partial<VoiceNotificationSettings>) => void;
    stopCurrent: () => void;
    skipCurrent: () => void;
    clearQueue: () => void;
    clearHistory: () => void;
    setVoice: (voice: SpeechSynthesisVoice) => void;
    testVoiceNotification: () => void;
}

export const useVoiceNotifications = (): UseVoiceNotificationsReturn => {
    const [settings, setSettings] = useState<VoiceNotificationSettings>(
        voiceNotificationService.getSettings()
    );
    const [queue, setQueue] = useState<VoiceNotification[]>([]);
    const [history, setHistory] = useState<VoiceNotification[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Load initial data
    useEffect(() => {
        setQueue(voiceNotificationService.getQueue());
        setHistory(voiceNotificationService.getHistory());
        setIsSpeaking(voiceNotificationService.isCurrentlySpeaking());
        
// Update settings from service
    const _updateSettingsFromService = () => {
      setSettings(voiceNotificationService.getSettings());
    };
        
        // Check speaking status periodically
        const checkSpeakingStatus = () => {
            setIsSpeaking(voiceNotificationService.isCurrentlySpeaking());
            setQueue(voiceNotificationService.getQueue());
        };
        
        const interval = setInterval(checkSpeakingStatus, SCHEDULER_INTERVALS.SPEAKING_STATUS_CHECK);
        
        return () => {
            clearInterval(interval);
        };
    }, []);

    const updateSettings = useCallback((newSettings: Partial<VoiceNotificationSettings>) => {
        voiceNotificationService.updateSettings(newSettings);
        setSettings(voiceNotificationService.getSettings());
        logger.info('Voice notification settings updated via hook');
    }, []);

    const stopCurrent = useCallback(() => {
        voiceNotificationService.stopCurrent();
        setIsSpeaking(false);
    }, []);

    const skipCurrent = useCallback(() => {
        voiceNotificationService.skipCurrent();
        setQueue(voiceNotificationService.getQueue());
    }, []);

    const clearQueue = useCallback(() => {
        voiceNotificationService.clearQueue();
        setQueue([]);
        setIsSpeaking(false);
    }, []);

    const clearHistory = useCallback(() => {
        voiceNotificationService.clearHistory();
        setHistory([]);
    }, []);

    const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
        voiceNotificationService.setVoice(voice);
    }, []);

    const testVoiceNotification = useCallback(() => {
        // Create a test notification for voice announcement
        const testNotification = {
            id: `test-${Date.now()}`,
            type: 'system' as const,
            title: 'Tes Notifikasi Suara',
            body: `Ini adalah tes notifikasi suara dari ${APP_CONFIG.SCHOOL_NAME} Smart Portal`,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high' as const,
        };
        
        const success = voiceNotificationService.announceNotification(testNotification);
        if (success) {
            logger.info('Test voice notification sent');
            setQueue(voiceNotificationService.getQueue());
        } else {
            logger.warn('Failed to send test voice notification');
        }
        
        return success;
    }, []);

    return {
        settings,
        queue,
        history,
        isSpeaking,
        availableVoices: voiceNotificationService.getAvailableVoices(),
        updateSettings,
        stopCurrent,
        skipCurrent,
        clearQueue,
        clearHistory,
        setVoice,
        testVoiceNotification,
    };
};