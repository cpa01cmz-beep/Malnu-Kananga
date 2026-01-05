import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

export interface VoiceSettingsBackup {
  timestamp: string;
  settings: {
    recognition: {
      language: string;
      continuous: boolean;
    };
    synthesis: {
      rate: number;
      pitch: number;
      volume: number;
      voiceName?: string;
    };
    autoReadAI: boolean;
  };
}

export const backupVoiceSettings = (): boolean => {
  try {
    const currentSettings = localStorage.getItem(STORAGE_KEYS.VOICE_STORAGE_KEY);
    if (!currentSettings) {
      logger.info('No voice settings to backup');
      return false;
    }

    const backup: VoiceSettingsBackup = {
      timestamp: new Date().toISOString(),
      settings: JSON.parse(currentSettings),
    };

    localStorage.setItem(
      STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY,
      JSON.stringify(backup)
    );

    logger.info('Voice settings backed up successfully:', {
      timestamp: backup.timestamp,
    });
    return true;
  } catch (error) {
    logger.error('Failed to backup voice settings:', error);
    return false;
  }
};

export const restoreVoiceSettings = (): boolean => {
  try {
    const backupData = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
    if (!backupData) {
      logger.info('No voice settings backup found');
      return false;
    }

    const backup: VoiceSettingsBackup = JSON.parse(backupData);

    localStorage.setItem(STORAGE_KEYS.VOICE_STORAGE_KEY, JSON.stringify(backup.settings));

    logger.info('Voice settings restored successfully:', {
      backupDate: backup.timestamp,
    });
    return true;
  } catch (error) {
    logger.error('Failed to restore voice settings:', error);
    return false;
  }
};

export const hasBackup = (): boolean => {
  const backupData = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
  return backupData !== null;
};

export const getBackupDate = (): string | null => {
  try {
    const backupData = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
    if (!backupData) {
      return null;
    }

    const backup: VoiceSettingsBackup = JSON.parse(backupData);
    const date = new Date(backup.timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    logger.error('Failed to get backup date:', error);
    return null;
  }
};

export const deleteBackup = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
    logger.info('Voice settings backup deleted');
    return true;
  } catch (error) {
    logger.error('Failed to delete voice settings backup:', error);
    return false;
  }
};
