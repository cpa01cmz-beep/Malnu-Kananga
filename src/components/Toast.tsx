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
  /**
   * Callback when undo action is triggered.
   * When provided, shows an undo button for destructive actions.
   * This provides users a safety net to reverse accidental actions.
   */
  onUndo?: () => void;
  /** Text for the undo button (defaults to "Undo") */
  undoLabel?: string;
  /**
   * Whether this is a destructive action toast.
   * When true and onUndo is provided, the toast will have distinct visual treatment
   * and longer default duration to give users more time to undo.
   */
  isDestructive?: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = TIMEOUT_CONFIG.TOAST_DEFAULT_DURATION,
  onUndo,
  undoLabel = 'Batalkan',
  isDestructive = false,
}) => {
  const effectiveDuration = isDestructive && onUndo
    ? Math.max(duration, 8000)
    : duration;

  const toastRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(effectiveDuration);
  const [progress, setProgress] = useState(100);
  const [showShortcutTooltip, setShowShortcutTooltip] = useState(false);
  const shortcutTooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(100);

  const handleUndo = useCallback(() => {
    onUndo?.();
    onClose();
  }, [onUndo, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && onUndo) {
      e.preventDefault();
      handleUndo();
    }
  }, [onClose, onUndo, handleUndo]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    pausedProgressRef.current = progress;
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    // Show shortcut tooltip after a brief delay to avoid flickering
    shortcutTooltipTimeoutRef.current = setTimeout(() => {
      setShowShortcutTooltip(true);
    }, 400);
  }, [progress]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - ((100 - pausedProgressRef.current) / 100) * duration;
    // Hide shortcut tooltip and clear timeout
    setShowShortcutTooltip(false);
    if (shortcutTooltipTimeoutRef.current) {
      clearTimeout(shortcutTooltipTimeoutRef.current);
    }
  }, [duration]);

  useEffect(() => {
    if (isVisible && !isPaused) {
      const timer = setTimeout(() => {
        onClose();
      }, remainingTime);
      return () => clearTimeout(timer);
    }
  }, [isVisible, remainingTime, isPaused, onClose]);

  // Progress bar animation - use ref to avoid dependency cycle
  useEffect(() => {
    if (isVisible && !isPaused) {
      startTimeRef.current = Date.now() - ((100 - progress) / 100) * effectiveDuration;

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.max(0, 100 - (elapsed / effectiveDuration) * 100);
        setProgress(newProgress);

        if (newProgress > 0) {
          animationFrameRef.current = window.requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = window.requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isPaused, effectiveDuration]);

  useEffect(() => {
    if (isVisible) {
      setRemainingTime(effectiveDuration);
      setIsPaused(false);
      setProgress(100);
      setShowShortcutTooltip(false);
      pausedProgressRef.current = 100;

      previousActiveElementRef.current = document.activeElement as HTMLElement;
      toastRef.current?.focus();
    } else {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    }
  }, [isVisible, effectiveDuration]);

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (shortcutTooltipTimeoutRef.current) {
        clearTimeout(shortcutTooltipTimeoutRef.current);
      }
    };
  }, []);

  const baseClasses = "fixed top-20 right-4 sm:top-6 sm:right-6 z-50 px-5 py-4 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) transform max-w-md border backdrop-blur-xl hover:shadow-2xl glass-effect-elevated hover-lift-premium";
  const typeClasses = {
    success: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-primary-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white feedback-success glass-effect`,
    info: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-blue-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white glass-effect`,
    error: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-red-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white feedback-error glass-effect`,
    warning: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} border-l-4 border-l-amber-500 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white glass-effect`,
  };
  const destructiveClasses = isDestructive && onUndo
    ? 'ring-2 ring-red-500/30 ring-offset-2 dark:ring-offset-neutral-900'
    : '';

  const ariaRole = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  const visibilityClasses = isVisible
    ? "translate-x-0 opacity-100 animate-slide-in-right motion-reduce:animate-none"
    : "translate-x-full opacity-0 pointer-events-none toast-exit motion-reduce:animate-none";

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

  const progressBarColors = {
    success: 'bg-primary-500',
    info: 'bg-blue-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
  };

  return (
    <div
      ref={toastRef}
      tabIndex={-1}
      className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses} ${destructiveClasses}`}
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
      {onUndo && (
        <button
          onClick={handleUndo}
          className="px-3 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/40 hover:bg-primary-200 dark:hover:bg-primary-800/50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          aria-label={`${undoLabel} (Ctrl+Z)`}
        >
          {undoLabel}
        </button>
      )}
      <IconButton
        icon={<CloseIcon />}
        ariaLabel={TOAST_UI_STRINGS.CLOSE}
        size="sm"
        onClick={onClose}
      />
      {/* Progress bar with accessibility */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-b-xl overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={isPaused ? 'Notifikasi dijeda. Gerakkan mouse keluar untuk melanjutkan.' : 'Waktu tersisa sebelum notifikasi tertutup otomatis'}
      >
        <div
          className={`h-full ${progressBarColors[type]} transition-none`}
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>
      {/* Screen reader announcement for remaining time */}
      <span className="sr-only" role="status" aria-live="polite">
        {isVisible && !isPaused && Math.round(progress) > 0 && Math.round(progress) < 100 && `${Math.round(progress)}% waktu tersisa`}
      </span>
      
      {/* Keyboard shortcut tooltip - Micro UX Delight */}
      <div
        className={`
          absolute -top-10 left-1/2 -translate-x-1/2 
          px-3 py-1.5 
          bg-neutral-800 dark:bg-neutral-700 
          text-white text-xs font-medium 
          rounded-lg shadow-lg 
          whitespace-nowrap
          transition-all duration-200 ease-out
          pointer-events-none
          ${showShortcutTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
        role="tooltip"
        aria-hidden={!showShortcutTooltip}
      >
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-neutral-600 dark:bg-neutral-600 rounded text-[10px] font-bold border border-neutral-500">ESC</kbd>
          <span>untuk menutup</span>
        </span>
        {/* Tooltip arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
      </div>
    </div>
  );
};

export default Toast;