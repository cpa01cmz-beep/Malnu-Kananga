import React, { forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import { idGenerators } from '../../utils/idGenerator';
import { UI_DELAYS, TIME_MS } from '../../constants';

export type FileInputSize = 'sm' | 'md' | 'lg';
export type FileInputState = 'default' | 'error' | 'success';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: FileInputSize;
  state?: FileInputState;
  fullWidth?: boolean;
  /** Enable clipboard paste support for files */
  allowPaste?: boolean;
  /** Callback when files are pasted from clipboard */
  // eslint-disable-next-line no-undef
  onFilesPasted?: (files: FileList) => void;
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

/**
 * Get the appropriate keyboard shortcut label based on platform
 */
const getKeyboardShortcutLabel = (): string => {
  if (typeof navigator !== 'undefined' && navigator.platform) {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac') || platform.includes('darwin')) {
      return '⌘+V';
    }
  }
  return 'Ctrl+V';
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
  allowPaste = true,
  onFilesPasted,
  onChange,
  disabled,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const fileInputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);
  
  const inputId = id || idGenerators.input();
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  const errorTextId = errorText ? `${inputId}-error` : undefined;
  const describedBy = [helperTextId, errorTextId].filter(Boolean).join(' ') || undefined;

  // State for paste support and UI feedback
  const [isPasteSupported, setIsPasteSupported] = useState(false);
  const [showPasteHint, setShowPasteHint] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const pasteHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardShortcut = getKeyboardShortcutLabel();

  // Check if clipboard paste is supported
  useEffect(() => {
    const hasClipboardAPI = typeof navigator !== 'undefined' && 'clipboard' in navigator;
    const supportsPasteEvent = 'onpaste' in document;
    setIsPasteSupported(hasClipboardAPI || supportsPasteEvent);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pasteHintTimeoutRef.current) {
        clearTimeout(pasteHintTimeoutRef.current);
      }
    };
  }, []);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), TIME_MS.ONE_SECOND);
  }, []);

  // Handle paste events
  // eslint-disable-next-line no-undef
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled || !allowPaste || !isPasteSupported) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault();

      // Haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }

      // Create FileList-like object
      // eslint-disable-next-line no-undef
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));

      // Trigger onChange with the pasted files
      if (onChange) {
        const syntheticEvent = {
          target: fileInputRef.current,
          currentTarget: fileInputRef.current,
          preventDefault: () => {},
          stopPropagation: () => {},
          nativeEvent: e,
          bubbles: true,
          cancelable: true,
          type: 'change',
          timeStamp: Date.now(),
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        // Set the files on the input element
        if (fileInputRef.current) {
          fileInputRef.current.files = dataTransfer.files;
        }

        onChange(syntheticEvent);
      }

      // Call the onFilesPasted callback
      if (onFilesPasted) {
        onFilesPasted(dataTransfer.files);
      }

      announceToScreenReader(`${files.length} file${files.length > 1 ? 's' : ''} pasted from clipboard`);
    }
  }, [disabled, allowPaste, isPasteSupported, onChange, onFilesPasted, fileInputRef, announceToScreenReader]);

  // Setup paste event listener
  useEffect(() => {
    if (!allowPaste || !isPasteSupported) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('paste', handlePaste, true);

    return () => {
      container.removeEventListener('paste', handlePaste, true);
    };
  }, [allowPaste, isPasteSupported, handlePaste]);

  // Show paste hint on focus
  const handleFocus = () => {
    if (allowPaste && isPasteSupported && !disabled) {
      pasteHintTimeoutRef.current = setTimeout(() => {
        setShowPasteHint(true);
      }, UI_DELAYS.PASTE_HINT_DELAY);
    }
  };

  // Hide paste hint on blur
  const handleBlur = (e: React.FocusEvent) => {
    // Only hide if focus moved outside the container
    // eslint-disable-next-line no-undef
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setShowPasteHint(false);
      if (pasteHintTimeoutRef.current) {
        clearTimeout(pasteHintTimeoutRef.current);
      }
    }
  };

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
    <div 
      ref={containerRef}
      className={`${fullWidth ? 'w-full' : ''} space-y-1.5 relative`}
      onBlur={handleBlur}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-label="wajib diisi">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={state === 'error'}
          aria-label={allowPaste && isPasteSupported ? `${props['aria-label'] || label || 'File input'} (Press ${keyboardShortcut} to paste)` : props['aria-label']}
          value={value || undefined}
          onFocus={handleFocus}
          disabled={disabled}
          onChange={onChange}
          {...props}
        />

        {allowPaste && isPasteSupported && showPasteHint && !disabled && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-10 animate-in fade-in slide-in-from-bottom-1 duration-200"
            role="tooltip"
            aria-hidden="false"
          >
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-neutral-600 dark:bg-neutral-600 rounded text-[10px] font-bold border border-neutral-500">
                {keyboardShortcut}
              </kbd>
              <span>to paste file</span>
            </span>
            <span 
              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" 
              aria-hidden="true" 
            />
          </div>
        )}
      </div>

      {helperText ? (
        <p id={helperTextId} className={`${helperTextSizeClasses[size]} text-neutral-500 dark:text-neutral-400`}>
          {helperText}
          {allowPaste && isPasteSupported && (
            <span className="block text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              You can also paste files ({keyboardShortcut})
            </span>
          )}
        </p>
      ) : (
        allowPaste && isPasteSupported && (
          <p className={`${helperTextSizeClasses[size]} text-neutral-400 dark:text-neutral-500`}>
            Tip: Press {keyboardShortcut} to paste files from clipboard
          </p>
        )
      )}

      {errorText && (
        <p id={errorTextId} className={`${helperTextSizeClasses[size]} text-red-600 dark:text-red-400`} role="alert">
          {errorText}
        </p>
      )}

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
    </div>
  );
});

FileInput.displayName = 'FileInput';

export default FileInput;
