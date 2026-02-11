import React, { useRef, useEffect } from 'react';
import { UI_STRINGS } from '../../constants';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href, 
  children, 
  className = '' 
}) => (
  <a
    href={href}
    className={`
      fixed top-0 left-0 -translate-y-full focus:translate-y-0
      bg-primary-600 text-white px-4 py-2 z-50
      transition-transform duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-primary-500/50
      rounded-b-md
      ${className}
    `}
  >
    {children}
  </a>
);

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  isActive, 
  onEscape 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as unknown as HTMLElement[];

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive, onEscape]);

  return <div ref={containerRef}>{children}</div>;
};

interface A11yButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
}

export const A11yButton: React.FC<A11yButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = UI_STRINGS.LOADING,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-500 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-800'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth={4}
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

interface A11yCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const A11yCheckbox: React.FC<A11yCheckboxProps> = ({
  label,
  description,
  error,
  className = '',
  ...props
}) => {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start">
        <input
          type="checkbox"
          id={id}
          className={`
            mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 
            focus:ring-primary-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
          aria-describedby={description ? descriptionId : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-errormessage={error ? errorId : undefined}
          {...props}
        />
        <div className="ml-3">
          <label 
            htmlFor={id} 
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p id={descriptionId} className="text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface A11yTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const A11yTextField: React.FC<A11yTextFieldProps> = ({
  label,
  description,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      {description && (
        <p id={descriptionId} className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      <input
        id={id}
        className={`
          w-full rounded-lg border-neutral-300 shadow-sm
          focus:border-primary-500 focus:ring-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
        aria-describedby={description ? descriptionId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-errormessage={error ? errorId : undefined}
        aria-required={required}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface AnnouncementProps {
  message: string;
  type?: 'polite' | 'assertive';
  className?: string;
}

export const Announcement: React.FC<AnnouncementProps> = ({
  message,
  type = 'polite',
  className = ''
}) => (
  <div
    aria-live={type}
    aria-atomic="true"
    className={`sr-only ${className}`}
  >
    {message}
  </div>
);

interface VisuallyHiddenProps {
  children: React.ReactNode;
  focusable?: boolean;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ 
  children, 
  focusable = false 
}) => (
  <span
    className={`
      sr-only
      ${focusable ? 'focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-primary-500' : ''}
    `}
  >
    {children}
  </span>
);