import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '../icons/MaterialIcons';
import { DEBOUNCE_DELAYS, COMPONENT_LIMITS } from '../../constants';

export interface SearchItem {
  id: string | number;
  label: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  onClick?: () => void;
  href?: string;
}

export interface SearchProps {
  items: SearchItem[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  debounceMs?: number;
  maxSuggestions?: number;
  showCategories?: boolean;
  showKeywords?: boolean;
  allowEmptySearch?: boolean;
  onSearch?: (query: string, results: SearchItem[]) => void;
  onItemSelect?: (item: SearchItem) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

const Search: React.FC<SearchProps> = ({
  items,
  placeholder = 'Cari...',
  className = '',
  size = 'md',
  variant = 'default',
  debounceMs = DEBOUNCE_DELAYS.SEARCH_INPUT,
  maxSuggestions = COMPONENT_LIMITS.SEARCH_MAX_SUGGESTIONS,
  showCategories = true,
  showKeywords = false,
  allowEmptySearch = false,
  onSearch,
  onItemSelect,
  onClear,
  autoFocus = false,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounceTimeoutRef = useRef<any>(undefined);

  // Filter items based on query
  const filterItems = useCallback((searchQuery: string): SearchItem[] => {
    if (!searchQuery.trim() && !allowEmptySearch) return [];

    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    return items
      .filter(item => {
        // Always include if empty search is allowed
        if (!normalizedQuery && allowEmptySearch) return true;
        
        // Check label match
        if (item.label.toLowerCase().includes(normalizedQuery)) return true;
        
        // Check description match
        if (item.description?.toLowerCase().includes(normalizedQuery)) return true;
        
        // Check category match
        if (item.category?.toLowerCase().includes(normalizedQuery)) return true;
        
        // Check keywords match
        if (item.keywords?.some(keyword => keyword.toLowerCase().includes(normalizedQuery))) return true;
        
        return false;
      })
      .slice(0, maxSuggestions);
  }, [items, allowEmptySearch, maxSuggestions]);

  // Handle search with debouncing
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsLoading(true);
    debounceTimeoutRef.current = setTimeout(() => {
      const filteredItems = filterItems(query);
      setSuggestions(filteredItems);
      setIsOpen(filteredItems.length > 0);
      setIsLoading(false);
      setSelectedIndex(-1);
      onSearch?.(query, filteredItems);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, filterItems, debounceMs, onSearch]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as HTMLElement) &&
        !inputRef.current?.contains(event.target as HTMLElement)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleItemClick(suggestions[selectedIndex]);
        } else if (query.trim() || allowEmptySearch) {
          handleSearchSubmit();
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle item selection
  const handleItemClick = (item: SearchItem) => {
    setQuery(item.label);
    setIsOpen(false);
    setSelectedIndex(-1);
    onItemSelect?.(item);
    
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    if (query.trim() || allowEmptySearch) {
      const filteredItems = filterItems(query);
      onSearch?.(query, filteredItems);
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onClear?.();
    inputRef.current?.focus();
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-5 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'bg-transparent border-2 border-neutral-300 dark:border-neutral-600 focus:border-primary-500';
      case 'filled':
        return 'bg-neutral-100 dark:bg-neutral-800 border-0 focus:bg-white dark:focus:bg-neutral-700';
      default:
        return 'bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 focus:border-primary-500';
    }
  };

  // Group suggestions by category
  const groupedSuggestions = showCategories
    ? suggestions.reduce((groups, item) => {
        const category = item.category || 'Lainnya';
        if (!groups[category]) groups[category] = [];
        groups[category].push(item);
        return groups;
      }, {} as Record<string, SearchItem[]>)
    : { 'Hasil': suggestions };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon 
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
          } text-neutral-400 dark:text-neutral-500`}
          aria-hidden="true"
        />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(suggestions.length > 0)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            w-full ${getSizeClasses()} ${getVariantClasses()} rounded-xl
            pl-10 pr-12 text-neutral-900 dark:text-white
            placeholder-neutral-400 dark:placeholder-neutral-500
            focus:outline-none focus:ring-2 focus:ring-primary-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          `}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={selectedIndex >= 0 ? `search-item-${selectedIndex}` : undefined}
        />
        
        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors ${
              size === 'sm' ? 'p-0.5' : ''
            }`}
            aria-label="Hapus pencarian"
          >
            <XMarkIcon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          }`}>
            <div className="animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500 w-full h-full" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-card z-50 max-h-96 overflow-y-auto animate-fade-in-up"
          role="listbox"
        >
          {Object.entries(groupedSuggestions).map(([category, categoryItems], categoryIndex) => (
            <div key={category}>
              {/* Category Header */}
              {showCategories && Object.keys(groupedSuggestions).length > 1 && (
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide bg-neutral-50 dark:bg-neutral-900/50">
                  {category}
                </div>
              )}
              
              {/* Items */}
              {categoryItems.map((item, itemIndex) => {
                const globalIndex = categoryIndex === 0 ? itemIndex : 
                  Object.values(groupedSuggestions).slice(0, categoryIndex).reduce((sum, items) => sum + items.length, 0) + itemIndex;
                const isSelected = globalIndex === selectedIndex;
                
                return (
                  <button
                    key={item.id}
                    id={`search-item-${globalIndex}`}
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50
                      transition-colors duration-150 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0
                      ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : ''}
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 w-5 h-5 text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {item.icon}
                      </span>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-900 dark:text-white truncate">
                        {item.label}
                      </div>
                      
                      {item.description && (
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                          {item.description}
                        </div>
                      )}
                      
                      {showKeywords && item.keywords && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.keywords.slice(0, 3).map((keyword, index) => (
                            <span
                              key={index}
                              className="text-xs px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          
          {/* No results */}
          {suggestions.length === 0 && !isLoading && query && (
            <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
              <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Tidak ada hasil untuk "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;