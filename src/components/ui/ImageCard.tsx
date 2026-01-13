import React from 'react';
import Card from './Card';
import ImageWithFallback from '../ImageWithFallback';
import Badge from './Badge';

export type ImageCardVariant = 'hover' | 'default';

export interface ImageCardProps {
  imageUrl: string;
  imageAlt: string;
  title: React.ReactNode;
  variant?: ImageCardVariant;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  badge?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  };
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const ImageCard: React.FC<ImageCardProps> = ({
  imageUrl,
  imageAlt,
  title,
  variant = 'hover',
  className = '',
  padding = 'none',
  badge,
  footer,
  children,
  onClick,
  disabled = false,
  ariaLabel,
}) => {
  const isHoverVariant = variant === 'hover' && !disabled;

  return (
    <Card
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`overflow-hidden flex flex-col h-full group ${className}`}
      padding={padding}
    >
      <div className="relative overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-700">
        <ImageWithFallback
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          src={imageUrl}
          alt={imageAlt}
          fallbackText="Gambar Tidak Tersedia"
        />
        {badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={badge.variant || 'primary'} size="md" className="uppercase tracking-wider backdrop-blur-md shadow-sm">
              {badge.text}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-6 sm:p-7 flex flex-col flex-grow">
        <h3 className={`text-lg sm:text-xl font-semibold mb-4 flex-grow leading-snug ${isHoverVariant ? 'text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400' : 'text-neutral-900 dark:text-white'} transition-colors duration-300 line-clamp-2`}>
          {title}
        </h3>
        {children && (
          <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed flex-grow line-clamp-3">
            {children}
          </div>
        )}
        {footer && (
          <div className="mt-auto">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageCard;
