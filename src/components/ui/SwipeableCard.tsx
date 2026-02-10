import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type SwipeDirection = 'left' | 'right';
export type SwipeAction = {
  label: string;
  icon?: React.ReactNode;
  color: string;
  bgColor: string;
  onPress: () => void;
  destructive?: boolean;
};

export interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  disabled?: boolean;
  className?: string;
  onAnimationComplete?: (direction: SwipeDirection) => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftAction,
  rightAction,
  threshold = 80,
  disabled = false,
  className = '',
  onAnimationComplete,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showAction, setShowAction] = useState<SwipeDirection | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const { onPress } = useHapticFeedback();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = Math.abs(currentY - startY.current);

    // Prevent vertical scrolling from triggering swipe
    if (diffY > Math.abs(diffX) * 1.5) return;

    // Limit swipe distance
    const maxSwipe = 150;
    const newTranslateX = Math.max(-maxSwipe, Math.min(maxSwipe, diffX));
    setTranslateX(newTranslateX);

    // Show action preview based on direction
    if (newTranslateX > threshold && leftAction) {
      setShowAction('left');
    } else if (newTranslateX < -threshold && rightAction) {
      setShowAction('right');
    } else {
      setShowAction(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    let triggeredAction: SwipeDirection | null = null;

    if (translateX > threshold && leftAction) {
      triggeredAction = 'left';
      onPress();
      leftAction.onPress();
    } else if (translateX < -threshold && rightAction) {
      triggeredAction = 'right';
      onPress();
      rightAction.onPress();
    }

    // Reset position with animation
    setTranslateX(0);
    setShowAction(null);

    if (triggeredAction) {
      onAnimationComplete?.(triggeredAction);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    const diffX = currentX - startX.current;
    const diffY = Math.abs(currentY - startY.current);

    if (diffY > Math.abs(diffX) * 1.5) return;

    const maxSwipe = 150;
    const newTranslateX = Math.max(-maxSwipe, Math.min(maxSwipe, diffX));
    setTranslateX(newTranslateX);

    if (newTranslateX > threshold && leftAction) {
      setShowAction('left');
    } else if (newTranslateX < -threshold && rightAction) {
      setShowAction('right');
    } else {
      setShowAction(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || disabled) return;
    handleTouchEnd();
  };

  // Cleanup mouse events
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setTranslateX(0);
      setShowAction(null);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  const cardStyle = prefersReducedMotion ? {} : {
    transform: `translateX(${translateX}px)`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };

  const leftActionStyle = {
    transform: `translateX(${Math.max(0, translateX - 20)}px)`,
    opacity: showAction === 'left' ? 1 : Math.max(0, translateX / threshold),
  };

  const rightActionStyle = {
    transform: `translateX(${Math.min(0, translateX + 20)}px)`,
    opacity: showAction === 'right' ? 1 : Math.max(0, -translateX / threshold),
  };

  return (
    <div className={`relative touch-manipulation ${className}`}>
      {/* Left Action Background */}
      {leftAction && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center px-4 ${leftAction.bgColor} text-white rounded-lg transition-opacity duration-200`}
          style={leftActionStyle}
        >
          <div className="flex items-center space-x-2">
            {leftAction.icon}
            <span className="font-medium text-sm">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center px-4 justify-end ${rightAction.bgColor} text-white rounded-lg transition-opacity duration-200`}
          style={rightActionStyle}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{rightAction.label}</span>
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        ref={cardRef}
        className={`relative bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${isDragging ? 'shadow-lg' : ''}`}
        style={cardStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        {/* Visual feedback for swipe state */}
        {showAction && (
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg pointer-events-none" />
        )}
        
        {children}
      </div>

      {/* Swipe hint indicator */}
      {leftAction && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-neutral-600 text-xs opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          ←
        </div>
      )}
      {rightAction && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-neutral-600 text-xs opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          →
        </div>
      )}
    </div>
  );
};

SwipeableCard.displayName = 'SwipeableCard';

export default SwipeableCard;