import React, { useState, useRef, useEffect } from 'react';

// ResizeObserver is available globally but TypeScript needs this for ESLint
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const ResizeObserver: any;

export interface ResponsiveGridProps {
  children: React.ReactNode[];
  minItemWidth?: number;
  gap?: string;
  className?: string;
  swipeable?: boolean;
  showScrollIndicators?: boolean;
  enhanced?: boolean;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  minItemWidth = 280,
  gap = '1rem',
  className = '',
  swipeable = false,
  showScrollIndicators = true,
  enhanced = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setIsScrollable(scrollWidth > clientWidth);
      setShowLeftIndicator(scrollLeft > 0);
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 1);
    };

    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(container);
    
    container.addEventListener('scroll', checkScrollable);
    checkScrollable();

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', checkScrollable);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (swipeable) {
    return (
      <div className={`relative ${className}`}>
        {/* Left scroll indicator */}
        {showScrollIndicators && isScrollable && showLeftIndicator && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 hover:scale-110 transition-all duration-200 touch-manipulation ripple-effect"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Grid container */}
        <div
          ref={containerRef}
          className={`overflow-x-auto scrollbar-hide scroll-smooth ${enhanced ? 'touch-pan-x' : ''}`}
          style={{ gap }}
        >
          <div 
            className={`flex ${enhanced ? 'enhanced-mobile-spacing' : ''}`}
            style={{ 
              gap,
              minWidth: `min-content`,
              gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`
            }}
          >
            {children.map((child, index) => (
              <div key={index} className={`flex-shrink-0 ${enhanced ? 'touch-target' : ''}`} style={{ minWidth: `${minItemWidth}px` }}>
                {child}
              </div>
            ))}
          </div>
        </div>

        {/* Right scroll indicator */}
        {showScrollIndicators && isScrollable && showRightIndicator && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 hover:scale-110 transition-all duration-200 touch-manipulation ripple-effect"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Gradient fade edges */}
        {showScrollIndicators && isScrollable && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-neutral-900 to-transparent pointer-events-none z-0" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-neutral-900 to-transparent pointer-events-none z-0" />
          </>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`grid ${enhanced ? 'enhanced-mobile-spacing' : ''} ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,
        gap,
      }}
    >
      {children.map((child, index) => (
        <div key={index} className={enhanced ? 'touch-target' : ''}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default ResponsiveGrid;