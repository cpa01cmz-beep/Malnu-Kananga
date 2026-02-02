import React from 'react';
import SearchInput from '../ui/SearchInput';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { FunnelIcon, StarIcon } from '../icons/MaterialIcons';

export interface MaterialSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  showAdvancedSearch: boolean;
  onToggleAdvancedSearch: () => void;
  filterTeacher: string;
  onFilterTeacherChange: (value: string) => void;
  filterDateRange: 'all' | 'week' | 'month' | 'semester';
  onFilterDateRangeChange: (value: 'all' | 'week' | 'month' | 'semester') => void;
  filterRating: number;
  onFilterRatingChange: (value: number) => void;
  sortBy: 'title' | 'date' | 'rating' | 'downloads';
  onSortByChange: (value: 'title' | 'date' | 'rating' | 'downloads') => void;
  showOnlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  isSemanticMode: boolean;
  onToggleSemanticMode: () => void;
  showSemanticOptions: boolean;
  onToggleSemanticOptions: () => void;
  showOCROptions: boolean;
  onToggleOCROptions: () => void;
  onClearFilters: () => void;
  _semanticSearchIsSearching: boolean;
  _semanticSearchSuggestedQueries: string[];
  _onSemanticSearchSuggestionClick: (suggestion: string) => void;
}

const MaterialSearch: React.FC<MaterialSearchProps> = ({
  search,
  onSearchChange,
  showAdvancedSearch,
  onToggleAdvancedSearch,
  filterTeacher,
  onFilterTeacherChange,
  filterDateRange,
  onFilterDateRangeChange,
  filterRating,
  onFilterRatingChange,
  sortBy,
  onSortByChange,
  showOnlyFavorites,
  onToggleOnlyFavorites,
  isSemanticMode,
  onToggleSemanticMode,
  showSemanticOptions,
  onToggleSemanticOptions,
  showOCROptions,
  onToggleOCROptions,
  onClearFilters,
  _semanticSearchIsSearching,
  _semanticSearchSuggestedQueries,
  _onSemanticSearchSuggestionClick
}) => {
  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      <div className="flex gap-2 w-full md:w-auto">
        <SearchInput
          placeholder={isSemanticMode ? "Cari dengan AI..." : "Cari materi..."}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
          showIcon={false}
          size="md"
          className="w-full md:w-48"
        />
        <Button
          onClick={onToggleAdvancedSearch}
          onKeyDown={(e) => handleFilterKeyDown(e, onToggleAdvancedSearch)}
          variant={showAdvancedSearch ? 'success' : 'secondary'}
          size="md"
          className="p-2"
          aria-label="Pencarian lanjutan"
          aria-expanded={showAdvancedSearch}
        >
          <FunnelIcon className="w-5 h-5" />
        </Button>
        <Button
          onClick={onToggleOnlyFavorites}
          onKeyDown={(e) => handleFilterKeyDown(e, onToggleOnlyFavorites)}
          variant={showOnlyFavorites ? 'info' : 'secondary'}
          size="md"
          className="p-2"
          aria-label="Tampilkan hanya favorit"
        >
          <StarIcon className="w-5 h-5" />
        </Button>
        <Button
          onClick={onToggleSemanticMode}
          onKeyDown={(e) => handleFilterKeyDown(e, onToggleSemanticMode)}
          variant={isSemanticMode ? 'success' : 'secondary'}
          size="md"
          className="p-2"
          aria-label="Pencarian semantik AI"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {isSemanticMode ? '🧠' : '🔍'}
          </div>
        </Button>
        <Button
          onClick={onToggleSemanticOptions}
          variant={showSemanticOptions ? 'success' : 'secondary'}
          size="md"
          className="p-2"
        >
          <div className="w-5 h-5 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            ⚙️
          </div>
        </Button>
        <Button
          onClick={onToggleOCROptions}
          variant={showOCROptions ? 'primary' : 'secondary'}
          size="md"
          className="p-2"
          aria-label="Pengaturan OCR"
        >
          <div className="w-5 h-5 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            📄
          </div>
        </Button>
      </div>

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 mb-6 border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Teacher Filter */}
            <Input
              label="Guru Pengupload"
              placeholder="Nama guru..."
              value={filterTeacher}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterTeacherChange(e.target.value)}
              fullWidth
              size="sm"
            />
   
            {/* Date Range Filter */}
            <Select
              label="Rentang Waktu"
              value={filterDateRange}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterDateRangeChange(e.target.value as 'all' | 'week' | 'month' | 'semester')}
              fullWidth
              size="sm"
              options={[
                { value: 'all', label: 'Semua Waktu' },
                { value: 'week', label: '7 Hari Terakhir' },
                { value: 'month', label: '30 Hari Terakhir' },
                { value: 'semester', label: 'Semester Ini' }
              ]}
            />
   
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rating Minimal
              </label>
              <div className="flex gap-1" role="group" aria-label="Filter berdasarkan rating">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => onFilterRatingChange(rating)}
                    aria-label={`Filter rating ${rating === 0 ? 'semua' : rating + ' bintang'}`}
                    aria-pressed={filterRating === rating}
                    className={`p-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
                      filterRating === rating
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {rating === 0 ? 'Semua' : (
                      <>
                        <span className="sr-only">{rating} bintang</span>
                        <span aria-hidden="true">{'★'.repeat(rating)}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
   
            {/* Sort Options */}
            <Select
              label="Urutkan"
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortByChange(e.target.value as 'title' | 'date' | 'rating' | 'downloads')}
              fullWidth
              size="sm"
              options={[
                { value: 'date', label: 'Terbaru' },
                { value: 'title', label: 'Judul' },
                { value: 'rating', label: 'Rating' },
                { value: 'downloads', label: 'Terpopuler' }
              ]}
            />
          </div>
 
          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={onClearFilters}
              variant="ghost"
              size="sm"
            >
              Hapus Filter
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialSearch;
