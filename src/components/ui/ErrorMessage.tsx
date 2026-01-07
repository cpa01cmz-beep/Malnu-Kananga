import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'inline' | 'card';
  icon?: React.ReactNode;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  variant = 'card',
  icon,
  className = ''
}) => {
  const baseClasses = 'text-red-700 dark:text-red-300';
  const cardClasses = variant === 'card' 
    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4' 
    : '';

  return (
    <div className={`${cardClasses} ${baseClasses} ${className}`} role="alert">
      {icon && <div className="flex items-start gap-3">{icon}</div>}
      {title && variant === 'card' && (
        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">{title}</h3>
      )}
      <p className={variant === 'card' ? 'text-sm' : 'text-xs'}>
        {message}
      </p>
    </div>
  );
};

export default ErrorMessage;