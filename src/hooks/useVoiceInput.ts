import { useState, useCallback, useEffect, useRef } from 'react';
import { useVoiceRecognition } from './useVoiceRecognition';
import SpeechSynthesisService from '../services/speechSynthesisService';
import type { ValidationRule } from '../utils/validation';
import { VoiceLanguage } from '../types';
import { logger } from '../utils/logger';

export interface VoiceInputFieldType {
  type: 'text' | 'number' | 'email' | 'phone' | 'textarea';
  format?: 'NISN' | 'phone' | 'email';
  textTransform?: 'title-case';
}

export interface UseVoiceInputOptions {
  fieldName: string;
  fieldLabel: string;
  onValueChange: (value: string) => void;
  fieldType: VoiceInputFieldType;
  validationRules?: ValidationRule[];
  language?: VoiceLanguage;
  continuous?: boolean;
  enableFeedback?: boolean;
  onBeforeUpdate?: (value: string) => string;
  onAfterUpdate?: (value: string, success: boolean) => void;
}

export interface UseVoiceInputReturn {
  transcript: string;
  state: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  abortListening: () => void;
  clearError: () => void;
  lastValue: string;
  attemptCount: number;
  isValid: boolean;
}

export const useVoiceInput = (options: UseVoiceInputOptions): UseVoiceInputReturn => {
  const {
    fieldName: _fieldName,
    fieldLabel,
    onValueChange,
    fieldType,
    validationRules = [],
    language = VoiceLanguage.Indonesian,
    continuous = false,
    enableFeedback = true,
    onBeforeUpdate,
    onAfterUpdate,
  } = options;

  const [error, setError] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(true);

  const synthesisRef = useRef<SpeechSynthesisService | null>(null);

  useEffect(() => {
    if (enableFeedback && typeof window !== 'undefined') {
      synthesisRef.current = new SpeechSynthesisService();
    }

    return () => {
      synthesisRef.current?.cleanup();
    };
  }, [enableFeedback]);

  const speak = useCallback((text: string): void => {
    if (enableFeedback && synthesisRef.current) {
      try {
        synthesisRef.current.speak(text);
      } catch (err) {
        logger.error('Speech synthesis error:', err);
      }
    }
  }, [enableFeedback]);

  const validateValue = useCallback((value: string): { isValid: boolean; error: string | null } => {
    if (validationRules.length === 0) {
      return { isValid: true, error: null };
    }

    for (const rule of validationRules) {
      if (!rule.validate(value)) {
        return { isValid: false, error: rule.message };
      }
    }

    return { isValid: true, error: null };
  }, [validationRules]);

  const processTranscript = useCallback((transcript: string): string => {
    let processed = transcript.trim();

    switch (fieldType.type) {
      case 'text':
        processed = processed.replace(/\s+/g, ' ');
        if (fieldType.textTransform === 'title-case') {
          processed = toTitleCase(processed);
        }
        break;

      case 'number':
        processed = textToNumber(processed, language);
        break;

      case 'email':
        processed = normalizeEmail(processed);
        break;

      case 'phone':
        processed = normalizePhoneNumber(processed);
        break;

      case 'textarea':
        processed = processed.replace(/\s+/g, ' ');
        break;

      default:
        break;
    }

    return processed;
  }, [fieldType, language]);

  const onTranscriptHandler = useCallback((transcript: string, isFinal: boolean): void => {
    if (!isFinal) return;

    const processed = processTranscript(transcript);
    const finalValue = onBeforeUpdate ? onBeforeUpdate(processed) : processed;

    const validation = validateValue(finalValue);

    if (validation.isValid) {
      setLastValue(finalValue);
      setAttemptCount(0);
      setError(null);
      setIsValid(true);

      onValueChange(finalValue);

      if (enableFeedback) {
        speak(`${fieldLabel} berhasil diisi dengan: ${finalValue}`);
      }

      onAfterUpdate?.(finalValue, true);
    } else {
      setError(validation.error);
      setAttemptCount(prev => prev + 1);
      setIsValid(false);

      if (enableFeedback) {
        speak(`Error: ${validation.error}. Silakan ulangi.`);
      }

      onAfterUpdate?.(finalValue, false);
    }
  }, [processTranscript, onBeforeUpdate, validateValue, onValueChange, enableFeedback, speak, fieldLabel, onAfterUpdate]);

  const onErrorHandler = useCallback((error: unknown): void => {
    logger.error('Voice input error:', error);

    let errorMessage = 'Terjadi kesalahan input suara';

    if (typeof error === 'object' && error !== null && 'error' in error) {
      const errorKey = (error as { error: string }).error;
      if (errorKey === 'not-allowed') {
        errorMessage = 'Izin mikrofon ditolak. Silakan izinkan akses mikrofon di pengaturan browser.';
      } else if (errorKey === 'no-speech') {
        errorMessage = 'Tidak ada suara terdeteksi. Silakan coba lagi.';
      } else if (errorKey === 'audio-capture') {
        errorMessage = 'Tidak dapat mengakses mikrofon. Periksa pengaturan perangkat Anda.';
      }
    }

    setError(errorMessage);
    setIsValid(false);

    if (enableFeedback) {
      speak(errorMessage);
    }
  }, [enableFeedback, speak]);

  const voiceRecognition = useVoiceRecognition({
    onTranscript: onTranscriptHandler,
    onError: onErrorHandler,
    autoStart: false,
  });

  const {
    transcript,
    state,
    isListening,
    isSupported,
    startRecording,
    stopRecording,
    abortRecording,
    setContinuous,
  } = voiceRecognition;

  useEffect(() => {
    setContinuous(continuous);
  }, [continuous, setContinuous]);

  const startListening = useCallback(async (): Promise<void> => {
    setError(null);
    setAttemptCount(0);

    if (enableFeedback) {
      speak(`Siap mengisi ${fieldLabel}. Silakan berbicara.`);
    }

    await startRecording();
  }, [enableFeedback, speak, fieldLabel, startRecording]);

  const stopListening = useCallback((): void => {
    stopRecording();
  }, [stopRecording]);

  const abortListening = useCallback((): void => {
    abortRecording();
    setError(null);
    setAttemptCount(0);
  }, [abortRecording]);

  const clearError = useCallback((): void => {
    setError(null);
    setAttemptCount(0);
    setIsValid(true);
  }, []);

  return {
    transcript,
    state,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    abortListening,
    clearError,
    lastValue,
    attemptCount,
    isValid,
  };
};

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

