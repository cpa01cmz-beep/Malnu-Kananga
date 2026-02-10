import type { ReactNode, ChangeEvent, FocusEvent } from 'react';

export interface ValidationRule {
  validate: (value: string) => boolean | string;
  message: string;
  type: 'required' | 'pattern' | 'length' | 'custom';
}

export interface ValidationState {
  isValid: boolean;
  isDirty: boolean;
  errors: string[];
  warnings: string[];
}

export interface EnhancedInputProps {
  label?: string;
  placeholder?: string;
  validationRules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showError?: boolean;
  showWarning?: boolean;
  debounceMs?: number;
  onValidationChange?: (state: ValidationState) => void;
  customError?: string;
  successMessage?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  type?: string;
  autoComplete?: string;
}

export interface IconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'solid' | 'outline' | 'duotone';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  ariaHidden?: boolean;
  ariaLabel?: string;
  animated?: boolean;
  clickable?: boolean;
}
