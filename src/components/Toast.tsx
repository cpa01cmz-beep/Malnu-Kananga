import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

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

  const baseClasses = "fixed top-20 right-4 sm:top-6 sm:right-6 z-50 px-5 py-4 rounded-xl shadow-float flex items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform max-w-md border backdrop-blur-xl";
  const typeClasses = {
    success: "bg-white/95 dark:bg-neutral-800/95 border-l-4 border-l-primary-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white",
    info: "bg-white/95 dark:bg-neutral-800/95 border-l-4 border-l-blue-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white",
    error: "bg-white/95 dark:bg-neutral-800/95 border-l-4 border-l-red-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white",
  };

  const visibilityClasses = isVisible
    ? "translate-x-0 opacity-100"
    : "translate-x-full opacity-0 pointer-events-none";

  const icons = {
      success: (
          <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
      ),
      info: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      error: (
        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
        </svg>
      )
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`} role="alert" aria-live="polite">
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <span className="font-medium text-base leading-snug flex-grow">{message}</span>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:scale-110 active:scale-95"
        aria-label="Tutup notifikasi"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default Toast;