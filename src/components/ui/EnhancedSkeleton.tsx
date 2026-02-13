/**
 * Enhanced Skeleton Components
 * Advanced loading patterns with sophisticated animations and variants
 */

import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { UI_DIMENSIONS } from '../../constants';
import { SPACING_CONFIG } from '../../config/spacing-system';

export type SkeletonVariant = 
  | 'text' 
  | 'circular' 
  | 'rectangular' 
  | 'card' 
  | 'table' 
  | 'avatar'
  | 'dashboard'
  | 'form'
  | 'list'
  | 'chart'
  | 'calendar'
  | 'notification'
  | 'search-result';

export interface EnhancedSkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
  lines?: number;
  height?: string;
  width?: string;
  animated?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  shimmerColor?: string;
  baseColor?: string;
  darkMode?: boolean;
  children?: React.ReactNode;
}

const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  className = '',
  variant = 'text',
  lines = 3,
  height = '1rem',
  width,
  animated = true,
  speed = 'normal',
  shimmerColor = 'rgba(255, 255, 255, 0.3)',
  baseColor = 'rgba(0, 0, 0, 0.1)',
  darkMode = false,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const getAnimationClass = () => {
    if (!animated || prefersReducedMotion) return '';
    
    switch (speed) {
      case 'slow':
        return 'animate-shimmer-slow';
      case 'fast':
        return 'animate-shimmer-fast';
      default:
        return 'animate-shimmer';
    }
  };

  const getSkeletonStyle = () => {
    const isDark = darkMode;
    const finalShimmerColor = isDark ? 'rgba(255, 255, 255, 0.1)' : shimmerColor;
    const finalBaseColor = isDark ? 'rgba(255, 255, 255, 0.05)' : baseColor;

    return {
      backgroundColor: finalBaseColor,
      backgroundImage: animated && !prefersReducedMotion
        ? `linear-gradient(90deg, transparent, ${finalShimmerColor}, transparent)`
        : 'none',
      backgroundSize: animated && !prefersReducedMotion ? '200% 100%' : 'auto',
    };
  };

  const baseClasses = `relative overflow-hidden ${getAnimationClass()}`;

  const renderTextSkeleton = () => (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} rounded-lg`}
          style={{
            width: width || (i === lines - 1 ? '70%' : `${Math.random() * 30 + 70}%`),
            height: height || '1rem',
            ...getSkeletonStyle(),
          }}
        />
      ))}
    </div>
  );

  const renderCircularSkeleton = () => (
    <div
      className={`${baseClasses} rounded-full ${className}`}
      style={{
        width: width || height,
        height,
        ...getSkeletonStyle(),
      }}
    />
  );

  const renderRectangularSkeleton = () => (
    <div
      className={`${baseClasses} rounded-lg ${className}`}
      style={{
        width: width || '100%',
        height,
        ...getSkeletonStyle(),
      }}
    />
  );

  const renderCardSkeleton = () => (
    <div className={`p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Card header */}
      <div className="flex items-center space-x-4 mb-4">
        <div
          className={`${baseClasses} rounded-full`}
          style={{
            width: UI_DIMENSIONS.SKELETON.AVATAR.width,
            height: UI_DIMENSIONS.SKELETON.AVATAR.height,
            ...getSkeletonStyle(),
          }}
        />
        <div className="flex-1 space-y-2">
          <div
            className={`${baseClasses} rounded-lg h-4`}
            style={{
              width: '60%',
              ...getSkeletonStyle(),
            }}
          />
          <div
            className={`${baseClasses} rounded-lg h-3`}
            style={{
              width: '40%',
              ...getSkeletonStyle(),
            }}
          />
        </div>
      </div>

      {/* Card content */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded-lg h-4`}
            style={{
              width: i === lines - 1 ? '80%' : `${Math.random() * 20 + 80}%`,
              ...getSkeletonStyle(),
            }}
          />
        ))}
      </div>

      {/* Card actions */}
      <div className="flex items-center justify-between mt-6">
        <div
          className={`${baseClasses} rounded-lg h-8`}
          style={{
            width: UI_DIMENSIONS.SKELETON.BUTTON_SMALL.width,
            ...getSkeletonStyle(),
          }}
        />
        <div
          className={`${baseClasses} rounded-lg h-8`}
          style={{
            width: '60px',
            ...getSkeletonStyle(),
          }}
        />
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className={`overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Table header */}
      <div className="bg-neutral-50 dark:bg-neutral-900 px-6 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`header-${i}`}
              className={`${baseClasses} rounded-lg h-4`}
              style={{ ...getSkeletonStyle() }}
            />
          ))}
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {Array.from({ length: lines }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`${baseClasses} rounded-lg h-4`}
                  style={{ ...getSkeletonStyle() }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className={`space-y-6 ${className}`}>
      {/* Stats cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div
              className={`${baseClasses} rounded-lg h-8 mb-2`}
              style={{ width: '60%', ...getSkeletonStyle() }}
            />
            <div
              className={`${baseClasses} rounded-lg h-12 mb-2`}
              style={{ width: '40%', ...getSkeletonStyle() }}
            />
            <div
              className={`${baseClasses} rounded-lg h-4`}
              style={{ width: '80%', ...getSkeletonStyle() }}
            />
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div
            className={`${baseClasses} rounded-lg h-6 mb-4`}
            style={{ width: '40%', ...getSkeletonStyle() }}
          />
          <div
            className={`${baseClasses} rounded-lg h-64`}
            style={{ width: '100%', ...getSkeletonStyle() }}
          />
        </div>
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div
            className={`${baseClasses} rounded-lg h-6 mb-4`}
            style={{ width: '35%', ...getSkeletonStyle() }}
          />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`chart-item-${i}`} className="flex items-center justify-between">
                <div
                  className={`${baseClasses} rounded-lg h-4`}
                  style={{ width: '30%', ...getSkeletonStyle() }}
                />
                <div
                  className={`${baseClasses} rounded-lg h-4`}
                  style={{ width: '20%', ...getSkeletonStyle() }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormSkeleton = () => (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: lines || 5 }).map((_, i) => (
        <div key={`form-field-${i}`} className="space-y-2">
          <div
            className={`${baseClasses} rounded-lg h-4`}
            style={{ width: '25%', ...getSkeletonStyle() }}
          />
          <div
            className={`${baseClasses} rounded-lg h-12`}
            style={{ width: '100%', ...getSkeletonStyle() }}
          />
        </div>
      ))}
      
      {/* Form actions */}
      <div className="flex space-x-4 pt-4">
        <div
          className={`${baseClasses} rounded-lg h-10`}
          style={{ width: `${SPACING_CONFIG.scale[24]}rem`, ...getSkeletonStyle() }}
        />
        <div
          className={`${baseClasses} rounded-lg h-10`}
          style={{ width: `${SPACING_CONFIG.scale[20]}rem`, ...getSkeletonStyle() }}
        />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={`divide-y divide-neutral-200 dark:divide-neutral-700 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={`list-item-${i}`} className="p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <div
              className={`${baseClasses} rounded-full mt-1`}
              style={{ width: `${SPACING_CONFIG.scale[10]}rem`, height: `${SPACING_CONFIG.scale[10]}rem`, ...getSkeletonStyle() }}
            />
            <div className="flex-1 space-y-2">
              <div
                className={`${baseClasses} rounded-lg h-4`}
                style={{ width: '70%', ...getSkeletonStyle() }}
              />
              <div
                className={`${baseClasses} rounded-lg h-3`}
                style={{ width: '90%', ...getSkeletonStyle() }}
              />
              <div
                className={`${baseClasses} rounded-lg h-3`}
                style={{ width: '60%', ...getSkeletonStyle() }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChartSkeleton = () => (
    <div className={`bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div
        className={`${baseClasses} rounded-lg h-6 mb-4`}
        style={{ width: '40%', ...getSkeletonStyle() }}
      />
      <div
        className={`${baseClasses} rounded-lg`}
        style={{ width: '100%', height: height || `${SPACING_CONFIG.scale[32] * 4}rem`, ...getSkeletonStyle() }}
      />
    </div>
  );

  const renderCalendarSkeleton = () => (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div
            className={`${baseClasses} rounded-lg h-6`}
            style={{ width: `${SPACING_CONFIG.scale[32]}rem`, ...getSkeletonStyle() }}
          />
          <div className="flex space-x-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={`cal-btn-${i}`}
                className={`${baseClasses} rounded-lg h-8`}
                style={{ width: `${SPACING_CONFIG.scale[10]}rem`, ...getSkeletonStyle() }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`day-header-${i}`}
              className={`${baseClasses} rounded-lg h-8`}
              style={{ ...getSkeletonStyle() }}
            />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={`day-${i}`}
              className={`${baseClasses} rounded-lg h-8`}
              style={{ ...getSkeletonStyle() }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={`notification-${i}`} className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-start space-x-3">
            <div
              className={`${baseClasses} rounded-full mt-1`}
              style={{ width: `${SPACING_CONFIG.scale[8]}rem`, height: `${SPACING_CONFIG.scale[8]}rem`, ...getSkeletonStyle() }}
            />
            <div className="flex-1 space-y-2">
              <div
                className={`${baseClasses} rounded-lg h-4`}
                style={{ width: '80%', ...getSkeletonStyle() }}
              />
              <div
                className={`${baseClasses} rounded-lg h-3`}
                style={{ width: '100%', ...getSkeletonStyle() }}
              />
              <div
                className={`${baseClasses} rounded-lg h-3`}
                style={{ width: '60%', ...getSkeletonStyle() }}
              />
              <div
                className={`${baseClasses} rounded-lg h-3`}
                style={{ width: '30%', ...getSkeletonStyle() }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSearchResultSkeleton = () => (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={`search-${i}`} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <div className="space-y-2 mb-3">
            <div
              className={`${baseClasses} rounded-lg h-5 text-blue-600 dark:text-blue-400`}
              style={{ width: '70%', ...getSkeletonStyle() }}
            />
            <div
              className={`${baseClasses} rounded-lg h-4 text-green-600 dark:text-green-400`}
              style={{ width: '40%', ...getSkeletonStyle() }}
            />
          </div>
          <div className="space-y-1">
            <div
              className={`${baseClasses} rounded-lg h-3`}
              style={{ width: '100%', ...getSkeletonStyle() }}
            />
            <div
              className={`${baseClasses} rounded-lg h-3`}
              style={{ width: '85%', ...getSkeletonStyle() }}
            />
            <div
              className={`${baseClasses} rounded-lg h-3`}
              style={{ width: '65%', ...getSkeletonStyle() }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'circular':
    case 'avatar':
      return renderCircularSkeleton();
    case 'rectangular':
      return renderRectangularSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'form':
      return renderFormSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'chart':
      return renderChartSkeleton();
    case 'calendar':
      return renderCalendarSkeleton();
    case 'notification':
      return renderNotificationSkeleton();
    case 'search-result':
      return renderSearchResultSkeleton();
    case 'text':
    default:
      return renderTextSkeleton();
  }
};

export default EnhancedSkeleton;