import React, { useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const baseClasses = "fixed top-24 right-5 z-50 px-6 py-4 rounded-card-lg shadow-float flex items-center gap-3 transition-all duration-300 transform max-w-md";
  const typeClasses = {
    success: "bg-white dark:bg-neutral-800 border-l-4 border-primary-500 text-neutral-800 dark:text-white",
    info: "bg-white dark:bg-neutral-800 border-l-4 border-blue-500 text-neutral-800 dark:text-white",
    error: "bg-white dark:bg-neutral-800 border-l-4 border-red-500 text-neutral-800 dark:text-white",
  };

  const visibilityClasses = isVisible
    ? "translate-x-0 opacity-100"
    : "translate-x-10 opacity-0 pointer-events-none";

  const icons = {
      success: (
          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
      ),
      info: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      error: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`} role="alert" aria-live="polite">
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <span className="font-medium text-sm md:text-base">{message}</span>
    </div>
  );
};

export default Toast;