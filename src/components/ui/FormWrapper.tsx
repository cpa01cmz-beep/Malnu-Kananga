import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface FormWrapperProps {
  children: React.ReactNode;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  showOverlay?: boolean;
  submitText?: string;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  isSubmitting,
  onSubmit,
  className = '',
  showOverlay = true,
  submitText = 'Memproses...'
}) => {
  return (
    <div className="relative">
      <form onSubmit={onSubmit} className={className}>
        <fieldset disabled={isSubmitting} className="contents">
          {children}
        </fieldset>
      </form>
      
      {isSubmitting && showOverlay && (
        <div 
          className="absolute inset-0 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 flex flex-col items-center gap-3">
            <LoadingSpinner size="md" color="primary" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {submitText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormWrapper;
