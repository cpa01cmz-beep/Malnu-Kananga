import React, { forwardRef, useRef } from 'react';

export type FileInputSize = 'sm' | 'md' | 'lg';
export type FileInputState = 'default' | 'error' | 'success';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: FileInputSize;
  state?: FileInputState;
  fullWidth?: boolean;
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white dark:bg-neutral-700 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:cursor-pointer file:transition-all file:duration-200 file:ease-out file:hover:scale-[1.02] file:active:scale-95 file:focus:outline-none file:focus:ring-2 file:focus:ring-offset-2";

const sizeClasses: Record<FileInputSize, string> = {
  sm: "px-3 py-2 text-sm file:text-xs",
  md: "px-4 py-3 text-sm sm:text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const sizeFileClasses: Record<FileInputSize, string> = {
  sm: "file:py-1.5 file:px-3 file:text-xs",
  md: "file:py-2 file:px-4 file:text-sm",
  lg: "file:py-2.5 file:px-5 file:text-base",
};

const stateClasses: Record<FileInputState, { container: string; file: string }> = {
  default: {
    container: "border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-primary-500/50 focus:border-primary-500",
    file: "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900/70 focus:file:ring-blue-500/50 focus:file:ring-offset-2 dark:focus:file:ring-offset-neutral-800",
  },
  error: {
    container: "border-red-300 dark:border-red-700 text-neutral-900 dark:text-white hover:border-red-400 dark:hover:border-red-600 focus:ring-red-500/50 focus:border-red-500",
    file: "file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900/50 dark:file:text-red-300 dark:hover:file:bg-red-900/70 focus:file:ring-red-500/50 focus:file:ring-offset-2 dark:focus:file:ring-offset-neutral-800",
  },
  success: {
    container: "border-green-300 dark:border-green-700 text-neutral-900 dark:text-white hover:border-green-400 dark:hover:border-green-600 focus:ring-green-500/50 focus:border-green-500",
    file: "file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/50 dark:file:text-green-300 dark:hover:file:bg-green-900/70 focus:file:ring-green-500/50 focus:file:ring-offset-2 dark:focus:file:ring-offset-neutral-800",
  },
};

const labelSizeClasses: Record<FileInputSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<FileInputSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(({
  id,
  label,
  helperText,
  errorText,
  size = 'md',
  state = errorText ? 'error' : 'default',
  fullWidth = false,
  className = '',
  value,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const fileInputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
  
  const inputId = id || `fileinput-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  const errorTextId = errorText ? `${inputId}-error` : undefined;
  const describedBy = [helperTextId, errorTextId].filter(Boolean).join(' ') || undefined;

  const stateStyle = stateClasses[state];
  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${sizeFileClasses[size]}
    ${stateStyle.container}
    ${stateStyle.file}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        className={inputClasses}
        aria-describedby={describedBy}
        aria-invalid={state === 'error'}
        value={value || undefined}
        {...props}
      />

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

FileInput.displayName = 'FileInput';

export default FileInput;
