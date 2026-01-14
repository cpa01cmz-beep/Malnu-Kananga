import { forwardRef, useEffect, useRef } from 'react';
import { useFieldValidation } from '../../hooks/useFieldValidation';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaState = 'default' | 'error' | 'success';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: TextareaSize;
  state?: TextareaState;
  fullWidth?: boolean;
  autoResize?: boolean;
  maxRows?: number;
  minRows?: number;
  validationRules?: Array<{ validate: (value: string) => boolean; message: string }>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  accessibility?: {
    announceErrors?: boolean;
    describedBy?: string;
  };
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none";

const sizeClasses: Record<TextareaSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm sm:text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const stateClasses: Record<TextareaState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-primary-500/50 focus:border-primary-500",
  error: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-neutral-900 dark:text-white placeholder-red-400 dark:placeholder-red-500 hover:border-red-400 dark:hover:border-red-600 focus:ring-red-500/50 focus:border-red-500",
  success: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-neutral-900 dark:text-white placeholder-green-400 dark:placeholder-green-500 hover:border-green-400 dark:hover:border-green-600 focus:ring-green-500/50 focus:border-green-500",
};

const labelSizeClasses: Record<TextareaSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<TextareaSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  id,
  label,
  helperText,
  errorText,
  size = 'md',
  state = errorText ? 'error' : 'default',
  fullWidth = false,
  autoResize = true,
  maxRows = 8,
  minRows = 1,
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  accessibility = { announceErrors: true },
  className = '',
  value,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
  
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${textareaId}-helper` : undefined;
  const errorTextId = errorText ? `${textareaId}-error` : undefined;
  const accessibilityDescribedBy = accessibility?.describedBy;
  const describedBy = [helperTextId, errorTextId, accessibilityDescribedBy].filter(Boolean).join(' ') || undefined;

  // Enhanced validation state management
  const validation = useFieldValidation({
    value: String(value || ''),
    rules: validationRules,
    triggers: {
      onBlur: validateOnBlur,
      onChange: validateOnChange,
      onSubmit: true
    },
    accessibility: {
      announceErrors: accessibility.announceErrors,
      errorRole: 'alert'
    }
  });

  const textareaClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[state]}
    ${fullWidth ? 'w-full' : ''}
    ${autoResize ? '' : `min-h-[${minRows * 1.5}rem]`}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Enhanced change handler
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    validation.changeHandler(e.target.value);
  };

  // Enhanced blur handler
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    validation.blurHandler();
    if (onBlur) {
      onBlur(e);
    }
  };

  // Auto-focus management for validation errors
  useEffect(() => {
    if (validation.state.errors.length > 0 && validation.state.isTouched && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [validation.state.errors, validation.state.isTouched, textareaRef]);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, minRows, maxRows, textareaRef]);

  // Determine final state based on validation
  const finalState = validation.state.errors.length > 0 && validation.state.isTouched ? 'error' : 
                    (validation.state.isValid ? state : 'error');
  const finalErrorText = validation.state.errors.length > 0 && validation.state.isTouched ? 
                        validation.state.errors[0] : errorText;

  // Enhanced accessibility attributes
  const accessibilityProps = {
    'aria-required': props.required,
    'aria-errormessage': finalErrorText ? errorTextId : undefined,
    ...(validation.state.isValidating && { 'aria-live': 'polite' as const }),
    ...(validation.state.isValidating && { 'aria-busy': true })
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-label="wajib diisi">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
<textarea
        ref={textareaRef}
        id={textareaId}
        className={textareaClasses}
        aria-describedby={describedBy}
        aria-invalid={finalState === 'error'}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        {...accessibilityProps}
        {...props}
      />

        {validation.state.isValidating && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-primary-500" aria-hidden="true" />
          </div>
        )}
      </div>

{helperText && (
        <p id={helperTextId} className={`${helperTextSizeClasses[size]} text-neutral-500 dark:text-neutral-400`}>
          {helperText}
        </p>
      )}

      {finalErrorText && (
        <p id={errorTextId} className={`${helperTextSizeClasses[size]} text-red-600 dark:text-red-400`} role="alert" aria-live="polite">
          {finalErrorText}
        </p>
      )}

      {/* Character count for accessibility */}
      {props.maxLength && (
        <p className={`${helperTextSizeClasses[size]} text-neutral-400 dark:text-neutral-500 text-right`} aria-live="polite">
          {String(value || '').length}/{props.maxLength}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
