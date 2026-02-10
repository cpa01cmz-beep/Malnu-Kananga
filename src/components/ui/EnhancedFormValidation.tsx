/**
 * Enhanced Form Validation System
 * Real-time validation with sophisticated feedback patterns
 */

import React, { useState, useCallback, useRef, createContext, useContext } from 'react';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import FormFeedback, { FeedbackType } from './FormFeedback';

export interface ValidationRule {
  validate: (value: unknown, formData?: Record<string, unknown>) => boolean | Promise<boolean>;
  message: string;
  type?: FeedbackType;
  debounceMs?: number;
  async?: boolean;
}

export interface FieldValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  isValidating: boolean;
  lastValidated: Date | null;
}

export interface FormValidationConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  debounceMs?: number;
  showRealtimeFeedback?: boolean;
  hapticFeedback?: boolean;
  accessibility?: {
    announceErrors?: boolean;
    describeChanges?: boolean;
  };
}

interface FormValidationContextType {
  formData: Record<string, unknown>;
  fieldValidations: Record<string, FieldValidation>;
  isFormValid: boolean;
  isFormSubmitting: boolean;
  updateField: (name: string, value: unknown) => void;
  validateField: (name: string, rules: ValidationRule[]) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetValidation: () => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  getFieldError: (name: string) => string | null;
  getFieldWarning: (name: string) => string | null;
  getFieldInfo: (name: string) => string | null;
  isFieldValid: (name: string) => boolean;
  isFieldTouched: (name: string) => boolean;
}

const FormValidationContext = createContext<FormValidationContextType | undefined>(undefined);

interface FormValidationProviderProps {
  children: React.ReactNode;
  initialValues?: Record<string, unknown>;
  config?: FormValidationConfig;
}

export const FormValidationProvider: React.FC<FormValidationProviderProps> = ({
  children,
  initialValues = {},
  config = {},
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialValues);
  const [fieldValidations, setFieldValidations] = useState<Record<string, FieldValidation>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { onError, onSuccess, onWarning } = useHapticFeedback();
  
  const finalConfig = {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
    debounceMs: 300,
    showRealtimeFeedback: true,
    hapticFeedback: true,
    ...config,
  };

  const updateField = useCallback((name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
  }, [touchedFields]);

  const validateField = useCallback(async (name: string, rules: ValidationRule[]) => {
    const value = formData[name];
    
    setFieldValidations(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        isValidating: true,
      },
    }));

    const validationPromises = rules.map(async (rule) => {
      try {
        const isValid = await rule.validate(value, formData);
        return {
          valid: isValid,
          message: rule.message,
          type: rule.type || (isValid ? 'success' : 'error'),
        };
      } catch (_error) {
        return {
          valid: false,
          message: rule.message,
          type: 'error' as FeedbackType,
        };
      }
    });

    const results = await Promise.all(validationPromises);
    
    const errors = results.filter(r => !r.valid && r.type === 'error').map(r => r.message);
    const warnings = results.filter(r => !r.valid && r.type === 'warning').map(r => r.message);
    const info = results.filter(r => !r.valid && r.type === 'info').map(r => r.message);
    
    const isValid = errors.length === 0;
    
    setFieldValidations(prev => ({
      ...prev,
      [name]: {
        isValid,
        errors,
        warnings,
        info,
        isValidating: false,
        lastValidated: new Date(),
      },
    }));

    // Haptic feedback for validation results
    if (finalConfig.hapticFeedback && touchedFields[name]) {
      if (!isValid) {
        onError();
      } else if (warnings.length > 0) {
        onWarning();
      } else {
        onSuccess();
      }
    }

    return isValid;
  }, [formData, touchedFields, finalConfig.hapticFeedback, onError, onSuccess, onWarning]);

  const validateForm = useCallback(async () => {
    setIsFormSubmitting(true);
    
    // This would typically be called with all field rules
    // For now, we'll validate based on current validations
    const isValid = Object.values(fieldValidations).every(
      validation => validation.isValid && validation.errors.length === 0
    );
    
    setIsFormSubmitting(false);
    return isValid;
  }, [fieldValidations]);

  const resetValidation = useCallback(() => {
    setFieldValidations({});
    setTouchedFields({});
    setIsFormSubmitting(false);
  }, []);

  const setFieldTouched = useCallback((name: string, touched: boolean) => {
    setTouchedFields(prev => ({ ...prev, [name]: touched }));
  }, []);

  const getFieldError = useCallback((name: string) => {
    return fieldValidations[name]?.errors[0] || null;
  }, [fieldValidations]);

  const getFieldWarning = useCallback((name: string) => {
    return fieldValidations[name]?.warnings[0] || null;
  }, [fieldValidations]);

  const getFieldInfo = useCallback((name: string) => {
    return fieldValidations[name]?.info[0] || null;
  }, [fieldValidations]);

  const isFieldValid = useCallback((name: string) => {
    const validation = fieldValidations[name];
    return validation?.isValid !== false && validation?.errors.length === 0;
  }, [fieldValidations]);

  const isFieldTouched = useCallback((name: string) => {
    return touchedFields[name] || false;
  }, [touchedFields]);

  const isFormValid = Object.values(fieldValidations).every(
    validation => validation.isValid !== false && validation.errors.length === 0
  );

  const value: FormValidationContextType = {
    formData,
    fieldValidations,
    isFormValid,
    isFormSubmitting,
    updateField,
    validateField,
    validateForm,
    resetValidation,
    setFieldTouched,
    getFieldError,
    getFieldWarning,
    getFieldInfo,
    isFieldValid,
    isFieldTouched,
  };

  return (
    <FormValidationContext.Provider value={value}>
      {children}
    </FormValidationContext.Provider>
  );
};

