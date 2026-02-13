/**
 * Bottom Sheet Component
 * Mobile-first bottom sheet pattern with gesture support
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { useSwipeGestures } from '../../utils/gestures';

export type BottomSheetSize = 'auto' | 'compact' | 'medium' | 'large' | 'full';
export type BottomSheetPosition = 'bottom' | 'center' | 'top';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: BottomSheetSize;
  position?: BottomSheetPosition;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  enableSwipeToClose?: boolean;
  enableDragToResize?: boolean;
  maxHeight?: string;
  minHeight?: string;
  className?: string;
  backdropClassName?: string;
  sheetClassName?: string;
  onOpen?: () => void;
  onBeforeClose?: () => void;
  onAfterClose?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  size = 'auto',
  position = 'bottom',
  title,
  subtitle,
  showHeader = true,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  enableSwipeToClose = true,
  enableDragToResize = false,
  maxHeight,
  minHeight,
  className = '',
  backdropClassName = '',
  sheetClassName = '',
  onOpen,
  onBeforeClose,
  onAfterClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  const prefersReducedMotion = useReducedMotion();
  const { onTap, onPress } = useHapticFeedback();
  
  const isMobile = window.innerWidth <= 768;
  const shouldEnableGestures = isMobile && (enableSwipeToClose || enableDragToResize);

  // Size configurations
  const getSizeClasses = () => {
    const baseClasses = 'fixed inset-x-0 bg-white dark:bg-neutral-800 shadow-2xl border-t border-neutral-200 dark:border-neutral-700';
    
    switch (size) {
      case 'compact':
        return `${baseClasses} bottom-0 max-h-48 rounded-t-2xl`;
      case 'medium':
        return `${baseClasses} bottom-0 max-h-96 rounded-t-2xl`;
      case 'large':
        return `${baseClasses} bottom-0 max-h-[75vh] rounded-t-2xl`;
      case 'full':
        return `${baseClasses} bottom-0 inset-y-0 rounded-none`;
      case 'auto':
      default:
        return `${baseClasses} bottom-0 max-h-[90vh] rounded-t-2xl`;
    }
  };

  // Position configurations
  const getPositionClasses = () => {
    switch (position) {
      case 'center':
        return 'top-1/2 -translate-y-1/2 max-w-lg mx-auto rounded-2xl';
      case 'top':
        return 'top-0 max-h-[50vh] rounded-b-2xl';
      case 'bottom':
      default:
        return 'bottom-0';
    }
  };

  // Swipe gesture handling
  const swipeConfig = shouldEnableGestures ? {
    threshold: 50,
    onSwipeDown: enableSwipeToClose ? () => {
      onPress();
      handleClose();
    } : undefined,
  } : {};

  const { touchProps: swipeProps } = useSwipeGestures(swipeConfig);

  // Drag handling for resizing
  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!enableDragToResize) return;
    
    setIsDragging(true);
    onPress();
    
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startHeight = sheetRef.current?.offsetHeight || 0;
    
    const handleDragMove = (moveEvent: TouchEvent | MouseEvent) => {
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const deltaY = startY - currentY;
      const newHeight = Math.max(200, Math.min(window.innerHeight * 0.9, startHeight + deltaY));
      setDragOffset(deltaY);
      setSheetHeight(newHeight);
    };
    
    const handleDragEnd = () => {
      setIsDragging(false);
      setDragOffset(0);
      
      // Remove event listeners
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    // Add event listeners
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('mouseup', handleDragEnd);
  }, [enableDragToResize, onPress]);

  // Close handling
  const handleClose = useCallback(() => {
    onBeforeClose?.();
    setIsAnimating(true);
    
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
      onAfterClose?.();
    }, prefersReducedMotion ? 0 : 300);
  }, [onClose, onBeforeClose, onAfterClose, prefersReducedMotion]);

  // Backdrop click handling
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current && closeOnBackdropClick) {
      onTap();
      handleClose();
    }
  }, [closeOnBackdropClick, handleClose, onTap]);

  // Escape key handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onTap();
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, handleClose, onTap]);

  // Open/Close animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      onOpen?.();
      onTap();
      
      // Auto-focus management
      setTimeout(() => {
        if (sheetRef.current) {
          sheetRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, onOpen, onTap]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sheetClasses = `
    ${getSizeClasses()}
    ${getPositionClasses()}
    ${shouldEnableGestures ? 'touch-pan-y' : ''}
    ${isAnimating ? (prefersReducedMotion ? 'opacity-100' : 'transition-all duration-300 ease-out') : ''}
    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
    ${sheetClassName}
  `;

  const backdropClasses = `
    fixed inset-0 bg-black/50 backdrop-blur-sm z-40
    ${isAnimating ? (prefersReducedMotion ? 'opacity-100' : 'transition-opacity duration-300 ease-out') : ''}
    ${isOpen ? 'opacity-100' : 'opacity-0'}
    ${backdropClassName}
  `;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={backdropClasses}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={sheetClasses}
        style={{
          maxHeight: maxHeight || undefined,
          minHeight: minHeight || undefined,
          height: enableDragToResize && sheetHeight > 0 ? `${sheetHeight}px` : undefined,
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        aria-describedby={subtitle ? 'bottom-sheet-subtitle' : undefined}
        onTouchStart={shouldEnableGestures ? (e: React.TouchEvent) => swipeProps.onTouchStart?.(e.nativeEvent) : undefined}
        onTouchMove={shouldEnableGestures ? (e: React.TouchEvent) => swipeProps.onTouchMove?.(e.nativeEvent) : undefined}
        onTouchEnd={shouldEnableGestures ? (e: React.TouchEvent) => swipeProps.onTouchEnd?.(e.nativeEvent) : undefined}
      >
        {/* Drag Handle */}
        {shouldEnableGestures && (
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            aria-hidden="true"
          >
            <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
          </div>
        )}
        
        {/* Header */}
        {showHeader && (
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 id="bottom-sheet-title" className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p id="bottom-sheet-subtitle" className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="ml-4 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                  aria-label="Tutup"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ maxHeight: 'calc(100vh - var(--spacing-12, 3rem))' }}
        >
          <div className={className}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Preset bottom sheet configurations
// eslint-disable-next-line react-refresh/only-export-components
export const BottomSheetPresets = {
  // Action sheets
  actionSheet: {
    size: 'compact' as BottomSheetSize,
    showHeader: false,
    enableSwipeToClose: true,
  },
  
  // Share sheets
  shareSheet: {
    size: 'medium' as BottomSheetSize,
    showHeader: true,
    title: 'Bagikan',
    enableSwipeToClose: true,
  },
  
  // Form sheets
  formSheet: {
    size: 'large' as BottomSheetSize,
    showHeader: true,
    enableSwipeToClose: false,
    enableDragToResize: true,
  },
  
  // Modal sheets
  modalSheet: {
    size: 'auto' as BottomSheetSize,
    position: 'center' as BottomSheetPosition,
    showHeader: true,
    enableSwipeToClose: false,
  },
  
  // Full screen sheets
  fullScreenSheet: {
    size: 'full' as BottomSheetSize,
    showHeader: true,
    enableSwipeToClose: false,
  },
};

// Hook for bottom sheet management
// eslint-disable-next-line react-refresh/only-export-components
export const useBottomSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<BottomSheetProps>>({});

  const open = useCallback((newConfig: Partial<BottomSheetProps> = {}) => {
    setConfig(newConfig);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    config,
    open,
    close,
  };
};

export default BottomSheet;