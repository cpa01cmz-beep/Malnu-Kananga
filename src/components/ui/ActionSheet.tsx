import React, { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const _TouchEvent: any;
import { XMarkIcon } from '../icons/MaterialIcons';

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'primary';
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  className?: string;
  height?: 'auto' | 'half' | 'full';
  closeOnOverlayClick?: boolean;
}

const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actions,
  className = '',
  height = 'auto',
  closeOnOverlayClick = true,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      const firstFocusable = sheetRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle swipe down to close
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;

    const sheet = sheetRef.current;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStart = (e: any) => {
      startY = e.touches[0].clientY;
      isDragging = true;
      sheet.style.transition = 'none';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMove = (e: any) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        sheet.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      sheet.style.transition = '';
      
      const deltaY = currentY - startY;
      if (deltaY > 100) {
        onClose();
      } else {
        sheet.style.transform = '';
      }
    };

    sheet.addEventListener('touchstart', handleStart);
    sheet.addEventListener('touchmove', handleMove);
    sheet.addEventListener('touchend', handleEnd);

    return () => {
      sheet.removeEventListener('touchstart', handleStart);
      sheet.removeEventListener('touchmove', handleMove);
      sheet.removeEventListener('touchend', handleEnd);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && closeOnOverlayClick) {
      onClose();
    }
  };

  const getActionClasses = (variant: 'default' | 'destructive' | 'primary' = 'default') => {
    const baseClasses = 'w-full px-4 py-4 text-left flex items-center gap-3 transition-colors duration-200 touch-manipulation';
    
    switch (variant) {
      case 'destructive':
        return `${baseClasses} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30`;
      case 'primary':
        return `${baseClasses} text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/30`;
      default:
        return `${baseClasses} text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700`;
    }
  };

  const getHeightClasses = () => {
    switch (height) {
      case 'half':
        return 'h-[50vh] max-h-[50vh]';
      case 'full':
        return 'h-[90vh] max-h-[90vh]';
      default:
        return 'max-h-[80vh]';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        ref={sheetRef}
        className={`w-full bg-white dark:bg-neutral-800 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${getHeightClasses()} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'action-sheet-title' : undefined}
        aria-describedby={description ? 'action-sheet-description' : undefined}
      >
        {/* Handle for visual swipe indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
            {title && (
              <h2 id="action-sheet-title" className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p id="action-sheet-description" className="text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="overflow-y-auto">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick();
                    onClose();
                  }
                }}
                disabled={action.disabled}
                className={`${getActionClasses(action.variant)} ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {action.icon && (
                  <span className="flex-shrink-0 w-5 h-5">
                    {action.icon}
                  </span>
                )}
                <span className="flex-1 text-sm font-medium">
                  {action.label}
                </span>
              </button>
            ))}
          </div>

          {/* Cancel button */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 mt-2">
            <button
              onClick={onClose}
              className="w-full px-4 py-4 text-left text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 touch-manipulation"
            >
              Batal
            </button>
          </div>
        </div>

        {/* Close button for desktop */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors lg:hidden"
          aria-label="Tutup"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ActionSheet;