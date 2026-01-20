import React, { forwardRef } from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectState = 'default' | 'error' | 'success';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: SelectSize;
  state?: SelectState;
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white dark:bg-neutral-700 cursor-pointer";

const sizeClasses: Record<SelectSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm sm:text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const stateClasses: Record<SelectState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-primary-500/50 focus:border-primary-500",
  error: "border-red-300 dark:border-red-700 text-neutral-900 dark:text-white hover:border-red-400 dark:hover:border-red-600 focus:ring-red-500/50 focus:border-red-500",
  success: "border-green-300 dark:border-green-700 text-neutral-900 dark:text-white hover:border-green-400 dark:hover:border-green-600 focus:ring-green-500/50 focus:border-green-500",
};

const labelSizeClasses: Record<SelectSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<SelectSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  id,
  label,
  helperText,
  errorText,
  size = 'md',
  state = errorText ? 'error' : 'default',
  fullWidth = false,
  options,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${selectId}-helper` : undefined;
  const errorTextId = errorText ? `${selectId}-error` : undefined;
  const describedBy = [helperTextId, errorTextId].filter(Boolean).join(' ') || undefined;

  const selectClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[state]}
    ${fullWidth ? 'w-full' : ''}
    pr-10
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-label="wajib diisi">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          aria-describedby={describedBy}
          aria-invalid={state === 'error'}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 dark:text-neutral-500" aria-hidden="true">
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {helperText && (
        <p id={helperTextId} className={`${helperTextSizeClasses[size]} text-neutral-500 dark:text-neutral-400`}>
          {helperText}
        </p>
      )}

      {errorText && (
        <p id={errorTextId} className={`${helperTextSizeClasses[size]} text-red-600 dark:text-red-400`} role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
