import React, { useState } from 'react';
import { ChevronRightIcon, HomeIcon } from '../icons/MaterialIcons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDropdown?: boolean;
  dropdownItems?: BreadcrumbItem[];
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  homeHref?: string;
  maxItems?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline';
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  showHome = false,
  homeHref = '/',
  maxItems,
  className = '',
  size = 'md',
  variant = 'default',
  onItemClick,
}) => {
  const [expandedDropdown, setExpandedDropdown] = useState<number | null>(null);

  // Process items with maxItems limit
  const processedItems = React.useMemo(() => {
    if (!maxItems || items.length <= maxItems) return items;
    
    const visibleItems = items.slice(0, maxItems - 2);
    const hiddenItems = items.slice(maxItems - 2, -1);
    const lastItem = items[items.length - 1];

    const dropdownItem: BreadcrumbItem = {
      label: `...${hiddenItems.length} items`,
      isDropdown: true,
      dropdownItems: hiddenItems,
    };

    return [...visibleItems, dropdownItem, lastItem];
  }, [items, maxItems]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'pills':
        return 'bg-neutral-100 dark:bg-neutral-800 rounded-full px-3 py-1';
      case 'underline':
        return 'border-b-2 border-transparent hover:border-primary-500';
      default:
        return '';
    }
  };

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.isDropdown) {
      setExpandedDropdown(expandedDropdown === index ? null : index);
    } else {
      onItemClick?.(item, index);
      setExpandedDropdown(null);
    }
  };

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, _isLast: boolean) => {
    const baseClasses = `
      flex items-center gap-1.5 transition-all duration-200
      ${getSizeClasses()}
      ${item.isActive ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}
      ${item.href && !item.isActive ? getVariantClasses() : ''}
      ${!item.href && !item.isDropdown ? 'cursor-default' : 'cursor-pointer'}
      focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded
    `.replace(/\s+/g, ' ').trim();

    const content = (
      <>
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span className={`max-w-[200px] truncate ${item.isDropdown ? 'font-medium' : ''}`}>
          {item.label}
        </span>
      </>
    );

    if (item.href && !item.isActive && !item.isDropdown) {
      return (
        <a
          key={index}
          href={item.href}
          onClick={() => onItemClick?.(item, index)}
          className={baseClasses}
          aria-current={item.isActive ? 'page' : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={index}
        onClick={() => handleItemClick(item, index)}
        className={baseClasses}
        aria-haspopup={item.isDropdown ? 'menu' : undefined}
        aria-expanded={item.isDropdown ? expandedDropdown === index : undefined}
        aria-current={item.isActive ? 'page' : undefined}
      >
        {content}
        {item.isDropdown && (
          <ChevronRightIcon className={`w-3 h-3 transition-transform duration-200 ${
            expandedDropdown === index ? 'rotate-90' : ''
          }`} />
        )}
      </button>
    );
  };

  const allItems = showHome ? [
    { label: 'Home', href: homeHref, icon: <HomeIcon className="w-4 h-4" /> },
    ...processedItems
  ] : processedItems;

  return (
    <nav className={`flex items-center gap-1 flex-wrap ${className}`} aria-label="Breadcrumb">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        
        return (
          <React.Fragment key={index}>
            {renderBreadcrumbItem(item, index, isLast)}
            
            {!isLast && (
              <span className="flex-shrink-0 text-neutral-400 dark:text-neutral-600 mx-1">
                {separator || <ChevronRightIcon className="w-4 h-4" />}
              </span>
            )}
            
            {/* Dropdown menu for collapsed items */}
            {(item as BreadcrumbItem).isDropdown && expandedDropdown === index && (item as BreadcrumbItem).dropdownItems && (item as BreadcrumbItem).dropdownItems && (
              <div className="absolute z-50 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[200px]">
                {(item as BreadcrumbItem).dropdownItems?.map((dropdownItem: BreadcrumbItem, dropdownIndex: number) => (
                  <a
                    key={dropdownIndex}
                    href={dropdownItem.href}
                    onClick={() => onItemClick?.(dropdownItem, index + dropdownIndex + 1)}
                    className="block px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {dropdownItem.icon}
                      {dropdownItem.label}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;