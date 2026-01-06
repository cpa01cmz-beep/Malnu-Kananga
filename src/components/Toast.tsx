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

  const baseClasses = "fixed top-20 right-4 sm:top-6 sm:right-6 z-50 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl shadow-float flex items-center gap-3 transition-all duration-300 transform max-w-md border-2 backdrop-blur-sm";
  const typeClasses = {
    success: "bg-white/98 dark:bg-neutral-800/98 border-primary-500/30 dark:border-primary-500/40 text-neutral-900 dark:text-white",
    info: "bg-white/98 dark:bg-neutral-800/98 border-blue-500/30 dark:border-blue-500/40 text-neutral-900 dark:text-white",
    error: "bg-white/98 dark:bg-neutral-800/98 border-red-500/30 dark:border-red-500/40 text-neutral-900 dark:text-white",
  };

  const visibilityClasses = isVisible
    ? "translate-x-0 opacity-100"
    : "translate-x-full opacity-0 pointer-events-none";

  const icons = {
      success: (
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
      ),
      info: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`} role="alert" aria-live="polite">
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  );
};

export default Toast;