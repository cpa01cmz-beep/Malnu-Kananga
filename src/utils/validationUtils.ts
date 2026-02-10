import { ValidationRule } from '../components/ui/EnhancedInput';

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => value.trim().length > 0 || message,
    message,
    type: 'required'
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value) || message;
    },
    message,
    type: 'pattern'
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => !value || value.length >= min || (message || `Minimum ${min} characters required`),
    message: message || `Minimum ${min} characters required`,
    type: 'length'
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => !value || value.length <= max || (message || `Maximum ${max} characters allowed`),
    message: message || `Maximum ${max} characters allowed`,
    type: 'length'
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => !value || regex.test(value) || message,
    message,
    type: 'pattern'
  }),
  
  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => {
      const phoneRegex = /^[\d\s\-+()]+$/;
      return !value || (phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10) || message;
    },
    message,
    type: 'pattern'
  }),
  
  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      return (hasUpper && hasLower && hasNumber && value.length >= 8) || message;
    },
    message,
    type: 'pattern'
  }),
  
  custom: (validator: (value: string) => boolean | string, message: string, type: ValidationRule['type'] = 'custom'): ValidationRule => ({
    validate: validator,
    message,
    type
  })
};