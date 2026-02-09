import { STORAGE_KEYS, RETRY_CONFIG } from '../constants';
import { logger } from '../utils/logger';
import { ErrorRecoveryStrategy } from '../utils/errorRecovery';
import { validateVoiceSettingsBackup, isVoiceSettings } from '../utils/voiceSettingsValidation';

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

const errorRecoveryStrategy = new ErrorRecoveryStrategy(
  {
    maxAttempts: 3,
    initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
    maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
    backoffFactor: 2,
  },
  {
    failureThreshold: 3,
    resetTimeout: RETRY_CONFIG.DEFAULT_RESET_TIMEOUT,
  }
);

export const backupVoiceSettings = async (): Promise<boolean> => {
  try {
    const currentSettings = localStorage.getItem(STORAGE_KEYS.VOICE_STORAGE_KEY);
    if (!currentSettings) {
      logger.info('No voice settings to backup');
      return false;
    }

    JSON.parse(currentSettings);
  } catch (parseError) {
    logger.error('Failed to parse voice settings:', parseError);
    return false;
  }

  return errorRecoveryStrategy.executeWithFallback(
    () => {
      const currentSettings = localStorage.getItem(STORAGE_KEYS.VOICE_STORAGE_KEY);
      if (!currentSettings) {
        logger.info('No voice settings to backup');
        return Promise.resolve(false);
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
      return Promise.resolve(true);
    },
    (error) => {
      logger.warn('Backup failed, attempting fallback:', error);
      return false;
    },
    'backupVoiceSettings'
  );
};

export const restoreVoiceSettings = async (): Promise<boolean> => {
  const backupData = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
  if (!backupData) {
    logger.info('No voice settings backup found');
    return false;
  }

  let backup: unknown;
  try {
    backup = JSON.parse(backupData);
  } catch (parseError) {
    logger.error('Failed to parse backup data:', parseError);
    return false;
  }

  const validation = validateVoiceSettingsBackup(backup);
  if (!validation.isValid) {
    logger.error('Backup validation failed:', validation.errors);
    return false;
  }

  const validBackup = backup as VoiceSettingsBackup;

  if (!isVoiceSettings(validBackup.settings)) {
    logger.error('Backup settings do not match expected VoiceSettings type');
    return false;
  }

  return errorRecoveryStrategy.executeWithFallback(
    () => {
      localStorage.setItem(STORAGE_KEYS.VOICE_STORAGE_KEY, JSON.stringify(validBackup.settings));

      logger.info('Voice settings restored successfully:', {
        backupDate: validBackup.timestamp,
      });
      return Promise.resolve(true);
    },
    (error) => {
      logger.warn('Restore failed, attempting fallback:', error);
      return false;
    },
    'restoreVoiceSettings'
  );
};

export const hasBackup = (): boolean => {
  try {
    const backupData = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
    return backupData !== null;
  } catch (error) {
    logger.error('Failed to check backup existence:', error);
    return false;
  }
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

export const validateBackupData = (backupData: string): { isValid: boolean; errors: string[] } => {
  try {
    const backup = JSON.parse(backupData);
    const validation = validateVoiceSettingsBackup(backup);
    return validation;
  } catch (error) {
    logger.error('Failed to validate backup data:', error);
    return {
      isValid: false,
      errors: ['Backup data is not valid JSON'],
    };
  }
};

export const getErrorRecoveryState = (): ReturnType<typeof errorRecoveryStrategy.getCircuitBreakerState> => {
  return errorRecoveryStrategy.getCircuitBreakerState();
};

export const resetErrorRecovery = (): void => {
  errorRecoveryStrategy.resetCircuitBreaker();
  logger.info('Error recovery state reset');
};
