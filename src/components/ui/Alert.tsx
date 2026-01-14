import IconButton from './IconButton';
import InformationCircleIcon from '../icons/InformationCircleIcon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type AlertSize = 'sm' | 'md' | 'lg';
export type AlertBorder = 'left' | 'full' | 'none';

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  size?: AlertSize;
  border?: AlertBorder;
  title?: string;
  icon?: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  fullWidth?: boolean;
  centered?: boolean;
  className?: string;
}

const baseClasses = "transition-all duration-200 ease-out";

const variantClasses: Record<AlertVariant, { bg: string; border: string; title: string; text: string; iconBg: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    title: 'text-green-900 dark:text-green-100',
    text: 'text-green-700 dark:text-green-300',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    title: 'text-yellow-900 dark:text-yellow-100',
    text: 'text-yellow-700 dark:text-yellow-300',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    title: 'text-red-900 dark:text-red-100',
    text: 'text-red-700 dark:text-red-300',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
  },
  neutral: {
    bg: 'bg-neutral-50 dark:bg-neutral-900/50',
    border: 'border-neutral-200 dark:border-neutral-700',
    title: 'text-neutral-900 dark:text-neutral-100',
    text: 'text-neutral-700 dark:text-neutral-300',
    iconBg: 'bg-neutral-100 dark:bg-neutral-700',
  },
};

const sizeClasses: Record<AlertSize, { padding: string; textSize: string; iconSize: string; titleSize: string }> = {
  sm: {
    padding: 'p-3',
    textSize: 'text-xs',
    iconSize: 'w-5 h-5',
    titleSize: 'text-sm',
  },
  md: {
    padding: 'p-4',
    textSize: 'text-sm',
    iconSize: 'w-6 h-6',
    titleSize: 'text-base',
  },
  lg: {
    padding: 'p-6',
    textSize: 'text-base',
    iconSize: 'w-8 h-8',
    titleSize: 'text-lg',
  },
};

const borderClasses: Record<AlertBorder, Record<AlertVariant, string>> = {
  left: {
    info: 'border-l-4 border-l-blue-500',
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500',
    error: 'border-l-4 border-l-red-500',
    neutral: 'border-l-4 border-l-neutral-500',
  },
  full: {
    info: 'border border-blue-200 dark:border-blue-800',
    success: 'border border-green-200 dark:border-green-800',
    warning: 'border border-yellow-200 dark:border-yellow-800',
    error: 'border border-red-200 dark:border-red-800',
    neutral: 'border border-neutral-200 dark:border-neutral-700',
  },
  none: {
    info: '',
    success: '',
    warning: '',
    error: '',
    neutral: '',
  },
};

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: <InformationCircleIcon />,
  success: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  neutral: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  size = 'md',
  border = 'full',
  title,
  icon,
  showCloseButton = false,
  onClose,
  fullWidth = true,
  centered = false,
  className = '',
}) => {
  const variantStyle = variantClasses[variant];
  const sizeStyle = sizeClasses[size];
  const borderStyle = borderClasses[border][variant];

  const alertClasses = `
    ${baseClasses}
    ${variantStyle.bg}
    ${borderStyle}
    ${fullWidth ? 'w-full' : ''}
    ${sizeStyle.padding}
    rounded-xl
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const contentClasses = `
    ${sizeStyle.textSize}
    ${variantStyle.text}
    ${centered ? 'text-center' : ''}
  `.replace(/\s+/g, ' ').trim();

  const iconToRender = icon || defaultIcons[variant];

  return (
    <div
      className={alertClasses}
      role="alert"
      aria-live="polite"
      aria-labelledby={title ? 'alert-title' : undefined}
    >
      <div className={`flex ${centered ? 'justify-center' : 'items-start gap-3'}`}>
        {iconToRender && (
          <div
            className={`${variantStyle.iconBg} ${sizeStyle.iconSize} rounded-lg flex items-center justify-center flex-shrink-0`}
            aria-hidden="true"
          >
            {iconToRender}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3
              id="alert-title"
              className={`${sizeStyle.titleSize} ${variantStyle.title} font-semibold mb-1.5`}
            >
              {title}
            </h3>
          )}
          <div className={contentClasses}>
            {typeof children === 'string' ? <p>{children}</p> : children}
          </div>
        </div>
        {showCloseButton && onClose && (
          <IconButton
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            ariaLabel="Close alert"
            size="sm"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default Alert;
