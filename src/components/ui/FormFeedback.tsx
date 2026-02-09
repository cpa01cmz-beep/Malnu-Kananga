import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '../icons/MaterialIcons';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FormFeedbackProps {
  type: FeedbackType;
  title?: string;
  message: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  animate?: boolean;
}

const feedbackConfig = {
  success: {
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    borderClass: 'border-green-200 dark:border-green-800',
    textClass: 'text-green-800 dark:text-green-200',
    icon: CheckCircleIcon,
    iconClass: 'text-green-600 dark:text-green-400',
    ariaLive: 'polite' as const,
  },
  error: {
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderClass: 'border-red-200 dark:border-red-800',
    textClass: 'text-red-800 dark:text-red-200',
    icon: XCircleIcon,
    iconClass: 'text-red-600 dark:text-red-400',
    ariaLive: 'assertive' as const,
  },
  warning: {
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    textClass: 'text-yellow-800 dark:text-yellow-200',
    icon: ExclamationCircleIcon,
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    ariaLive: 'polite' as const,
  },
  info: {
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-800 dark:text-blue-200',
    icon: InformationCircleIcon,
    iconClass: 'text-blue-600 dark:text-blue-400',
    ariaLive: 'polite' as const,
  },
};

const FormFeedback: React.FC<FormFeedbackProps> = ({
  type,
  title,
  message,
  className = '',
  dismissible = false,
  onDismiss,
  actions,
  icon,
  animate = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  
  const config = feedbackConfig[type];
  const IconComponent = icon || config.icon;

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animate]);

  const handleDismiss = () => {
    if (dismissible) {
      setIsDismissing(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 200);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        relative p-4 rounded-xl border transition-all duration-200 ease-out
        ${config.bgClass} ${config.borderClass} ${config.textClass}
        ${isVisible && !isDismissing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${animate ? 'animate-fade-in-up' : ''}
        ${className}
      `}
      role="alert"
      aria-live={config.ariaLive}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {React.isValidElement(IconComponent) ? (
            IconComponent
          ) : typeof IconComponent === 'function' ? (
            <IconComponent 
              className={`w-5 h-5 ${config.iconClass}`}
              aria-hidden="true"
            />
          ) : (
            <span className={`w-5 h-5 ${config.iconClass} flex items-center justify-center`} aria-hidden="true">
              {IconComponent}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm leading-relaxed">
            {message}
          </p>
          
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={`
              flex-shrink-0 p-1 rounded-full transition-colors duration-150
              ${config.iconClass} hover:bg-black/5 dark:hover:bg-white/5
              focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2
              dark:focus:ring-offset-neutral-900
            `}
            aria-label="Tutup notifikasi"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar for auto-dismiss (optional enhancement) */}
      {/* Could add a timer-based progress bar here if needed */}
    </div>
  );
};

export default FormFeedback;