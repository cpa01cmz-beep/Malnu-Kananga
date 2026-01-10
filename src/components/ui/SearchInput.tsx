import React, { forwardRef } from 'react';
import { MagnifyingGlassIcon } from '../icons/NotificationIcons';

export type SearchInputSize = 'sm' | 'md' | 'lg';
export type SearchInputState = 'default' | 'error' | 'success';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: SearchInputSize;
  state?: SearchInputState;
  fullWidth?: boolean;
  showIcon?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

const sizeClasses: Record<SearchInputSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm sm:text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const sizeIconClasses: Record<SearchInputSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const stateClasses: Record<SearchInputState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-primary-500/50 focus:border-primary-500",
  error: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-neutral-900 dark:text-white placeholder-red-400 dark:placeholder-red-500 hover:border-red-400 dark:hover:border-red-600 focus:ring-red-500/50 focus:border-red-500",
  success: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-neutral-900 dark:text-white placeholder-green-400 dark:placeholder-green-500 hover:border-green-400 dark:hover:border-green-600 focus:ring-green-500/50 focus:border-green-500",
};

const labelSizeClasses: Record<SearchInputSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<SearchInputSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  id,
  label,
  helperText,
  errorText,
  size = 'md',
  state = errorText ? 'error' : 'default',
  fullWidth = false,
  showIcon = true,
  placeholder,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const searchId = id || `search-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${searchId}-helper` : undefined;
  const errorTextId = errorText ? `${searchId}-error` : undefined;
  const describedBy = [helperTextId, errorTextId].filter(Boolean).join(' ') || undefined;

  const iconContent = icon || <MagnifyingGlassIcon className={sizeIconClasses[size]} aria-hidden />;

  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[state]}
    ${fullWidth ? 'w-full' : ''}
    ${showIcon && iconPosition === 'left' ? 'pl-11' : ''}
    ${showIcon && iconPosition === 'right' ? 'pr-11' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={searchId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {showIcon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {iconContent}
          </div>
        )}

        <input
          ref={ref}
          id={searchId}
          type="search"
          placeholder={placeholder}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={state === 'error'}
          role="search"
          {...props}
        />

        {showIcon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {iconContent}
          </div>
        )}
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

SearchInput.displayName = 'SearchInput';

export default SearchInput;