function textToNumber(text: string, language: VoiceLanguage): string {
  const digitMap: Record<string, string> = {
    'nol': '0',
    'satu': '1',
    'dua': '2',
    'tiga': '3',
    'empat': '4',
    'lima': '5',
    'enam': '6',
    'tujuh': '7',
    'delapan': '8',
    'sembilan': '9',
    'zero': '0',
    'one': '1',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9',
  };

  const englishMap: Record<string, string> = {
    'ten': '10',
    'eleven': '11',
    'twelve': '12',
    'thirteen': '13',
    'fourteen': '14',
    'fifteen': '15',
    'sixteen': '16',
    'seventeen': '17',
    'eighteen': '18',
    'nineteen': '19',
    'twenty': '20',
    'thirty': '30',
    'forty': '40',
    'fifty': '50',
    'sixty': '60',
    'seventy': '70',
    'eighty': '80',
    'ninety': '90',
    'hundred': '100',
  };

  const indonesianCompoundMap: Record<string, string> = {
    'sepuluh': '10',
    'sebelas': '11',
    'dua belas': '12',
    'tiga belas': '13',
    'empat belas': '14',
    'lima belas': '15',
    'enam belas': '16',
    'tujuh belas': '17',
    'delapan belas': '18',
    'sembilan belas': '19',
    'dua puluh': '20',
    'tiga puluh': '30',
    'empat puluh': '40',
    'lima puluh': '50',
    'enam puluh': '60',
    'tujuh puluh': '70',
    'delapan puluh': '80',
    'sembilan puluh': '90',
    'seratus': '100',
  };

  if (language === VoiceLanguage.Indonesian) {
    let result = text.toLowerCase();

    for (const [word, digit] of Object.entries(indonesianCompoundMap)) {
      result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }

    for (const [word, digit] of Object.entries(digitMap)) {
      result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }

    return result.replace(/\D/g, '');
  } else {
    let result = text.toLowerCase();

    for (const [word, digit] of Object.entries({ ...digitMap, ...englishMap })) {
      result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }

    return result.replace(/\D/g, '');
  }
}

function normalizeEmail(text: string): string {
  const cleaned = text.toLowerCase().replace(/\s+/g, '');

  const atIndex = cleaned.indexOf('@');

  if (atIndex === -1) {
    return cleaned;
  }

  const localPart = cleaned.substring(0, atIndex).replace(/[^a-z0-9._%+-]/g, '');
  const domainPart = cleaned.substring(atIndex).replace(/[^a-z0-9.-]/g, '');

  return localPart + domainPart;
}

function normalizePhoneNumber(text: string): string {
  let cleaned = text.replace(/\D/g, '');

  if (cleaned.startsWith('08')) {
    return '628' + cleaned.substring(2);
  }

  if (cleaned.startsWith('628')) {
    return cleaned;
  }

  if (cleaned.startsWith('8')) {
    return '628' + cleaned.substring(1);
  }

  return cleaned;
}
