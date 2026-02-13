import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from './Button';
import { PAGINATION_OPTIONS, UI_DELAYS } from '../../constants';

export type PaginationVariant = 'default' | 'compact' | 'minimal';
export type PaginationSize = 'sm' | 'md' | 'lg';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  variant?: PaginationVariant;
  size?: PaginationSize;
  showItemsPerPageSelector?: boolean;
  showTotalCount?: boolean;
  className?: string;
  maxVisiblePages?: number;
  ariaLabel?: string;
}

interface PageNumbersProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages: number;
}

const PageNumbers: React.FC<PageNumbersProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages,
}) => {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push(-1); // Ellipsis marker
      }
    }
    
    // Add page range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add last page and ellipsis if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(-1); // Ellipsis marker
      }
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center space-x-1">
      {pageNumbers.map((page, index) => {
        if (page === -1) {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm">
              ...
            </span>
          );
        }
        
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={page === currentPage}
            className={`
              px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
              focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
              ${page === currentPage
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:scale-105 active:scale-95'
              }
              ${page === currentPage ? 'cursor-default' : 'cursor-pointer'}
            `}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  variant = 'default',
  size = 'md',
  showItemsPerPageSelector = true,
  showTotalCount = true,
  className = '',
  maxVisiblePages = 5,
  ariaLabel = 'Pagination navigation',
}) => {
  const [itemsPerPageValue, setItemsPerPageValue] = useState(itemsPerPage);
  const [showPrevShortcut, setShowPrevShortcut] = useState(false);
  const [showNextShortcut, setShowNextShortcut] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const prevHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within the pagination
      if (!navRef.current?.contains(document.activeElement)) return;

      if (e.key === 'ArrowLeft' && currentPage > 1) {
        e.preventDefault();
        onPageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        e.preventDefault();
        onPageChange(currentPage + 1);
      } else if (e.key === 'Home' && currentPage !== 1) {
        e.preventDefault();
        onPageChange(1);
      } else if (e.key === 'End' && currentPage !== totalPages) {
        e.preventDefault();
        onPageChange(totalPages);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onPageChange]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (prevHintTimeoutRef.current) clearTimeout(prevHintTimeoutRef.current);
      if (nextHintTimeoutRef.current) clearTimeout(nextHintTimeoutRef.current);
    };
  }, []);

  const showPrevHint = () => {
    if (currentPage > 1) {
      prevHintTimeoutRef.current = setTimeout(() => {
        setShowPrevShortcut(true);
      }, UI_DELAYS.SHORTCUT_HINT_DELAY);
    }
  };

  const hidePrevHint = () => {
    setShowPrevShortcut(false);
    if (prevHintTimeoutRef.current) {
      clearTimeout(prevHintTimeoutRef.current);
    }
  };

  const showNextHint = () => {
    if (currentPage < totalPages) {
      nextHintTimeoutRef.current = setTimeout(() => {
        setShowNextShortcut(true);
      }, UI_DELAYS.SHORTCUT_HINT_DELAY);
    }
  };

  const hideNextHint = () => {
    setShowNextShortcut(false);
    if (nextHintTimeoutRef.current) {
      clearTimeout(nextHintTimeoutRef.current);
    }
  };
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const buttonSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  } as const;
  
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPageValue(newItemsPerPage);
    onItemsPerPageChange?.(newItemsPerPage);
  }, [onItemsPerPageChange]);
  
  const variantClasses = {
    default: 'flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4',
    compact: 'flex items-center justify-between',
    minimal: 'flex items-center justify-center space-x-2',
  };
  
  if (totalPages <= 1) return null;
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <nav
      ref={navRef}
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="navigation"
      aria-label={ariaLabel}
    >
      {variant !== 'minimal' && showTotalCount && (
        <div className="text-neutral-600 dark:text-neutral-400">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {variant !== 'minimal' && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                iconOnly
                aria-label="Previous page (Press Left Arrow)"
                onMouseEnter={showPrevHint}
                onMouseLeave={hidePrevHint}
                onFocus={showPrevHint}
                onBlur={hidePrevHint}
              >
                ←
              </Button>
              {/* Keyboard shortcut hint - Micro UX Delight */}
              {showPrevShortcut && currentPage > 1 && (
                <div
                  className={`
                    absolute -top-9 left-1/2 -translate-x-1/2
                    px-2.5 py-1
                    bg-neutral-800 dark:bg-neutral-700
                    text-white text-[10px] font-medium
                    rounded-md shadow-md
                    whitespace-nowrap
                    transition-all duration-200 ease-out
                    pointer-events-none
                    z-50
                    ${showPrevShortcut ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
                  `.replace(/\s+/g, ' ').trim()}
                  role="tooltip"
                  aria-hidden={!showPrevShortcut}
                >
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">
                      ←
                    </kbd>
                    <span>prev</span>
                  </span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
                </div>
              )}
            </div>
            
            <PageNumbers
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              maxVisiblePages={maxVisiblePages}
            />
            
            <div className="relative">
              <Button
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                iconOnly
                aria-label="Next page (Press Right Arrow)"
                onMouseEnter={showNextHint}
                onMouseLeave={hideNextHint}
                onFocus={showNextHint}
                onBlur={hideNextHint}
              >
                →
              </Button>
              {/* Keyboard shortcut hint - Micro UX Delight */}
              {showNextShortcut && currentPage < totalPages && (
                <div
                  className={`
                    absolute -top-9 left-1/2 -translate-x-1/2
                    px-2.5 py-1
                    bg-neutral-800 dark:bg-neutral-700
                    text-white text-[10px] font-medium
                    rounded-md shadow-md
                    whitespace-nowrap
                    transition-all duration-200 ease-out
                    pointer-events-none
                    z-50
                    ${showNextShortcut ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
                  `.replace(/\s+/g, ' ').trim()}
                  role="tooltip"
                  aria-hidden={!showNextShortcut}
                >
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">
                      →
                    </kbd>
                    <span>next</span>
                  </span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
        )}
        
        {variant === 'minimal' && (
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size={buttonSizes[size]}
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              Previous
            </Button>
            
            <span className={`${sizeClasses[size]} text-neutral-600 dark:text-neutral-400 px-3`}>
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="secondary"
              size={buttonSizes[size]}
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        )}
        
        {showItemsPerPageSelector && variant !== 'minimal' && onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <label
              htmlFor="items-per-page"
              className="text-sm text-neutral-600 dark:text-neutral-400"
            >
              Show
            </label>
            <select
              id="items-per-page"
              value={itemsPerPageValue}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-neutral-300 dark:border-neutral-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50%"
              aria-label="Items per page"
            >
              {PAGINATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              per page
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Pagination;