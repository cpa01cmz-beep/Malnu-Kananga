import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { logger } from '../../utils/logger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  action: () => void;
  disabled?: boolean;
  category?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
  emptyMessage?: string;
  maxResults?: number;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  placeholder = 'Cari perintah atau ketik ? untuk bantuan...',
  emptyMessage = 'Tidak ada perintah yang ditemukan',
  maxResults = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCommands(commands.filter(cmd => !cmd.disabled).slice(0, maxResults));
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = commands
      .filter(cmd => !cmd.disabled)
      .filter(cmd => {
        const labelMatch = cmd.label.toLowerCase().includes(query);
        const descMatch = cmd.description?.toLowerCase().includes(query);
        const keywordMatch = cmd.keywords?.some(k => k.toLowerCase().includes(query));
        return labelMatch || descMatch || keywordMatch;
      })
      .slice(0, maxResults);
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [searchQuery, commands, maxResults]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Handle command execution
  const handleCommandClick = useCallback((command: Command) => {
    try {
      command.action();
      onClose();
    } catch (error) {
      logger.error('Command execution failed:', error);
    }
  }, [onClose]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      const category = cmd.category || 'Lainnya';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  if (!isOpen) return null;

  const animationClass = prefersReducedMotion 
    ? '' 
    : 'animate-in fade-in zoom-in-95 duration-200';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Command Palette Container */}
      <div 
        className={`relative w-full max-w-2xl mx-4 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl overflow-hidden ${animationClass}`}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <svg 
            className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-lg outline-none"
            aria-label="Cari perintah"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <ul ref={listRef} className="py-2" role="listbox">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <li key={category}>
                  {Object.keys(groupedCommands).length > 1 && (
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {category}
                    </div>
                  )}
                  <ul>
                    {categoryCommands.map((command, _index) => {
                      const globalIndex = filteredCommands.findIndex(cmd => cmd.id === command.id);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <li key={command.id}>
                          <button
                            onClick={() => handleCommandClick(command)}
                            className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                              isSelected 
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-200'
                            }`}
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            {command.icon && (
                              <span className="flex-shrink-0 text-neutral-400 dark:text-neutral-500">
                                {command.icon}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {command.label}
                              </div>
                              {command.description && (
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                  {command.description}
                                </div>
                              )}
                            </div>
                            {command.shortcut && (
                              <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded flex-shrink-0">
                                {command.shortcut}
                              </kbd>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
              <svg 
                className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p>{emptyMessage}</p>
              {searchQuery && (
                <p className="mt-1 text-sm">
                  Coba kata kunci lain atau ketik ? untuk melihat semua perintah
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded">↓</kbd>
              <span className="ml-1">navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded">↵</kbd>
              <span className="ml-1">pilih</span>
            </span>
          </div>
          <span>{filteredCommands.length} perintah</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
