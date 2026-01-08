import React, { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalAnimation = 'fade-in' | 'fade-in-up' | 'scale-in';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: ModalSize;
  animation?: ModalAnimation;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm w-full',
  md: 'max-w-md w-full',
  lg: 'max-w-lg w-full',
  xl: 'max-w-xl w-full',
  full: 'w-full h-full m-0 rounded-none',
};

const animationClasses: Record<ModalAnimation, string> = {
  'fade-in': 'animate-fade-in',
  'fade-in-up': 'animate-fade-in-up',
  'scale-in': 'animate-scale-in',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  animation = 'scale-in',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useFocusTrap({ isOpen, onClose: closeOnEscape ? onClose : undefined });

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

  return (
    <div
      className="fixed inset-0 bg-black/50% backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-neutral-800 rounded-xl shadow-float border border-neutral-200 dark:border-neutral-700 ${sizeClasses[size]} ${animationClasses[animation]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            {title && (
              <h2 id="modal-title" className="text-lg font-bold text-neutral-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50%"
                aria-label="Close modal"
                tabIndex={-1}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        {description && (
          <p id="modal-description" className="sr-only">
            {description}
          </p>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
