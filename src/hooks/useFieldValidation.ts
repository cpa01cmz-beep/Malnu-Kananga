import { useState, useCallback, useRef, useEffect } from 'react';
import React from 'react';
import { ValidationRule, ValidationResult, announceValidation } from '../utils/validation';

export interface ValidationTrigger {
  onBlur?: boolean;
  onChange?: boolean;
  onSubmit?: boolean;
}

export interface UseFieldValidationOptions<T = string> {
  value: T;
  rules?: ValidationRule[];
  triggers?: ValidationTrigger;
  validateOnMount?: boolean;
  debounceMs?: number;
  accessibility?: {
    announceErrors?: boolean;
    errorRole?: 'alert' | 'status';
  };
}

export interface FieldValidationState {
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  errors: string[];
  isValidating: boolean;
  lastValidated: Date | null;
}

export interface UseFieldValidationReturn<T> {
  state: FieldValidationState;
  validate: () => ValidationResult;
  clearErrors: () => void;
  setTouched: () => void;
  reset: () => void;
  blurHandler: () => void;
  changeHandler: (value: T) => void;
  focusRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

const defaultTriggers: ValidationTrigger = {
  onBlur: true,
  onChange: true,
  onSubmit: true
};

const debounceMap = new Map<(value: string) => void, ReturnType<typeof setTimeout>>();

/**
 * Enhanced field validation hook with accessibility and performance optimizations
 */
export function useFieldValidation<T = string>(options: UseFieldValidationOptions<T>): UseFieldValidationReturn<T> {
  const {
    value,
    rules = [],
    triggers = defaultTriggers,
    validateOnMount = false,
    debounceMs = 300,
    accessibility = {
      announceErrors: true,
      errorRole: 'alert'
    }
  } = options;

  const [state, setState] = useState<FieldValidationState>({
    isValid: true,
    isTouched: false,
    isDirty: false,
    errors: [],
    isValidating: false,
    lastValidated: null
  });

  const initialValueRef = useRef(value);
  const isInitializingRef = useRef(true);

  /**
   * Core validation logic
   */
  const validate = useCallback((): ValidationResult => {
    setState(prev => ({ ...prev, isValidating: true, lastValidated: new Date() }));

    const errors: string[] = [];

    if (rules.length === 0) {
      setState(prev => ({ ...prev, isValid: true, errors: [], isValidating: false }));
      return { isValid: true, errors: [] };
    }

    // Convert value to string for validation
    const stringValue = String(value || '').trim();

    // Run all validation rules
    for (const rule of rules) {
      if (!rule.validate(stringValue)) {
        errors.push(rule.message);
      }
    }

    const isValid = errors.length === 0;
    const result: ValidationResult = { isValid, errors };

    setState(prev => ({
      ...prev,
      isValid,
      errors,
      isValidating: false
    }));

    // Accessibility announcement
    if (accessibility.announceErrors && !isValid && state.isTouched) {
      announceValidation(errors[0], 'error');
    }

    return result;
  }, [value, rules, accessibility.announceErrors, state.isTouched]);

  /**
   * Debounced validation for onChange events
   */
  const debouncedValidate = useCallback((_newValue: T) => {
    const key = validate;
    
    // Clear existing debounce
    if (debounceMap.has(key)) {
      clearTimeout(debounceMap.get(key)!);
    }

    // Set new debounce
    const timeout = setTimeout(() => {
      validate();
      debounceMap.delete(key);
    }, debounceMs);

    debounceMap.set(key, timeout);
  }, [validate, debounceMs]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      isValid: true,
      errors: []
    }));
  }, []);

  /**
   * Mark field as touched
   */
  const setTouched = useCallback(() => {
    setState(prev => ({ ...prev, isTouched: true }));
  }, []);

  /**
   * Reset field to initial state
   */
  const reset = useCallback(() => {
    setState({
      isValid: true,
      isTouched: false,
      isDirty: false,
      errors: [],
      isValidating: false,
      lastValidated: null
    });
    initialValueRef.current = value;
  }, [value]);

  /**
   * Handle blur events
   */
  const blurHandler = useCallback(() => {
    setTouched();
    if (triggers.onBlur) {
      validate();
    }
  }, [setTouched, triggers.onBlur, validate]);

  /**
   * Handle change events
   */
  const changeHandler = useCallback((newValue: T) => {
    const isDirty = String(newValue) !== String(initialValueRef.current);
    
    setState(prev => ({
      ...prev,
      isDirty
    }));

    if (triggers.onChange && state.isTouched) {
      debouncedValidate(newValue);
    }
  }, [triggers.onChange, state.isTouched, debouncedValidate]);

  // Initial validation on mount
  useEffect(() => {
    if (validateOnMount && !isInitializingRef.current) {
      validate();
    }
    isInitializingRef.current = false;
  }, [validateOnMount, validate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      for (const timeout of debounceMap.values()) {
        clearTimeout(timeout);
      }
      debounceMap.clear();
    };
  }, []);

  return {
    state,
    validate,
    clearErrors,
    setTouched,
    reset,
    blurHandler,
    changeHandler
  };
}

/**
 * Enhanced validation rules for common Indonesian school data
 */
export const standardValidationRules = {
  required: (message?: string): ValidationRule => ({
    validate: (value: string) => value.trim().length > 0,
    message: message || 'Field ini wajib diisi'
  }),

  email: (): ValidationRule => ({
    validate: (email: string) => {
      if (!email || email.trim() === '') return true; // Use required rule for emptiness check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    },
    message: 'Format email tidak valid. Contoh: nama@email.com'
  }),

  nisn: (): ValidationRule => ({
    validate: (nisn: string) => {
      if (!nisn || nisn.trim() === '') return true;
      const cleanNisn = nisn.replace(/\D/g, '');
      return cleanNisn.length === 10 && /^\d+$/.test(cleanNisn);
    },
    message: 'NISN harus 10 digit angka'
  }),

  phone: (): ValidationRule => ({
    validate: (phone: string) => {
      if (!phone || phone.trim() === '') return true;
      const cleanPhone = phone.replace(/\D/g, '');
      return cleanPhone.length >= 10 && cleanPhone.length <= 13 && /^\d+$/.test(cleanPhone);
    },
    message: 'Nomor telepon harus 10-13 digit angka'
  }),

  password: (): ValidationRule => ({
    validate: (password: string) => {
      return !!(password && password.length >= 6);
    },
    message: 'Password minimal 6 karakter'
  }),

  minLength: (min: number, field?: string): ValidationRule => ({
    validate: (value: string) => !value || value.trim().length >= min,
    message: `${field || 'Field ini'} minimal ${min} karakter`
  }),

  maxLength: (max: number, field?: string): ValidationRule => ({
    validate: (value: string) => !value || value.trim().length <= max,
    message: `${field || 'Field ini'} maksimal ${max} karakter`
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => !value || regex.test(value.trim()),
    message
  }),

  numeric: (field?: string): ValidationRule => ({
    validate: (value: string) => !value || /^\d+$/.test(value.replace(/\D/g, '')),
    message: `${field || 'Field ini'} hanya boleh berisi angka`
  })
};