import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import IconButton from './ui/IconButton';
import { OPACITY_TOKENS, TIMEOUT_CONFIG, TOAST_UI_STRINGS } from '../constants';

export type ToastType = 'success' | 'info' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose, duration = TIMEOUT_CONFIG.TOAST_DEFAULT_DURATION }) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (isVisible && !isPaused) {
      const timer = setTimeout(() => {
        onClose();
      }, remainingTime);
      return () => clearTimeout(timer);
    }
  }, [isVisible, remainingTime, isPaused, onClose]);

  useEffect(() => {
    if (isVisible) {
      setRemainingTime(duration);
      setIsPaused(false);
      
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      toastRef.current?.focus();
    } else {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    }
  }, [isVisible, duration]);

  const baseClasses = "fixed top-20 right-4 sm:top-6 sm:right-6 z-50 px-5 py-4 rounded-xl shadow-float flex items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform max-w-md border backdrop-blur-xl";
  const typeClasses = {
    success: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-primary-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white`,
    info: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-blue-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white`,
    error: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-red-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white`,
    warning: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-amber-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white`,
  };

  const ariaRole = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

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
      ),
      warning: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
          </svg>
      )
  }

  return (
    <div
      ref={toastRef}
      tabIndex={-1}
      className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}
      role={ariaRole}
      aria-live={ariaLive}
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <span className="font-medium text-base leading-snug flex-grow">{message}</span>
      <IconButton
        icon={<CloseIcon />}
        ariaLabel={TOAST_UI_STRINGS.CLOSE}
        size="sm"
        onClick={onClose}
      />
    </div>
  );
};

export default Toast;