import React from 'react';
import Card, { CardVariant, CardGradient } from './Card';
import Badge from './Badge';

export type ColorTheme = 
  | 'primary' 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'teal' 
  | 'indigo' 
  | 'red' 
  | 'pink'
  | 'emerald'
  | 'cyan'
  | 'yellow'
  | 'rose';

interface DashboardActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorTheme?: ColorTheme;
  variant?: CardVariant;
  gradient?: CardGradient;
  statusBadge?: string;
  offlineBadge?: string;
  isOnline?: boolean;
  isExtraRole?: boolean;
  extraRoleBadge?: string;
  disabled?: boolean;
  /** Reason shown in tooltip when card is disabled */
  disabledReason?: string;
  layout?: 'vertical' | 'horizontal';
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const colorThemeClasses: Record<ColorTheme, { icon: string; badge: string; badgeOffline: string }> = {
  primary: {
    icon: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    badge: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  blue: {
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  green: {
    icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  purple: {
    icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  orange: {
    icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  teal: {
    icon: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  indigo: {
    icon: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  red: {
    icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  pink: {
    icon: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  emerald: {
    icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  cyan: {
    icon: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  yellow: {
    icon: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  },
  rose: {
    icon: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
    badgeOffline: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  }
};

const DashboardActionCard: React.FC<DashboardActionCardProps> = ({
  icon,
  title,
  description,
  colorTheme = 'primary',
  variant = 'interactive',
  gradient,
  statusBadge,
  offlineBadge,
  isOnline = true,
  isExtraRole = false,
  extraRoleBadge,
  disabled = false,
  disabledReason,
  layout = 'vertical',
  onClick,
  ariaLabel,
  className = '',
  style
}) => {
  const theme = colorThemeClasses[colorTheme];
  const isDisabled = disabled || !isOnline;

  if (layout === 'horizontal') {
    return (
      <Card
        variant={variant}
        gradient={isDisabled ? undefined : gradient}
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel || title}
        className={`${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        style={style}
      >
        <div className="relative group">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.icon}`}>
              {icon}
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {disabled && disabledReason && (
            <span
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 ease-out z-50"
              role="tooltip"
            >
              {disabledReason}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
            </span>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      gradient={isDisabled ? undefined : gradient}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel || title}
      className={`${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      style={style}
    >
      <div className="relative group">
        <div className={`p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ${theme.icon}`}>
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {isExtraRole && extraRoleBadge && (
            <Badge variant="warning" size="sm">
              {extraRoleBadge}
            </Badge>
          )}

          <Badge variant="neutral" size="md" className={isOnline ? theme.badge : theme.badgeOffline}>
            {!isOnline ? (offlineBadge || 'Offline') : (statusBadge || 'Aktif')}
          </Badge>
        </div>
        
        {!isOnline && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Memerlukan koneksi internet
          </p>
        )}

        {disabled && disabledReason && (
          <span
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 ease-out z-50"
            role="tooltip"
          >
            {disabledReason}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
          </span>
        )}
      </div>
    </Card>
  );
};

export default DashboardActionCard;
