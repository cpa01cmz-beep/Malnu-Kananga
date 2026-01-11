import React, { useState, useCallback, useRef } from 'react';
import { useFieldValidation, UseFieldValidationOptions } from './useFieldValidation';
import { logger } from '../utils/logger';

export interface FormFieldConfig {
  value: unknown;
  rules?: Array<{ validate: (value: string) => boolean; message: string }>;
  triggers?: {
    onBlur?: boolean;
    onChange?: boolean;
    onSubmit?: boolean;
  };
}

export interface FormState {
  fields: Record<string, unknown>;
  errors: Record<string, string[]>;
  touchedFields: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface UseFormOptions {
  initialValues: Record<string, unknown>;
  validationSchema?: Record<string, UseFieldValidationOptions['rules']>;
  onSubmit?: (values: Record<string, unknown>) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn {
  formState: FormState;
  getFieldValue: (name: string) => unknown;
  getFieldError: (name: string) => string | undefined;
  getFieldTouched: (name: string) => boolean;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string) => void;
  clearFieldError: (name: string) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  getFieldProps: (name: string) => {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
  };
}

/**
 * Enhanced form validation hook for React forms
 * Provides consistent validation behavior across all forms
 */
export function useForm(options: UseFormOptions): UseFormReturn {
  const {
    initialValues,
    validationSchema = {},
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true
  } = options;

  const [formState, setFormState] = useState<FormState>({
    fields: { ...initialValues },
    errors: {},
    touchedFields: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false
  });

  const _fieldValidatorsRef = useRef<Record<string, ReturnType<typeof useFieldValidation>>>({});
  const validateOnBlurRef = useRef(validateOnBlur);
  const validateOnChangeRef = useRef(validateOnChange);

  validateOnBlurRef.current = validateOnBlur;
  validateOnChangeRef.current = validateOnChange;

  /**
   * Get field value
   */
  const getFieldValue = useCallback((name: string) => {
    return formState.fields[name];
  }, [formState.fields]);

  /**
   * Get field error
   */
  const getFieldError = useCallback((name: string) => {
    const errors = formState.errors[name];
    return errors && errors.length > 0 ? errors[0] : undefined;
  }, [formState.errors]);

  /**
   * Get field touched state
   */
  const getFieldTouched = useCallback((name: string) => {
    return formState.touchedFields[name] || false;
  }, [formState.touchedFields]);

  /**
   * Set field value
   */
  const setFieldValue = useCallback((name: string, value: unknown) => {
    setFormState(prev => {
      const newFields = { ...prev.fields, [name]: value };
      const isDirty = JSON.stringify(newFields) !== JSON.stringify(initialValues);

      return {
        ...prev,
        fields: newFields,
        isDirty
      };
    });

    const fieldValue = formState.fields[name];
    const isTouched = formState.touchedFields[name];
    const shouldValidate = validateOnChangeRef.current && isTouched;

    if (shouldValidate) {
      const rules = validationSchema[name];
      if (rules && Array.isArray(rules)) {
        const errors: string[] = [];
        const stringValue = String(fieldValue || '');

        for (const rule of rules) {
          if (!rule.validate(stringValue)) {
            errors.push(rule.message);
          }
        }

        setFormState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: errors
          }
        }));
      }
    }
  }, [initialValues, formState.fields, formState.touchedFields, validationSchema]);

  /**
   * Set field error
   */
  const setFieldError = useCallback((name: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: [error]
      }
    }));
  }, []);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((name: string) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      return {
        ...prev,
        errors: newErrors
      };
    });
  }, []);

  /**
   * Set field touched state
   */
  const setFieldTouched = useCallback((name: string, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      touchedFields: {
        ...prev.touchedFields,
        [name]: touched
      }
    }));

    if (validateOnBlurRef.current && touched) {
      const rules = validationSchema[name];
      if (rules && Array.isArray(rules)) {
        const fieldValue = formState.fields[name];
        const errors: string[] = [];
        const stringValue = String(fieldValue || '');

        for (const rule of rules) {
          if (!rule.validate(stringValue)) {
            errors.push(rule.message);
          }
        }

        setFormState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: errors
          }
        }));
      }
    }
  }, [formState.fields, validationSchema]);

  /**
   * Validate single field
   */
  const validateField = useCallback((name: string): boolean => {
    const rules = validationSchema[name];
    if (!rules || !Array.isArray(rules)) {
      return true;
    }

    const value = getFieldValue(name);
    const errors: string[] = [];
    const stringValue = String(value || '');

    for (const rule of rules) {
      if (!rule.validate(stringValue)) {
        errors.push(rule.message);
      }
    }

    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: errors
      }
    }));

    return errors.length === 0;
  }, [validationSchema, getFieldValue]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const allErrors: Record<string, string[]> = {};

    Object.keys(validationSchema).forEach(fieldName => {
      const rules = validationSchema[fieldName];
      if (!rules || !Array.isArray(rules)) return;

      const value = getFieldValue(fieldName);
      const errors: string[] = [];
      const stringValue = String(value || '');

      for (const rule of rules) {
        if (!rule.validate(stringValue)) {
          errors.push(rule.message);
        }
      }

      if (errors.length > 0) {
        allErrors[fieldName] = errors;
        isValid = false;
      }
    });

    setFormState(prev => ({
      ...prev,
      errors: allErrors,
      isValid
    }));

    return isValid;
  }, [validationSchema, getFieldValue]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setFormState({
      fields: { ...initialValues },
      errors: {},
      touchedFields: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false
    });
  }, [initialValues]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const allFieldNames = Object.keys(validationSchema);
    setFormState(prev => {
      const newTouchedFields = { ...prev.touchedFields };
      allFieldNames.forEach(name => {
        newTouchedFields[name] = true;
      });
      return {
        ...prev,
        touchedFields: newTouchedFields
      };
    });

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (onSubmit) {
        await onSubmit(formState.fields);
      }
    } catch (error) {
      logger.error('Form submission error:', error);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validationSchema, validateForm, onSubmit, formState.fields]);

  /**
   * Get field props for form components
   */
  const getFieldProps = useCallback((name: string) => {
    return {
      value: getFieldValue(name),
      onChange: (value: unknown) => setFieldValue(name, value),
      onBlur: () => setFieldTouched(name, true),
      error: getFieldError(name),
      touched: getFieldTouched(name)
    };
  }, [getFieldValue, setFieldValue, setFieldTouched, getFieldError, getFieldTouched]);

  return {
    formState,
    getFieldValue,
    getFieldError,
    getFieldTouched,
    setFieldValue,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    handleSubmit,
    getFieldProps
  };
}
