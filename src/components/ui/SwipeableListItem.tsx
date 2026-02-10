/**
 * Swipeable List Item Component
 * List items with swipe-to-delete gesture support
 */

import React, { useRef, useState, useCallback } from 'react';
import { useSwipeToDelete, useLongPress } from '../../utils/gestures';
import { useHapticFeedback } from '../../utils/hapticFeedback';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  actionWidth?: number;
  swipeThreshold?: number;
  disabled?: boolean;
  className?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  swipeDirection?: 'left' | 'right' | 'both';
  confirmBeforeDelete?: boolean;
  confirmMessage?: string;
  confirmDelay?: number;
}

const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  onDelete,
  actionLabel = 'Delete',
  actionIcon,
  actionWidth = 80,
  swipeThreshold = 100,
  disabled = false,
  className = '',
  leftActions,
  rightActions,
  swipeDirection = 'right',
  confirmBeforeDelete = false,
  confirmMessage = 'Are you sure you want to delete this item?',
  confirmDelay = 2000,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTimer, setConfirmTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const { onDelete: hapticDelete } = useHapticFeedback();

  // Swipe-to-delete configuration
  const swipeConfig = {
    threshold: swipeThreshold,
    actionWidth,
    actionLabel,
    actionIcon,
    onDelete: () => {
      if (confirmBeforeDelete) {
        setShowConfirm(true);
        hapticDelete();
        
        // Auto-cancel after delay
        const timer = setTimeout(() => {
          setShowConfirm(false);
          setConfirmTimer(null);
        }, confirmDelay);
        setConfirmTimer(timer);
      } else {
        onDelete?.();
        hapticDelete();
      }
    },
  };

  const { deleteProps, isDeleting, deleteProgress } = useSwipeToDelete(swipeConfig);

  // Long press for delete (as alternative to swipe)
  const longPressConfig = {
    delay: 500,
    onLongPress: () => {
      if (!disabled && onDelete) {
        if (confirmBeforeDelete) {
          setShowConfirm(true);
          hapticDelete();
          
          const timer = setTimeout(() => {
            setShowConfirm(false);
            setConfirmTimer(null);
          }, confirmDelay);
          setConfirmTimer(timer);
        } else {
          onDelete();
          hapticDelete();
        }
      }
    },
  };

  const { pressProps } = useLongPress(longPressConfig);

  const handleConfirmDelete = useCallback(() => {
    if (confirmTimer) {
      clearTimeout(confirmTimer);
      setConfirmTimer(null);
    }
    onDelete?.();
    setShowConfirm(false);
    hapticDelete();
  }, [onDelete, confirmTimer, hapticDelete]);

  const handleCancelDelete = useCallback(() => {
    if (confirmTimer) {
      clearTimeout(confirmTimer);
      setConfirmTimer(null);
    }
    setShowConfirm(false);
  }, [confirmTimer]);

  const canSwipeRight = swipeDirection === 'right' || swipeDirection === 'both';
  const canSwipeLeft = swipeDirection === 'left' || swipeDirection === 'both';

  return (
    <div
      ref={itemRef}
      className={`relative overflow-hidden ${disabled ? 'opacity-50' : ''} ${className}`}
      onTouchStart={deleteProps.onTouchStart as unknown as React.TouchEventHandler}
      onTouchEnd={deleteProps.onTouchEnd as unknown as React.TouchEventHandler}
    >
      {/* Left Actions (appears when swiping right) */}
      {canSwipeRight && leftActions && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-start bg-blue-500 text-white z-10 transition-transform duration-200 ease-out"
          style={{
            width: `${actionWidth}px`,
            transform: `translateX(${deleteProgress > 0 ? 0 : -actionWidth}px)`,
          }}
        >
          {leftActions}
        </div>
      )}

      {/* Right Actions (delete action) */}
      {canSwipeRight && onDelete && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white z-10 transition-transform duration-200 ease-out"
          style={{
            width: `${actionWidth}px`,
            transform: `translateX(${deleteProgress > 0 ? 0 : actionWidth}px)`,
          }}
        >
          {actionIcon || (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          <span className="ml-2 text-sm font-medium">{actionLabel}</span>
        </div>
      )}

      {/* Left Swipe Actions (delete when swiping left) */}
      {canSwipeLeft && onDelete && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center bg-red-500 text-white z-10 transition-transform duration-200 ease-out"
          style={{
            width: `${actionWidth}px`,
            transform: `translateX(${deleteProgress > 0 ? 0 : -actionWidth}px)`,
          }}
        >
          {actionIcon || (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          <span className="ml-2 text-sm font-medium">{actionLabel}</span>
        </div>
      )}

      {/* Right Actions (appears when swiping left) */}
      {canSwipeLeft && rightActions && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-end bg-blue-500 text-white z-10 transition-transform duration-200 ease-out"
          style={{
            width: `${actionWidth}px`,
            transform: `translateX(${deleteProgress > 0 ? 0 : actionWidth}px)`,
          }}
        >
          {rightActions}
        </div>
      )}

      {/* Main Content */}
      <div
        className={`
          relative bg-white dark:bg-neutral-800 transition-transform duration-200 ease-out touch-manipulation
          ${isDeleting ? 'shadow-lg' : 'shadow-sm'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          transform: canSwipeRight 
            ? `translateX(${deleteProgress > 0 ? -deleteProgress : 0}px)`
            : canSwipeLeft
            ? `translateX(${deleteProgress > 0 ? deleteProgress : 0}px)`
            : 'translateX(0)',
        }}
      >
        {children}
      </div>

      {/* Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 mx-4 max-w-sm shadow-xl">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
              {confirmMessage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced list component with swipe support
interface SwipeableListProps {
  children: React.ReactNode;
  className?: string;
  items: Array<{
    id: string;
    content: React.ReactNode;
    onDelete?: (id: string) => void;
    actionLabel?: string;
    actionIcon?: React.ReactNode;
    disabled?: boolean;
  }>;
  onItemDelete?: (id: string) => void;
  swipeDirection?: 'left' | 'right' | 'both';
  confirmBeforeDelete?: boolean;
  confirmMessage?: string;
}

const SwipeableList: React.FC<SwipeableListProps> = ({
  children,
  className = '',
  items,
  onItemDelete,
  swipeDirection = 'right',
  confirmBeforeDelete = false,
  confirmMessage = 'Are you sure you want to delete this item?',
}) => {
  const handleDelete = useCallback((id: string) => {
    onItemDelete?.(id);
  }, [onItemDelete]);

  if (items && items.length > 0) {
    return (
      <div className={`divide-y divide-neutral-200 dark:divide-neutral-700 ${className}`}>
        {items.map((item) => (
          <SwipeableListItem
            key={item.id}
            onDelete={() => handleDelete(item.id)}
            actionLabel={item.actionLabel}
            actionIcon={item.actionIcon}
            disabled={item.disabled}
            swipeDirection={swipeDirection}
            confirmBeforeDelete={confirmBeforeDelete}
            confirmMessage={confirmMessage}
          >
            {item.content}
          </SwipeableListItem>
        ))}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export { SwipeableListItem, SwipeableList };
export default SwipeableListItem;