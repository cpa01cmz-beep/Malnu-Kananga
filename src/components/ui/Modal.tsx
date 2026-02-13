import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { UI_GESTURES, UI_DELAYS, VIBRATION_PATTERNS } from '../../constants';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'bottom-sheet';
export type ModalAnimation = 'fade-in' | 'fade-in-up' | 'scale-in' | 'slide-up';
export type ModalPosition = 'center' | 'bottom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  size?: ModalSize;
  animation?: ModalAnimation;
  position?: ModalPosition;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  swipeToClose?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm w-full',
  md: 'max-w-md w-full',
  lg: 'max-w-lg w-full',
  xl: 'max-w-xl w-full',
  full: 'w-full h-full m-0 rounded-none',
  'bottom-sheet': 'w-full max-w-full mx-4 rounded-t-2xl',
};

const animationClasses: Record<ModalAnimation, string> = {
  'fade-in': 'animate-fade-in',
  'fade-in-up': 'animate-fade-in-up',
  'scale-in': 'animate-scale-in',
  'slide-up': 'animate-slide-up',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  ariaLabelledBy,
  ariaDescribedBy,
  size = 'md',
  animation = 'scale-in',
  position = 'center',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  swipeToClose = false,
  className = '',
}) => {
  const modalRef = useFocusTrap({ isOpen, onClose: closeOnEscape ? onClose : undefined });
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const [showEscapeHint, setShowEscapeHint] = useState(false);
  const escapeHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile swipe detection
  const minSwipeDistance = UI_GESTURES.MIN_SWIPE_DISTANCE;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isDownSwipe = touchEnd > touchStart;

    if (isDownSwipe && distance < -minSwipeDistance && swipeToClose) {
      onClose();
      // Haptic feedback on swipe close
      if ('vibrate' in navigator) {
        navigator.vibrate(VIBRATION_PATTERNS.SWIPE_CLOSE);
      }
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (closeOnEscape) {
      escapeHintTimeoutRef.current = setTimeout(() => {
        setShowEscapeHint(true);
      }, UI_DELAYS.ESCAPE_HINT_DELAY);
    }
  }, [closeOnEscape]);

  const handleMouseLeave = useCallback(() => {
    setShowEscapeHint(false);
    if (escapeHintTimeoutRef.current) {
      clearTimeout(escapeHintTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (escapeHintTimeoutRef.current) {
        clearTimeout(escapeHintTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Determine container classes based on position
  const getContainerClasses = () => {
    if (position === 'bottom' || size === 'bottom-sheet') {
      return 'fixed inset-0 bg-black/60 backdrop-blur-md flex items-end justify-center z-50 transition-all duration-300';
    }
    return 'fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300';
  };

  // Determine modal classes
  const getModalClasses = () => {
    const baseClasses = 'bg-white/95 dark:bg-neutral-800/95 shadow-2xl border border-neutral-200/60 dark:border-neutral-700/60 backdrop-blur-md';
    
    if (size === 'bottom-sheet') {
      return `${baseClasses} ${sizeClasses[size]} ${animationClasses[animation]} ${className} max-h-[80vh] overflow-y-auto`;
    }
    
    return `${baseClasses} ${sizeClasses[size]} ${animationClasses[animation]} ${className} rounded-xl`;
  };

  return (
    <div
      className={getContainerClasses()}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={getModalClasses()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || (title ? 'modal-title' : undefined)}
        aria-describedby={ariaDescribedBy || (description ? 'modal-description' : undefined)}
        onTouchStart={swipeToClose ? onTouchStart : undefined}
        onTouchMove={swipeToClose ? onTouchMove : undefined}
        onTouchEnd={swipeToClose ? onTouchEnd : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Bottom sheet drag indicator */}
        {size === 'bottom-sheet' && (
          <div className="flex justify-center py-3 touch-manipulation">
            <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
          </div>
        )}
        
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between ${size === 'bottom-sheet' ? 'px-6 pb-4' : 'p-6'} border-b border-neutral-200/60 dark:border-neutral-700/60`}>
            {title && (
              <h2 id="modal-title" className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if ('vibrate' in navigator) {
                      navigator.vibrate(10);
                    }
                  }}
                  className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-700/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50% hover:scale-105 touch-manipulation min-w-[44px] min-h-[44px]"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {closeOnEscape && (
                  <div
                    className={`
                      absolute -top-10 left-1/2 -translate-x-1/2
                      px-3 py-1.5
                      bg-neutral-800 dark:bg-neutral-700
                      text-white text-xs font-medium
                      rounded-lg shadow-lg
                      whitespace-nowrap
                      transition-all duration-200 ease-out
                      pointer-events-none z-50
                      ${showEscapeHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    `}
                    role="tooltip"
                    aria-hidden={!showEscapeHint}
                  >
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 bg-neutral-600 dark:bg-neutral-600 rounded text-[10px] font-bold border border-neutral-500">ESC</kbd>
                      <span>untuk menutup</span>
                    </span>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {description && (
          <p id="modal-description" className="sr-only">
            {description}
          </p>
        )}
        <div className={size === 'bottom-sheet' ? 'px-6 pb-6' : 'p-6'}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
