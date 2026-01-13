import React from 'react';
import BackButton from './BackButton';

export type PageHeaderSize = 'sm' | 'md' | 'lg';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonVariant?: 'primary' | 'green' | 'custom';
  onBackButtonClick?: () => void;
  actions?: React.ReactNode;
  size?: PageHeaderSize;
  className?: string;
}

const sizeClasses: Record<PageHeaderSize, { title: string; subtitle: string }> = {
  sm: {
    title: 'text-xl font-bold',
    subtitle: 'text-sm',
  },
  md: {
    title: 'text-2xl sm:text-xl font-bold',
    subtitle: 'text-sm',
  },
  lg: {
    title: 'text-3xl sm:text-2xl font-bold',
    subtitle: 'text-base',
  },
};

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonLabel = 'Kembali',
  backButtonVariant = 'primary',
  onBackButtonClick,
  actions,
  size = 'md',
  className = '',
}) => {
  const headerClasses = sizeClasses[size];

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="w-full md:w-auto">
        {showBackButton && onBackButtonClick && (
          <div className="mb-2">
            <BackButton
              label={backButtonLabel}
              onClick={onBackButtonClick}
              variant={backButtonVariant}
            />
          </div>
        )}
        <h2 className={`${headerClasses.title} text-neutral-900 dark:text-white`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`${headerClasses.subtitle} text-neutral-500 dark:text-neutral-400`}>
            {subtitle}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex-shrink-0 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
