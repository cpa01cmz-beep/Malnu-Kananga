import { useState, useCallback, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { ValidationRule, ValidationResult } from '../utils/validation';
import { UI_DELAYS } from '../constants';

/**
 * Enhanced Form Validation with Real-time Feedback
 * Provides instant validation, helpful error messages, and accessibility features
 */

interface UseFormValidationOptions {
  // Validation timing
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  
  // UI behavior
  showSuccessIndicator?: boolean;
  clearErrorsOnFocus?: boolean;
  focusFirstError?: boolean;
  
  // Accessibility
  ariaLive?: 'polite' | 'assertive' | 'off';
  announceErrors?: boolean;
}

interface UseFormValidationReturn {
  // Validation state
  errors: Record<string, string[]>;
  isValid: boolean;
  isDirty: boolean;
  isValidating: Record<string, boolean>;
  
  // Validation methods
  validateField: (name: string, value: string, rules?: ValidationRule[]) => ValidationResult;
  validateForm: (data: Record<string, string>) => ValidationResult;
  clearErrors: (fieldName?: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
  
  // Field helpers
  getFieldProps: (name: string) => {
    onChange: (value: string) => void;
    onBlur: () => void;
    onFocus: () => void;
    error: string | null;
    isValid: boolean;
    isDirty: boolean;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  };
  
  // Form submission
  handleSubmit: (onSubmit: (data: Record<string, string>) => void | Promise<void>) => (e: FormEvent) => void;
  isSubmitting: boolean;
}

export const useFormValidation = (
  initialValues: Record<string, string> = {},
  validationRules: Record<string, ValidationRule[]> = {},
  options: UseFormValidationOptions = {}
): UseFormValidationReturn => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = UI_DELAYS.DEBOUNCE_SHORT,
    clearErrorsOnFocus = true,
    focusFirstError = true,
    announceErrors = true,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedValidation, setDebouncedValidation] = useState<Record<string, ReturnType<typeof setTimeout>>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const errorAnnouncerRef = useRef<HTMLDivElement>(null);

  // Validate a single field
  const validateField = useCallback((
    name: string, 
    value: string, 
    rules?: ValidationRule[]
  ): ValidationResult => {
    const fieldRules = rules || validationRules[name] || [];
    const fieldErrors: string[] = [];

    setIsValidating(prev => ({ ...prev, [name]: true }));

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        fieldErrors.push(rule.message);
      }
    }

    setIsValidating(prev => ({ ...prev, [name]: false }));

    const result: ValidationResult = {
      isValid: fieldErrors.length === 0,
      errors: fieldErrors,
    };

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors,
    }));

    // Announce errors for accessibility
    if (announceErrors && fieldErrors.length > 0 && errorAnnouncerRef.current) {
      errorAnnouncerRef.current.textContent = `Field ${name} has errors: ${fieldErrors.join(', ')}`;
    }

    return result;
  }, [validationRules, announceErrors]);

  // Validate entire form
  const validateForm = useCallback((data: Record<string, string>): ValidationResult => {
    let allErrors: string[] = [];
    const fieldErrors: Record<string, string[]> = {};

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const fieldValue = data[fieldName];
      const result = validateField(fieldName, fieldValue, rules);
      
      if (!result.isValid) {
        fieldErrors[fieldName] = result.errors;
        allErrors.push(...result.errors);
      }
    }

    setErrors(fieldErrors);

    // Focus first error field
    if (focusFirstError && Object.keys(fieldErrors).length > 0 && formRef.current) {
      const firstErrorField = formRef.current.querySelector(`[name="${Object.keys(fieldErrors)[0]}"]`) as HTMLElement;
      firstErrorField?.focus();
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }, [validationRules, validateField, focusFirstError]);

  // Clear errors
  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  // Set field error
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: [error],
    }));
  }, []);

  // Get field props for controlled components
  const getFieldProps = useCallback((name: string) => {
    const handleChange = (value: string) => {
      setValues(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name]: true }));

      if (validateOnChange) {
        // Clear existing debounce
        if (debouncedValidation[name]) {
          clearTimeout(debouncedValidation[name]);
        }

        // Debounce validation
        const timeout = setTimeout(() => {
          validateField(name, value);
        }, debounceMs);

        setDebouncedValidation(prev => ({
          ...prev,
          [name]: timeout,
        }));
      }
    };

    const handleBlur = () => {
      if (validateOnBlur) {
        validateField(name, String(values[name] ?? ''));
      }
    };

    const handleFocus = () => {
      if (clearErrorsOnFocus) {
        clearErrors(name);
      }
    };

    const fieldErrors = errors[name] || [];
    const hasError = fieldErrors.length > 0;
    const errorId = `${name}-error`;

    return {
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      error: hasError ? fieldErrors[0] : null,
      isValid: !hasError && touched[name],
      isDirty: touched[name],
      'aria-invalid': hasError,
      'aria-describedby': hasError ? errorId : undefined,
    };
  }, [
    values,
    errors,
    touched,
    validateOnChange,
    validateOnBlur,
    clearErrorsOnFocus,
    debounceMs,
    validateField,
    clearErrors,
    debouncedValidation,
  ]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (data: Record<string, string>) => void | Promise<void>) => {
    return async (e: FormEvent) => {
      e.preventDefault();
      
      const result = validateForm(values);
      
      if (result.isValid) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  }, [values, validateForm]);

  // Calculate overall form validity
  const isValid = Object.keys(errors).length === 0;
  const isDirty = Object.keys(touched).some(key => touched[key]);

  // Cleanup debounced validations on unmount
  useEffect(() => {
    return () => {
      Object.values(debouncedValidation).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [debouncedValidation]);

  return {
    errors,
    isValid,
    isDirty,
    isValidating,
    validateField,
    validateForm,
    clearErrors,
    setFieldError,
    getFieldProps,
    handleSubmit,
    isSubmitting,
  };
};



export default useFormValidation;