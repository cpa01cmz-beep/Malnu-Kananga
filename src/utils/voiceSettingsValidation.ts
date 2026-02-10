import type {
  VoiceSettings,
  SpeechRecognitionConfig,
  SpeechSynthesisConfig,
  VoiceCommand,
  VoiceLanguage,
} from '../types';
import { VOICE_CONFIG, VOICE_BOUNDS } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

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

/**
 * Validates a VoiceSettings object
 */
export function validateVoiceSettings(settings: unknown): ValidationResult {
  const errors: string[] = [];

  if (!settings || typeof settings !== 'object') {
    return { isValid: false, errors: ['Voice settings must be an object'] };
  }

  const s = settings as Partial<VoiceSettings>;

  if (s.enabled !== undefined && typeof s.enabled !== 'boolean') {
    errors.push('enabled flag must be a boolean');
  }

  if (s.autoReadAI !== undefined && typeof s.autoReadAI !== 'boolean') {
    errors.push('autoReadAI flag must be a boolean');
  }

  if (s.continuousMode !== undefined && typeof s.continuousMode !== 'boolean') {
    errors.push('continuousMode flag must be a boolean');
  }

  if (s.recognition !== undefined) {
    const recognitionValidation = validateSpeechRecognitionConfig(s.recognition);
    if (!recognitionValidation.isValid) {
      errors.push(...recognitionValidation.errors.map((e) => `recognition.${e}`));
    }
  }

  if (s.synthesis !== undefined) {
    const synthesisValidation = validateSpeechSynthesisConfig(s.synthesis);
    if (!synthesisValidation.isValid) {
      errors.push(...synthesisValidation.errors.map((e) => `synthesis.${e}`));
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a SpeechRecognitionConfig object
 */
export function validateSpeechRecognitionConfig(config: unknown): ValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { isValid: false, errors: ['Speech recognition config must be an object'] };
  }

  const c = config as Partial<SpeechRecognitionConfig>;

  if (!c.language) {
    errors.push('language is required');
  } else {
    const languageValidation = validateVoiceLanguage(c.language);
    if (!languageValidation.isValid) {
      errors.push(...languageValidation.errors);
    }
  }

  if (c.continuous !== undefined && typeof c.continuous !== 'boolean') {
    errors.push('continuous must be a boolean');
  }

  if (c.interimResults !== undefined && typeof c.interimResults !== 'boolean') {
    errors.push('interimResults must be a boolean');
  }

  if (c.maxAlternatives !== undefined) {
    if (typeof c.maxAlternatives !== 'number') {
      errors.push('maxAlternatives must be a number');
    } else if (c.maxAlternatives < VOICE_BOUNDS.MAX_ALTERNATIVES.MIN || c.maxAlternatives > VOICE_BOUNDS.MAX_ALTERNATIVES.MAX) {
      errors.push(`maxAlternatives must be between ${VOICE_BOUNDS.MAX_ALTERNATIVES.MIN} and ${VOICE_BOUNDS.MAX_ALTERNATIVES.MAX}`);
    } else if (!Number.isInteger(c.maxAlternatives)) {
      errors.push('maxAlternatives must be an integer');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a SpeechSynthesisConfig object
 */
export function validateSpeechSynthesisConfig(config: unknown): ValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { isValid: false, errors: ['Speech synthesis config must be an object'] };
  }

  const c = config as Partial<SpeechSynthesisConfig>;

  if (c.voice !== undefined && c.voice !== null && typeof c.voice !== 'object') {
    errors.push('voice must be an object or null');
  }

  if (c.rate !== undefined) {
    if (typeof c.rate !== 'number') {
      errors.push('rate must be a number');
    } else if (c.rate < VOICE_CONFIG.RATE_BOUNDS.MIN || c.rate > VOICE_CONFIG.RATE_BOUNDS.MAX) {
      errors.push(`rate must be between ${VOICE_CONFIG.RATE_BOUNDS.MIN} and ${VOICE_CONFIG.RATE_BOUNDS.MAX}`);
    }
  }

  if (c.pitch !== undefined) {
    if (typeof c.pitch !== 'number') {
      errors.push('pitch must be a number');
    } else if (c.pitch < VOICE_CONFIG.PITCH_BOUNDS.MIN || c.pitch > VOICE_CONFIG.PITCH_BOUNDS.MAX) {
      errors.push(`pitch must be between ${VOICE_CONFIG.PITCH_BOUNDS.MIN} and ${VOICE_CONFIG.PITCH_BOUNDS.MAX}`);
    }
  }

  if (c.volume !== undefined) {
    if (typeof c.volume !== 'number') {
      errors.push('volume must be a number');
    } else if (c.volume < VOICE_CONFIG.VOLUME_BOUNDS.MIN || c.volume > VOICE_CONFIG.VOLUME_BOUNDS.MAX) {
      errors.push(`volume must be between ${VOICE_CONFIG.VOLUME_BOUNDS.MIN} and ${VOICE_CONFIG.VOLUME_BOUNDS.MAX}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a VoiceCommand object
 */
export function validateVoiceCommand(command: unknown): ValidationResult {
  const errors: string[] = [];

  if (!command || typeof command !== 'object') {
    return { isValid: false, errors: ['Voice command must be an object'] };
  }

  const cmd = command as Partial<VoiceCommand>;

  if (!cmd.id || typeof cmd.id !== 'string' || cmd.id.trim().length === 0) {
    errors.push('Command id is required and must be a non-empty string');
  }

  if (!cmd.action || typeof cmd.action !== 'string' || cmd.action.trim().length === 0) {
    errors.push('Command action is required and must be a non-empty string');
  }

  if (!cmd.transcript || typeof cmd.transcript !== 'string' || cmd.transcript.trim().length === 0) {
    errors.push('Command transcript is required and must be a non-empty string');
  }

  if (cmd.confidence !== undefined) {
    if (typeof cmd.confidence !== 'number') {
      errors.push('confidence must be a number');
    } else if (cmd.confidence < 0 || cmd.confidence > 1) {
      errors.push('confidence must be between 0 and 1');
    }
  }

  if (cmd.data !== undefined && typeof cmd.data !== 'object' && cmd.data !== null) {
    errors.push('data must be an object or null');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a VoiceLanguage value
 */
export function validateVoiceLanguage(language: unknown): ValidationResult {
  const errors: string[] = [];

  const validLanguages: readonly string[] = ['id-ID', 'en-US'] as const;

  if (!language || typeof language !== 'string') {
    errors.push('VoiceLanguage must be a string');
  } else if (!validLanguages.includes(language)) {
    errors.push(`Invalid VoiceLanguage: ${language}. Must be one of: ${validLanguages.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a VoiceSettingsBackup object
 */
export function validateVoiceSettingsBackup(backup: unknown): ValidationResult {
  const errors: string[] = [];

  if (!backup || typeof backup !== 'object') {
    return { isValid: false, errors: ['Voice settings backup must be an object'] };
  }

  const b = backup as Partial<VoiceSettingsBackup>;

  if (!b.timestamp || typeof b.timestamp !== 'string' || isNaN(Date.parse(b.timestamp))) {
    errors.push('Backup timestamp is required and must be a valid ISO date string');
  }

  if (!b.settings || typeof b.settings !== 'object') {
    errors.push('Backup settings is required and must be an object');
  } else {
    const s = b.settings;

    if (!s.recognition || typeof s.recognition !== 'object') {
      errors.push('Backup settings.recognition is required and must be an object');
    } else {
      const r = s.recognition;

      if (!r.language || typeof r.language !== 'string' || r.language.trim().length === 0) {
        errors.push('Backup settings.recognition.language is required and must be a non-empty string');
      } else {
        const languageValidation = validateVoiceLanguage(r.language);
        if (!languageValidation.isValid) {
          errors.push(...languageValidation.errors.map((e) => `settings.recognition.${e}`));
        }
      }

      if (r.continuous !== undefined && typeof r.continuous !== 'boolean') {
        errors.push('Backup settings.recognition.continuous must be a boolean');
      }
    }

    if (!s.synthesis || typeof s.synthesis !== 'object') {
      errors.push('Backup settings.synthesis is required and must be an object');
    } else {
      const synth = s.synthesis;

      if (synth.rate !== undefined) {
        if (typeof synth.rate !== 'number') {
          errors.push('Backup settings.synthesis.rate must be a number');
        } else if (synth.rate < 0.1 || synth.rate > 10) {
          errors.push('Backup settings.synthesis.rate must be between 0.1 and 10');
        }
      }

      if (synth.pitch !== undefined) {
        if (typeof synth.pitch !== 'number') {
          errors.push('Backup settings.synthesis.pitch must be a number');
        } else if (synth.pitch < 0 || synth.pitch > 2) {
          errors.push('Backup settings.synthesis.pitch must be between 0 and 2');
        }
      }

      if (synth.volume !== undefined) {
        if (typeof synth.volume !== 'number') {
          errors.push('Backup settings.synthesis.volume must be a number');
        } else if (synth.volume < 0 || synth.volume > 1) {
          errors.push('Backup settings.synthesis.volume must be between 0 and 1');
        }
      }

      if (synth.voiceName !== undefined && typeof synth.voiceName !== 'string') {
        errors.push('Backup settings.synthesis.voiceName must be a string');
      }
    }

    if (s.autoReadAI !== undefined && typeof s.autoReadAI !== 'boolean') {
      errors.push('Backup settings.autoReadAI must be a boolean');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Type guard for VoiceSettings
 */
export function isVoiceSettings(value: unknown): value is VoiceSettings {
  const validation = validateVoiceSettings(value);
  return validation.isValid;
}

/**
 * Type guard for SpeechRecognitionConfig
 */
export function isSpeechRecognitionConfig(value: unknown): value is SpeechRecognitionConfig {
  const validation = validateSpeechRecognitionConfig(value);
  return validation.isValid;
}

/**
 * Type guard for SpeechSynthesisConfig
 */
export function isSpeechSynthesisConfig(value: unknown): value is SpeechSynthesisConfig {
  const validation = validateSpeechSynthesisConfig(value);
  return validation.isValid;
}

/**
 * Type guard for VoiceCommand
 */
export function isVoiceCommand(value: unknown): value is VoiceCommand {
  const validation = validateVoiceCommand(value);
  return validation.isValid;
}

/**
 * Type guard for VoiceLanguage
 */
export function isVoiceLanguage(value: unknown): value is VoiceLanguage {
  const validation = validateVoiceLanguage(value);
  return validation.isValid;
}

/**
 * Type guard for VoiceSettingsBackup
 */
export function isVoiceSettingsBackup(value: unknown): value is VoiceSettingsBackup {
  const validation = validateVoiceSettingsBackup(value);
  return validation.isValid;
}

/**
 * Sanitizes voice command transcript to prevent XSS
 */
export function sanitizeVoiceTranscript(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates and sanitizes a voice command
 */
export function validateAndSanitizeVoiceCommand(command: unknown): { isValid: boolean; errors: string[]; sanitized?: VoiceCommand } {
  const validation = validateVoiceCommand(command);

  if (!validation.isValid) {
    return { isValid: false, errors: validation.errors };
  }

  const cmd = command as VoiceCommand;
  
  // Sanitize transcript
  const sanitizedTranscript = sanitizeVoiceTranscript(cmd.transcript);
  
  // Sanitize data object if present
  let sanitizedData = cmd.data;
  if (cmd.data && typeof cmd.data === 'object') {
    sanitizedData = { ...cmd.data };
    for (const key in sanitizedData) {
      const value = sanitizedData[key];
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeVoiceTranscript(value);
      }
    }
  }
  
  const sanitized: VoiceCommand = {
    ...cmd,
    transcript: sanitizedTranscript,
    data: sanitizedData,
  };

  return { isValid: true, errors: [], sanitized };
}
