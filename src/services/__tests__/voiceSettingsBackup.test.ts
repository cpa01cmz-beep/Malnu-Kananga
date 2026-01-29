import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  backupVoiceSettings,
  restoreVoiceSettings,
  hasBackup,
  getBackupDate,
  deleteBackup,
  validateBackupData,
  getErrorRecoveryState,
  resetErrorRecovery,
} from '../voiceSettingsBackup';
import { STORAGE_KEYS } from '../../constants';

describe('voiceSettingsBackup', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('backupVoiceSettings', () => {
    it('should successfully backup voice settings', async () => {
      const mockSettings = {
        recognition: {
          language: 'id-ID',
          continuous: false,
        },
        synthesis: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        enabled: true,
        autoReadAI: true,
        continuousMode: false,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSettings));
      mockLocalStorage.setItem.mockReturnValue(undefined);

      const result = await backupVoiceSettings();

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.VOICE_STORAGE_KEY);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY,
        expect.stringContaining('timestamp')
      );
    });

    it('should return false when no settings exist', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await backupVoiceSettings();

      expect(result).toBe(false);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.VOICE_STORAGE_KEY);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle corrupted settings data', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = await backupVoiceSettings();

      expect(result).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should retry on localStorage errors', async () => {
      const mockSettings = { recognition: { language: 'id-ID' } };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      let callCount = 0;
      mockLocalStorage.setItem.mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          throw new Error('Storage quota exceeded');
        }
      });

      const result = await backupVoiceSettings();

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('restoreVoiceSettings', () => {
    it('should successfully restore voice settings', async () => {
      const mockBackup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: 'id-ID',
            continuous: false,
          },
          synthesis: {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
          },
          autoReadAI: true,
        },
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY) {
          return JSON.stringify(mockBackup);
        }
        return null;
      });

      const result = await restoreVoiceSettings();

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.VOICE_STORAGE_KEY,
        JSON.stringify(mockBackup.settings)
      );
    });

    it('should return false when no backup exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await restoreVoiceSettings();

      expect(result).toBe(false);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should reject corrupted backup data', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY) {
          return 'invalid-json';
        }
        return null;
      });

      const result = await restoreVoiceSettings();

      expect(result).toBe(false);
    });

    it('should reject invalid backup structure', async () => {
      const invalidBackup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: 'invalid-lang',
          },
        },
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY) {
          return JSON.stringify(invalidBackup);
        }
        return null;
      });

      const result = await restoreVoiceSettings();

      expect(result).toBe(false);
    });

    it('should retry on localStorage errors', async () => {
      const mockBackup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: 'id-ID',
            continuous: false,
          },
          synthesis: {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
          },
          autoReadAI: true,
        },
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY) {
          return JSON.stringify(mockBackup);
        }
        return null;
      });

      let callCount = 0;
      mockLocalStorage.setItem.mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          throw new Error('Storage quota exceeded');
        }
      });

      const result = await restoreVoiceSettings();

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasBackup', () => {
    it('should return true when backup exists', () => {
      mockLocalStorage.getItem.mockReturnValue('backup-data');

      const result = hasBackup();

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
    });

    it('should return false when no backup exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = hasBackup();

      expect(result).toBe(false);
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = hasBackup();

      expect(result).toBe(false);
    });
  });

  describe('getBackupDate', () => {
    it('should return formatted backup date', () => {
      const timestamp = '2024-01-15T10:30:00.000Z';
      const mockBackup = {
        timestamp,
        settings: {
          recognition: {
            language: 'id-ID',
            continuous: false,
          },
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockBackup));

      const result = getBackupDate();

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return null when no backup exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getBackupDate();

      expect(result).toBe(null);
    });

    it('should handle invalid backup data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = getBackupDate();

      expect(result).toBe(null);
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getBackupDate();

      expect(result).toBe(null);
    });
  });

  describe('deleteBackup', () => {
    it('should successfully delete backup', () => {
      mockLocalStorage.removeItem.mockReturnValue(undefined);

      const result = deleteBackup();

      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.VOICE_SETTINGS_BACKUP_KEY);
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = deleteBackup();

      expect(result).toBe(false);
    });
  });

  describe('validateBackupData', () => {
    it('should validate valid backup data', () => {
      const mockBackup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: 'id-ID',
            continuous: false,
          },
          synthesis: {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
          },
          autoReadAI: true,
        },
      };

      const result = validateBackupData(JSON.stringify(mockBackup));

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid JSON', () => {
      const result = validateBackupData('invalid-json');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Backup data is not valid JSON');
    });

    it('should reject invalid backup structure', () => {
      const invalidBackup = {
        timestamp: 'invalid-date',
        settings: {},
      };

      const result = validateBackupData(JSON.stringify(invalidBackup));

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject missing timestamp', () => {
      const invalidBackup = {
        settings: {
          recognition: {
            language: 'id-ID',
          },
        },
      };

      const result = validateBackupData(JSON.stringify(invalidBackup));

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('timestamp'))).toBe(true);
    });

    it('should reject missing settings', () => {
      const invalidBackup = {
        timestamp: new Date().toISOString(),
      };

      const result = validateBackupData(JSON.stringify(invalidBackup));

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('settings'))).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should track error recovery state', () => {
      const state = getErrorRecoveryState();

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('lastSuccessTime');
    });

    it('should reset error recovery state', () => {
      resetErrorRecovery();

      const state = getErrorRecoveryState();

      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
      expect(state.lastFailureTime).toBe(null);
    });
  });
});