export const useFormValidation = () => {
  const context = useContext(FormValidationContext);
  if (context === undefined) {
    throw new Error('useFormValidation must be used within a FormValidationProvider');
  }
  return context;
};

// Enhanced validation rules
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => value !== undefined && value !== null && value !== '',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value || typeof value !== 'string') return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value || typeof value !== 'string') return true;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => {
      if (!value || typeof value !== 'string') return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => {
      if (!value || typeof value !== 'string') return true;
      const phoneRegex = /^[\d\s\-+()]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    message,
  }),

  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, and numbers'): ValidationRule => ({
    validate: (value) => {
      if (!value || typeof value !== 'string') return true;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasMinLength = value.length >= 8;
      return hasUpperCase && hasLowerCase && hasNumbers && hasMinLength;
    },
    message,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => {
      if (!value || typeof value !== 'string') return true;
      return regex.test(value);
    },
    message,
  }),

  custom: (validator: (value: unknown, formData?: Record<string, unknown>) => boolean, message: string): ValidationRule => ({
    validate: validator,
    message,
  }),

  async: (validator: (value: unknown, formData?: Record<string, unknown>) => Promise<boolean>, message: string): ValidationRule => ({
    validate: validator,
    message,
    async: true,
  }),
};

// Component for enhanced field validation feedback
interface EnhancedFieldFeedbackProps {
  fieldName: string;
  showIfUntouched?: boolean;
  className?: string;
}

export const EnhancedFieldFeedback: React.FC<EnhancedFieldFeedbackProps> = ({
  fieldName,
  showIfUntouched = false,
  className = '',
}) => {
  const { getFieldError, getFieldWarning, getFieldInfo, isFieldTouched } = useFormValidation();
  
  const touched = isFieldTouched(fieldName);
  const error = getFieldError(fieldName);
  const warning = getFieldWarning(fieldName);
  const info = getFieldInfo(fieldName);

  if (!showIfUntouched && !touched) return null;

  if (error) {
    return (
      <FormFeedback
        type="error"
        message={error}
        animate={true}
        className={`mt-2 ${className}`}
      />
    );
  }

  if (warning) {
    return (
      <FormFeedback
        type="warning"
        message={warning}
        animate={true}
        className={`mt-2 ${className}`}
      />
    );
  }

  if (info) {
    return (
      <FormFeedback
        type="info"
        message={info}
        animate={true}
        className={`mt-2 ${className}`}
      />
    );
  }

  return null;
};

// Hook for enhanced field validation
export const useFieldValidation = (
  fieldName: string,
  validationRules: ValidationRule[],
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  } = {}
) => {
  const { updateField, validateField, isFieldValid, isFieldTouched, getFieldError } = useFormValidation();
  const { validateOnChange = true, validateOnBlur = true, debounceMs = 300 } = options;
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    updateField(fieldName, value);

    if (validateOnChange) {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce validation
      debounceTimer.current = setTimeout(() => {
        validateField(fieldName, validationRules);
      }, debounceMs);
    }
  }, [fieldName, updateField, validateField, validationRules, validateOnChange, debounceMs]);

  const handleBlur = useCallback(() => {
    if (validateOnBlur) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      validateField(fieldName, validationRules);
    }
  }, [fieldName, validateField, validationRules, validateOnBlur]);

  const fieldProps = {
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': !isFieldValid(fieldName) && isFieldTouched(fieldName),
    'aria-describedby': `${fieldName}-feedback`,
  };

  return {
    fieldProps,
    isValid: isFieldValid(fieldName),
    isTouched: isFieldTouched(fieldName),
    error: getFieldError(fieldName),
  };
};

export default FormValidationProvider;