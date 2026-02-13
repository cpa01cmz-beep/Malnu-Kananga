import React, { useState, useEffect } from 'react';
import Button from './Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { DELAY_MS } from '../../constants';

/**
 * Comprehensive Empty State Components
 * Provides beautiful, accessible empty states for various UI patterns
 */

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'illustrated';
  /** Enable entrance animation on mount */
  animate?: boolean;
  /** ARIA live region priority for screen readers */
  ariaLive?: 'polite' | 'assertive';
  /** Unique ID for accessibility */
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  className = '',
  size = 'md',
  variant = 'default',
  animate = true,
  ariaLive = 'polite',
  id,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const emptyStateId = id || `empty-state-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (animate && !prefersReducedMotion) {
      const timer = setTimeout(() => setIsVisible(true), DELAY_MS.SHORT);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animate, prefersReducedMotion]);
  const sizeClasses = {
    sm: 'p-6 max-w-sm',
    md: 'p-8 max-w-md',
    lg: 'p-12 max-w-lg',
    xl: 'p-16 max-w-xl',
  };

  const variantClasses = {
    default: 'text-center',
    minimal: 'text-center',
    illustrated: 'text-center',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  };

  const descriptionSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const animationClasses = animate && !prefersReducedMotion
    ? `transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`
    : '';

  return (
    <div
      id={emptyStateId}
      className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} ${animationClasses} ${className}`}
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {/* Icon or Illustration */}
      {illustration || icon ? (
        <div
          className={`mb-6 ${animate && !prefersReducedMotion ? `transition-all duration-700 ease-out delay-100 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}` : ''}`}
        >
          {illustration || (
            <div className={`${iconSizes[size]} text-neutral-400 dark:text-neutral-600 mx-auto`}>
              {icon}
            </div>
          )}
        </div>
      ) : null}

      {/* Title */}
      <h3
        className={`${titleSizes[size]} text-neutral-900 dark:text-neutral-100 mb-3 ${animate && !prefersReducedMotion ? `transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}` : ''}`}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`${descriptionSizes[size]} text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm ${animate && !prefersReducedMotion ? `transition-all duration-700 ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}` : ''}`}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div
          className={`flex flex-col sm:flex-row gap-3 ${animate && !prefersReducedMotion ? `transition-all duration-700 ease-out delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}` : ''}`}
        >
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || 'primary'}
              className="w-full sm:w-auto"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Screen reader only announcement */}
      <span className="sr-only">
        {title}{description ? `. ${description}` : ''}
      </span>
    </div>
  );
};

// Specialized empty state components

// Data empty states
export const NoDataEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onRefresh?: () => void }> = ({
  onRefresh,
  ...props
}) => (
  <EmptyState
    title="No data available"
    description="There's no data to display at the moment. Try refreshing or check back later."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    }
    primaryAction={onRefresh ? {
      label: 'Refresh',
      onClick: onRefresh,
    } : undefined}
    {...props}
  />
);

export const NoSearchResultsEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onClearSearch?: () => void }> = ({
  onClearSearch,
  ...props
}) => (
  <EmptyState
    title="No results found"
    description="We couldn't find anything matching your search. Try different keywords or filters."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    primaryAction={onClearSearch ? {
      label: 'Clear search',
      onClick: onClearSearch,
    } : undefined}
    {...props}
  />
);

// User content empty states
export const NoPostsEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onCreatePost?: () => void }> = ({
  onCreatePost,
  ...props
}) => (
  <EmptyState
    title="No posts yet"
    description="Be the first to share something with the community. Create your first post to get started."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    }
    primaryAction={onCreatePost ? {
      label: 'Create post',
      onClick: onCreatePost,
    } : undefined}
    {...props}
  />
);

export const NoCommentsEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onAddComment?: () => void }> = ({
  onAddComment,
  ...props
}) => (
  <EmptyState
    title="No comments"
    description="Start the conversation! Share your thoughts about this post."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    }
    primaryAction={onAddComment ? {
      label: 'Add comment',
      onClick: onAddComment,
    } : undefined}
    {...props}
  />
);

// File and media empty states
export const NoFilesEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onUploadFile?: () => void }> = ({
  onUploadFile,
  ...props
}) => (
  <EmptyState
    title="No files"
    description="Upload files to get started. Drag and drop or click to browse."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    }
    primaryAction={onUploadFile ? {
      label: 'Upload file',
      onClick: onUploadFile,
    } : undefined}
    {...props}
  />
);

export const NoImagesEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onAddImage?: () => void }> = ({
  onAddImage,
  ...props
}) => (
  <EmptyState
    title="No images"
    description="Add images to bring your content to life."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    }
    primaryAction={onAddImage ? {
      label: 'Add image',
      onClick: onAddImage,
    } : undefined}
    {...props}
  />
);

// Task and activity empty states
export const NoTasksEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onCreateTask?: () => void }> = ({
  onCreateTask,
  ...props
}) => (
  <EmptyState
    title="No tasks"
    description="Create your first task to start organizing your work."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    }
    primaryAction={onCreateTask ? {
      label: 'Create task',
      onClick: onCreateTask,
    } : undefined}
    {...props}
  />
);

export const NoNotificationsEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onSettings?: () => void }> = ({
  onSettings,
  ...props
}) => (
  <EmptyState
    title="All caught up"
    description="You have no new notifications. We'll let you know when something important happens."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    }
    secondaryAction={onSettings ? {
      label: 'Notification settings',
      onClick: onSettings,
    } : undefined}
    {...props}
  />
);

// Error and permission empty states
export const NoPermissionEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onRequestAccess?: () => void }> = ({
  onRequestAccess,
  ...props
}) => (
  <EmptyState
    title="Access denied"
    description="You don't have permission to view this content. Contact your administrator if you need access."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    }
    primaryAction={onRequestAccess ? {
      label: 'Request access',
      onClick: onRequestAccess,
    } : undefined}
    {...props}
  />
);

export const OfflineEmptyState: React.FC<Omit<EmptyStateProps, 'title' | 'icon'> & { onRetry?: () => void }> = ({
  onRetry,
  ...props
}) => (
  <EmptyState
    title="You're offline"
    description="Check your internet connection and try again."
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    }
    primaryAction={onRetry ? {
      label: 'Retry',
      onClick: onRetry,
    } : undefined}
    {...props}
  />
);

// Minimal empty states for compact spaces
export const MinimalEmptyState: React.FC<{ message: string; className?: string }> = ({
  message,
  className = '',
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
  </div>
);

// Inline empty states for tables and lists
export const InlineEmptyState: React.FC<{ message: string; colSpan: number; className?: string }> = ({
  message,
  colSpan,
  className = '',
}) => (
  <tr>
    <td colSpan={colSpan} className={`text-center py-8 ${className}`}>
      <div className="w-6 h-6 text-neutral-300 dark:text-neutral-600 mx-auto mb-2">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
    </td>
  </tr>
);

export default EmptyState;