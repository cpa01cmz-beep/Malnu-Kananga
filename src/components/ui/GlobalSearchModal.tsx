import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchAPI, type SearchResult, type SearchFilters, type SearchResultType } from '../../services/api';
import { STORAGE_KEYS, TIME_MS } from '../../constants';
import Input from './Input';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const RECENT_SEARCHES_KEY = STORAGE_KEYS.GLOBAL_SEARCH_RECENT;

const RESULT_TYPE_ICONS: Record<SearchResultType, string> = {
  student: '👨‍🎓',
  teacher: '👨‍🏫',
  grade: '📊',
  assignment: '📝',
  material: '📚',
  class: '🏫',
  subject: '📖',
  announcement: '📢',
  event: '🎉',
};

const RESULT_TYPE_LABELS: Record<SearchResultType, string> = {
  student: 'Siswa',
  teacher: 'Guru',
  grade: 'Nilai',
  assignment: 'Tugas',
  material: 'Materi',
  class: 'Kelas',
  subject: 'Mapel',
  announcement: 'Pengumuman',
  event: 'Acara',
};

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string) => {
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchResultType[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), TIME_MS.INPUT_FOCUS_DELAY);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, getDisplayItems().length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const items = getDisplayItems();
        if (items[selectedIndex]) {
          handleSelect(items[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedIndex, query]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const filters: SearchFilters = {};
      if (activeFilters.length > 0) {
        filters.types = activeFilters;
      }
      filters.limit = 20;

      const response = await searchAPI.search(searchQuery, filters);
      if (response.success && response.data) {
        setResults(response.data.results);
        setSelectedIndex(0);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, TIME_MS.SEARCH_DEBOUNCE);
    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);

  const handleSelect = (result: SearchResult | string) => {
    if (typeof result === 'string') {
      setQuery(result);
      setSelectedIndex(0);
      return;
    }

    saveRecentSearch(query);
    if (onNavigate) {
      onNavigate(result.url);
    }
    onClose();
  };

  const toggleFilter = (type: SearchResultType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getDisplayItems = (): (SearchResult | string)[] => {
    if (query.length < 2 && recentSearches.length > 0) {
      return recentSearches;
    }
    return results;
  };

  if (!isOpen) return null;

  const displayItems = getDisplayItems();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden ${!prefersReducedMotion ? 'animate-scale-in' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian Global"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari siswa, guru, nilai, tugas, materi..."
            className="text-lg"
            leftIcon={<span className="text-gray-400">🔍</span>}
            rightIcon={
              query ? (
                <button
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Hapus pencarian"
                >
                  ✕
                </button>
              ) : undefined
            }
          />
        </div>

        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          {(Object.keys(RESULT_TYPE_LABELS) as SearchResultType[]).map(type => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeFilters.includes(type)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {RESULT_TYPE_ICONS[type]} {RESULT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <div 
          ref={resultsRef}
          className="max-h-[50vh] overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <span className="animate-spin mr-2">⏳</span>
              Mencari...
            </div>
          ) : displayItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {query.length < 2 
                ? 'Ketik minimal 2 karakter untuk mencari'
                : 'Tidak ada hasil ditemukan'}
            </div>
          ) : (
            <ul className="py-2">
              {query.length < 2 && recentSearches.length > 0 && (
                <li className="px-4 py-2 text-sm text-gray-500 font-medium">
                  Pencarian Terbaru
                </li>
              )}
              {displayItems.map((item, index) => (
                <li key={typeof item === 'string' ? `recent-${item}` : item.id}>
                  <button
                    onClick={() => handleSelect(item)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {typeof item === 'string' ? (
                      <span className="text-gray-400">🕐</span>
                    ) : (
                      <span className="text-2xl">{RESULT_TYPE_ICONS[item.type]}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {typeof item === 'string' ? item : item.title}
                      </div>
                      {typeof item !== 'string' && item.subtitle && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    {typeof item !== 'string' && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                        {RESULT_TYPE_LABELS[item.type]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span>↑↓ Navigasi</span>
            <span>Enter Pilih</span>
            <span>Esc Tutup</span>
          </div>
          <span>Cmd+K untuk membuka</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
