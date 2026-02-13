import React, { useEffect, useRef } from 'react';
import Button from './Button';
import { TIME_MS } from '../../constants';

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
  className?: string;
  overlayClassName?: string;
}

const BaseModal: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  showHeader = true,
  showFooter = false,
  footer,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  loading = false,
  disabled = false,
  variant = 'default',
  className = '',
  overlayClassName = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the confirm button or first focusable element when modal opens
      setTimeout(() => {
        if (confirmButtonRef.current) {
          confirmButtonRef.current.focus();
        } else {
          const firstFocusable = modalRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          firstFocusable?.focus();
        }
      }, TIME_MS.MODERATE);
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm && !loading && !disabled) {
      await onConfirm();
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
        };
      case 'success':
        return {
          confirmButton: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
        };
      default:
        return {
          confirmButton: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
        };
    }
  };

  const variantClasses = getVariantClasses();

  const sizeClasses = {
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-xl w-full',
    full: 'w-full h-full m-0 rounded-none',
  };

  if (!isOpen) return null;

  const defaultFooter = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      {onConfirm && (
        <Button
          variant="primary"
          onClick={handleConfirm}
          isLoading={loading}
          disabled={disabled}
          
          className={variantClasses.confirmButton}
        >
          {loading ? 'Please wait...' : confirmText}
        </Button>
      )}
    </div>
  );

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${overlayClassName}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-neutral-800 rounded-xl shadow-float border border-neutral-200 dark:border-neutral-700 ${sizeClasses[size]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {(showHeader && (title || showCloseButton)) && (
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
                disabled={loading}
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50% disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
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
        
        {showFooter && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            {footer || defaultFooter}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;