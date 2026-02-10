import React from 'react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'warning',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      confirmVariant: 'red-solid' as const,
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-900/20'
    },
    warning: {
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      confirmVariant: 'orange-solid' as const,
      border: 'border-amber-200 dark:border-amber-800',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    info: {
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      confirmVariant: 'blue-solid' as const,
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    }
  };

  const styles = typeStyles[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title=""
      ariaLabelledBy="dialog-title"
      ariaDescribedBy="dialog-description"
      size="md"
      animation="scale-in"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      showCloseButton={false}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 ${styles.bg} shadow-sm`} role="img" aria-hidden="true">
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 id="dialog-title" className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            {title}
          </h3>
          <p id="dialog-description" className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
            {message}
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6">
         <Button
          onClick={onCancel}
          disabled={isLoading}
          ariaLabel={cancelText}
          variant="secondary"
          size="md"
        >
          {cancelText}
        </Button>
         <Button
          onClick={onConfirm}
          disabled={isLoading}
          ariaLabel={confirmText}
          variant={styles.confirmVariant}
          size="md"
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;