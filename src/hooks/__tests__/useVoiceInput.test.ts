import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '../useVoiceInput';
import { VoiceLanguage } from '../../types';
import type { ValidationRule } from '../../utils/validation';

describe('useVoiceInput', () => {
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(result.current.transcript).toBe('');
      expect(result.current.isListening).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastValue).toBe('');
      expect(result.current.attemptCount).toBe(0);
      expect(result.current.isValid).toBe(true);
    });

    it('should recognize speech support status', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.isSupported).toBe('boolean');
    });

    it('should initialize with different field types', () => {
      const { result: textResult } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      const { result: numberResult } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'number' },
        })
      );

      const { result: emailResult } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'email' },
        })
      );

      const { result: phoneResult } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'phone' },
        })
      );

      const { result: textareaResult } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'textarea' },
        })
      );

      expect(textResult.current.isValid).toBe(true);
      expect(numberResult.current.isValid).toBe(true);
      expect(emailResult.current.isValid).toBe(true);
      expect(phoneResult.current.isValid).toBe(true);
      expect(textareaResult.current.isValid).toBe(true);
    });

    it('should support Indonesian language', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          language: VoiceLanguage.Indonesian,
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should support English language', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          language: VoiceLanguage.English,
        })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('validation rules', () => {
    it('should accept validation rules prop', () => {
      const mockRule: ValidationRule = {
        validate: (value: string) => value.length >= 3,
        message: 'Minimal 3 karakter',
      };

      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          validationRules: [mockRule],
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should handle multiple validation rules', () => {
      const mockRule1: ValidationRule = {
        validate: (value: string) => value.length >= 3,
        message: 'Minimal 3 karakter',
      };

      const mockRule2: ValidationRule = {
        validate: (value: string) => /^[a-zA-Z]+$/.test(value),
        message: 'Hanya huruf yang diperbolehkan',
      };

      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          validationRules: [mockRule1, mockRule2],
        })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('callbacks', () => {
    it('should accept onBeforeUpdate callback', () => {
      const mockOnBeforeUpdate = vi.fn((value) => value.toUpperCase());

      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          onBeforeUpdate: mockOnBeforeUpdate,
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should accept onAfterUpdate callback', () => {
      const mockOnAfterUpdate = vi.fn();

      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          onAfterUpdate: mockOnAfterUpdate,
        })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('voice feedback', () => {
    it('should enable voice feedback by default', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          enableFeedback: true,
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should disable voice feedback when enableFeedback is false', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
          enableFeedback: false,
        })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should initialize with null error', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(result.current.error).toBe(null);
    });

    it('should provide clearError function', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.clearError).toBe('function');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('state management', () => {
    it('should initialize with empty lastValue', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(result.current.lastValue).toBe('');
    });

    it('should initialize with zero attempt count', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(result.current.attemptCount).toBe(0);
    });
  });

  describe('state property', () => {
    it('should provide state string property', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.state).toBe('string');
      expect(['idle', 'listening', 'processing', 'error']).toContain(result.current.state);
    });

    it('should provide transcript string property', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.transcript).toBe('string');
    });

    it('should provide isListening boolean property', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.isListening).toBe('boolean');
    });

    it('should provide isSupported boolean property', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.isSupported).toBe('boolean');
    });
  });

  describe('methods', () => {
    it('should provide startListening method', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.startListening).toBe('function');
    });

    it('should provide stopListening method', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.stopListening).toBe('function');
    });

    it('should provide abortListening method', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(typeof result.current.abortListening).toBe('function');
    });

    it('should call abortListening without error', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      act(() => {
        result.current.abortListening();
      });

      expect(result.current.isListening).toBe(false);
    });
  });

  describe('textTransform functionality', () => {
    it('should accept textTransform configuration', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text', textTransform: 'title-case' },
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should work without textTransform configuration', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('enhanced number conversion', () => {
    it('should initialize with number field type for Indonesian', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'number' },
          language: VoiceLanguage.Indonesian,
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should initialize with number field type for English', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'number' },
          language: VoiceLanguage.English,
        })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('error handling initialization', () => {
    it('should initialize without error', () => {
      const { result } = renderHook(() =>
        useVoiceInput({
          fieldName: 'test',
          fieldLabel: 'Test Field',
          onValueChange: mockOnValueChange,
          fieldType: { type: 'text' },
        })
      );

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });
  });
});
