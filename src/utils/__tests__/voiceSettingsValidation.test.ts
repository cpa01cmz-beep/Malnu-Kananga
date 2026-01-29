import { describe, it, expect } from 'vitest';
import {
  validateVoiceSettings,
  validateSpeechRecognitionConfig,
  validateSpeechSynthesisConfig,
  validateVoiceCommand,
  validateVoiceLanguage,
  validateVoiceSettingsBackup,
  isVoiceSettings,
  isSpeechRecognitionConfig,
  isSpeechSynthesisConfig,
  isVoiceCommand,
  isVoiceLanguage,
  isVoiceSettingsBackup,
  sanitizeVoiceTranscript,
  validateAndSanitizeVoiceCommand,
} from '../voiceSettingsValidation';
import { VoiceLanguage } from '../../types';

describe('voiceSettingsValidation', () => {
  describe('validateVoiceSettings', () => {
    it('should validate valid voice settings', () => {
      const settings = {
        recognition: {
          language: VoiceLanguage.Indonesian,
          continuous: false,
          interimResults: true,
          maxAlternatives: 1,
        },
        synthesis: {
          voice: null,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        enabled: true,
        autoReadAI: true,
        continuousMode: false,
      };

      const result = validateVoiceSettings(settings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object input', () => {
      const result = validateVoiceSettings('invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Voice settings must be an object');
    });

    it('should reject invalid enabled flag', () => {
      const settings = {
        enabled: 'true',
      };
      const result = validateVoiceSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('enabled flag must be a boolean');
    });

    it('should reject invalid autoReadAI flag', () => {
      const settings = {
        autoReadAI: 'yes',
      };
      const result = validateVoiceSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('autoReadAI flag must be a boolean');
    });

    it('should reject invalid continuousMode flag', () => {
      const settings = {
        continuousMode: 1,
      };
      const result = validateVoiceSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('continuousMode flag must be a boolean');
    });

    it('should validate nested recognition config', () => {
      const settings = {
        recognition: {
          language: 'invalid-lang',
          continuous: false,
          interimResults: true,
        },
      };
      const result = validateVoiceSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.startsWith('recognition.'))).toBe(true);
    });

    it('should validate nested synthesis config', () => {
      const settings = {
        synthesis: {
          rate: 100,
          pitch: 1.0,
          volume: 1.0,
        },
      };
      const result = validateVoiceSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.startsWith('synthesis.'))).toBe(true);
    });
  });

  describe('validateSpeechRecognitionConfig', () => {
    it('should validate valid recognition config', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        continuous: false,
        interimResults: true,
        maxAlternatives: 1,
      };

      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(true);
    });

    it('should reject missing language', () => {
      const config = {
        continuous: false,
        interimResults: true,
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('language is required');
    });

    it('should reject invalid language', () => {
      const config = {
        language: 'fr-FR',
        continuous: false,
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid continuous flag', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        continuous: 'yes',
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('continuous must be a boolean');
    });

    it('should reject invalid interimResults flag', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        interimResults: 'true',
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('interimResults must be a boolean');
    });

    it('should reject non-number maxAlternatives', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        maxAlternatives: '3',
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('maxAlternatives must be a number');
    });

    it('should reject maxAlternatives below 1', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        maxAlternatives: 0,
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('maxAlternatives must be between 1 and 10');
    });

    it('should reject maxAlternatives above 10', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        maxAlternatives: 11,
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('maxAlternatives must be between 1 and 10');
    });

    it('should reject non-integer maxAlternatives', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        maxAlternatives: 2.5,
      };
      const result = validateSpeechRecognitionConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('maxAlternatives must be an integer');
    });
  });

  describe('validateSpeechSynthesisConfig', () => {
    it('should validate valid synthesis config', () => {
      const config = {
        voice: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      };

      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid voice', () => {
      const config = {
        voice: 'invalid',
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('voice must be an object or null');
    });

    it('should reject non-number rate', () => {
      const config = {
        rate: 'fast',
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('rate must be a number');
    });

    it('should reject rate below 0.1', () => {
      const config = {
        rate: 0.05,
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('rate must be between 0.1 and 10');
    });

    it('should reject rate above 10', () => {
      const config = {
        rate: 15,
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('rate must be between 0.1 and 10');
    });

    it('should accept rate at boundary values', () => {
      const config1 = { rate: 0.1 };
      const result1 = validateSpeechSynthesisConfig(config1);
      expect(result1.isValid).toBe(true);

      const config2 = { rate: 10 };
      const result2 = validateSpeechSynthesisConfig(config2);
      expect(result2.isValid).toBe(true);
    });

    it('should reject non-number pitch', () => {
      const config = {
        pitch: 'high',
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('pitch must be a number');
    });

    it('should reject pitch below 0', () => {
      const config = {
        pitch: -0.5,
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('pitch must be between 0 and 2');
    });

    it('should reject pitch above 2', () => {
      const config = {
        pitch: 2.5,
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('pitch must be between 0 and 2');
    });

    it('should reject non-number volume', () => {
      const config = {
        volume: 'loud',
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('volume must be a number');
    });

    it('should reject volume below 0', () => {
      const config = {
        volume: -0.1,
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('volume must be between 0 and 1');
    });

    it('should reject volume above 1', () => {
      const config = {
        volume: 1.5,
      };
      const result = validateSpeechSynthesisConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('volume must be between 0 and 1');
    });
  });

  describe('validateVoiceCommand', () => {
    it('should validate valid voice command', () => {
      const command = {
        id: 'open_settings',
        action: 'OPEN_SETTINGS',
        transcript: 'buka pengaturan',
        confidence: 0.95,
        data: { studentName: 'John' },
      };

      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-object input', () => {
      const result = validateVoiceCommand('invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Voice command must be an object');
    });

    it('should reject missing id', () => {
      const command = {
        action: 'OPEN_SETTINGS',
        transcript: 'buka pengaturan',
      };
      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Command id is required and must be a non-empty string');
    });

    it('should reject empty id', () => {
      const command = {
        id: '',
        action: 'OPEN_SETTINGS',
        transcript: 'buka pengaturan',
      };
      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Command id is required and must be a non-empty string');
    });

    it('should reject missing action', () => {
      const command = {
        id: 'open_settings',
        transcript: 'buka pengaturan',
      };
      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Command action is required and must be a non-empty string');
    });

    it('should reject missing transcript', () => {
      const command = {
        id: 'open_settings',
        action: 'OPEN_SETTINGS',
      };
      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Command transcript is required and must be a non-empty string');
    });

    it('should reject invalid confidence', () => {
      const command = {
        id: 'open_settings',
        action: 'OPEN_SETTINGS',
        transcript: 'buka pengaturan',
        confidence: 1.5,
      };
      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('confidence must be between 0 and 1');
    });

    it('should accept command without data', () => {
      const command = {
        id: 'open_settings',
        action: 'OPEN_SETTINGS',
        transcript: 'buka pengaturan',
        confidence: 0.95,
      };
      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(true);
    });

    it('should accept null data', () => {
      const command = {
        id: 'open_settings',
        action: 'OPEN_SETTINGS',
        transcript: 'buka pengaturan',
        confidence: 0.95,
        data: null,
      };
      const result = validateVoiceCommand(command);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateVoiceLanguage', () => {
    it('should validate Indonesian language', () => {
      const result = validateVoiceLanguage(VoiceLanguage.Indonesian);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate English language', () => {
      const result = validateVoiceLanguage(VoiceLanguage.English);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid language', () => {
      const result = validateVoiceLanguage('fr-FR');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Invalid VoiceLanguage'))).toBe(true);
    });

    it('should reject non-string input', () => {
      const result = validateVoiceLanguage(123);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('VoiceLanguage must be a string');
    });
  });

  describe('validateVoiceSettingsBackup', () => {
    it('should validate valid backup', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: VoiceLanguage.Indonesian,
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

      const result = validateVoiceSettingsBackup(backup);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-object input', () => {
      const result = validateVoiceSettingsBackup('invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Voice settings backup must be an object');
    });

    it('should reject missing timestamp', () => {
      const invalidBackup = {
        settings: {
          recognition: {
            language: 'id-ID',
          },
        },
      };

      const result = validateVoiceSettingsBackup(invalidBackup);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('timestamp'))).toBe(true);
    });

    it('should reject invalid timestamp', () => {
      const backup = {
        timestamp: 'invalid-date',
        settings: {},
      };
      const result = validateVoiceSettingsBackup(backup);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Backup timestamp is required and must be a valid ISO date string');
    });

    it('should reject missing settings', () => {
      const backup = {
        timestamp: new Date().toISOString(),
      };
      const result = validateVoiceSettingsBackup(backup);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Backup settings is required and must be an object');
    });

    it('should reject invalid recognition settings', () => {
      const invalidBackup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: 'invalid-lang',
          },
        },
      };

      const result = validateVoiceSettingsBackup(invalidBackup);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid VoiceLanguage') || e.includes('language'))).toBe(true);
    });

    it('should reject invalid synthesis rate', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: VoiceLanguage.Indonesian,
          },
          synthesis: {
            rate: 100,
          },
        },
      };
      const result = validateVoiceSettingsBackup(backup);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('rate'))).toBe(true);
    });
  });

  describe('Type Guards', () => {
    it('isVoiceSettings should correctly identify valid settings', () => {
      const settings = {
        recognition: {
          language: VoiceLanguage.Indonesian,
          continuous: false,
          interimResults: true,
          maxAlternatives: 1,
        },
        synthesis: {
          voice: null,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        enabled: true,
        autoReadAI: true,
        continuousMode: false,
      };

      expect(isVoiceSettings(settings)).toBe(true);
      expect(isVoiceSettings('invalid')).toBe(false);
    });

    it('isSpeechRecognitionConfig should correctly identify valid config', () => {
      const config = {
        language: VoiceLanguage.Indonesian,
        continuous: false,
        interimResults: true,
        maxAlternatives: 1,
      };

      expect(isSpeechRecognitionConfig(config)).toBe(true);
      expect(isSpeechRecognitionConfig('invalid')).toBe(false);
    });

    it('isSpeechSynthesisConfig should correctly identify valid config', () => {
      const config = {
        voice: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      };

      expect(isSpeechSynthesisConfig(config)).toBe(true);
      expect(isSpeechSynthesisConfig('invalid')).toBe(false);
    });

    it('isVoiceCommand should correctly identify valid command', () => {
      const command = {
        id: 'open_settings',
        action: 'OPEN_SETTINGS',
        transcript: 'buka pengaturan',
        confidence: 0.95,
      };

      expect(isVoiceCommand(command)).toBe(true);
      expect(isVoiceCommand('invalid')).toBe(false);
    });

    it('isVoiceLanguage should correctly identify valid language', () => {
      expect(isVoiceLanguage(VoiceLanguage.Indonesian)).toBe(true);
      expect(isVoiceLanguage(VoiceLanguage.English)).toBe(true);
      expect(isVoiceLanguage('fr-FR')).toBe(false);
    });

    it('isVoiceSettingsBackup should correctly identify valid backup', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        settings: {
          recognition: {
            language: VoiceLanguage.Indonesian,
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

      expect(isVoiceSettingsBackup(backup)).toBe(true);
      expect(isVoiceSettingsBackup('invalid')).toBe(false);
    });
  });

  describe('sanitizeVoiceTranscript', () => {
    it('should sanitize XSS in transcript', () => {
      const malicious = '<script>alert("xss")</script>test';
      const sanitized = sanitizeVoiceTranscript(malicious);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;test');
    });

    it('should escape ampersand', () => {
      const input = 'test & more';
      const sanitized = sanitizeVoiceTranscript(input);
      expect(sanitized).toBe('test &amp; more');
    });

    it('should escape quotes', () => {
      const input = 'test "quotes" and \'apostrophes\'';
      const sanitized = sanitizeVoiceTranscript(input);
      expect(sanitized).toBe('test &quot;quotes&quot; and &#x27;apostrophes&#x27;');
    });

    it('should handle empty string', () => {
      const sanitized = sanitizeVoiceTranscript('');
      expect(sanitized).toBe('');
    });
  });

  describe('validateAndSanitizeVoiceCommand', () => {
    it('should validate and sanitize valid command', () => {
      const command = {
        id: 'open_settings',
        action: 'OPEN_SETTINGS',
        transcript: '<script>alert("xss")</script>buka pengaturan',
        confidence: 0.95,
      };

      const result = validateAndSanitizeVoiceCommand(command);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toBeDefined();
      expect(result.sanitized!.transcript).toContain('&lt;script&gt;');
    });

    it('should return error for invalid command', () => {
      const command = {
        id: '',
        action: 'OPEN_SETTINGS',
        transcript: 'test',
        confidence: 0.95,
      };

      const result = validateAndSanitizeVoiceCommand(command);
      expect(result.isValid).toBe(false);
      expect(result.sanitized).toBeUndefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
