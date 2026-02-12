import React, { useState } from 'react';
import { TrendingUpIcon, TrendingDownIcon, TrendingFlatIcon } from '../icons/MaterialIcons';
import ProgressRing from './ProgressRing';
import BarChart from './BarChart';
import AnimatedCounter from './AnimatedCounter';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  chart?: {
    type: 'progress' | 'bar' | 'sparkline';
    data?: Record<string, unknown>[];
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  };
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'gradient' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const iconSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const valueSizeClasses = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  chart,
  loading = false,
  className = '',
  variant = 'default',
  size = 'md',
  tooltip,
}) => {
  const [_isHovered, _setIsHovered] = useState(false);

  const getCardClasses = () => {
    const baseClasses = 'bg-white dark:bg-neutral-800 rounded-xl border transition-all duration-300';
    
    if (variant === 'gradient') {
      return `${baseClasses} border-transparent bg-gradient-to-br from-primary-500/5 to-emerald-500/5 hover:shadow-card-hover hover:-translate-y-1`;
    }
    
    if (variant === 'elevated') {
      return `${baseClasses} border-neutral-200 dark:border-neutral-700 shadow-card hover:shadow-card-hover hover:-translate-y-1`;
    }
    
    return `${baseClasses} border-neutral-200 dark:border-neutral-700 hover:shadow-float hover:-translate-y-0.5`;
  };

  if (loading) {
    return (
      <div className={`${getCardClasses()} ${sizeClasses[size]} ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`${iconSizeClasses[size]} bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse`} />
          <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
        <div className={`${valueSizeClasses[size]} font-bold text-neutral-900 dark:text-white mb-2 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-32`} />
        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    );
  }

  const renderChangeIndicator = () => {
    if (!change) return null;

    const getIcon = () => {
      switch (change.type) {
        case 'increase':
          return <TrendingUpIcon className="w-4 h-4" />;
        case 'decrease':
          return <TrendingDownIcon className="w-4 h-4" />;
        default:
          return <TrendingFlatIcon className="w-4 h-4" />;
      }
    };

    const getTextColor = () => {
      switch (change.type) {
        case 'increase':
          return 'text-green-600 dark:text-green-400';
        case 'decrease':
          return 'text-red-600 dark:text-red-400';
        default:
          return 'text-neutral-600 dark:text-neutral-400';
      }
    };

    return (
      <div className={`flex items-center gap-1 text-sm font-medium ${getTextColor()}`}>
        {getIcon()}
        <span>{Math.abs(change.value)}%</span>
        {change.period && (
          <span className="text-neutral-500 dark:text-neutral-400 text-xs">
            {change.period}
          </span>
        )}
      </div>
    );
  };

  const renderChart = () => {
    if (!chart) return null;

    switch (chart.type) {
      case 'progress':
        return (
          <div className="flex justify-center">
            <ProgressRing
              progress={75}
              size={size === 'sm' ? 60 : size === 'md' ? 80 : 100}
              strokeWidth={size === 'sm' ? 4 : size === 'md' ? 6 : 8}
              color={chart.color || 'primary'}
              showPercentage={false}
              animated
            />
          </div>
        );
      
      case 'bar':
        return (
          <div className="mt-4">
            <BarChart
              data={[
                { label: 'Jan', value: 30 },
                { label: 'Feb', value: 45 },
                { label: 'Mar', value: 60 },
                { label: 'Apr', value: 35 },
              ]}
              height={60}
              showValues={false}
              colorScheme={chart.color || 'primary'}
              animated
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      className={`${getCardClasses()} ${sizeClasses[size]} ${className} relative`}
      onMouseEnter={() => _setIsHovered(true)}
      onMouseLeave={() => _setIsHovered(false)}
      aria-describedby={tooltip ? `tooltip-${title}` : undefined}
    >
      {tooltip && _isHovered && (
        <div
          id={`tooltip-${title}`}
          className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-50 px-3 py-2 bg-neutral-800 dark:bg-neutral-700 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
          role="tooltip"
        >
          {tooltip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" />
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconSizeClasses[size]} p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400`}>
          {icon}
        </div>
        {change && renderChangeIndicator()}
      </div>

      <div className={`${valueSizeClasses[size]} font-bold text-neutral-900 dark:text-white mb-2`}>
        {typeof value === 'number' ? (
          <AnimatedCounter value={value} className={valueSizeClasses[size]} />
        ) : (
          value
        )}
      </div>

      <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        {title}
      </div>

      {chart && renderChart()}
    </div>
  );
};

export default StatsCard;