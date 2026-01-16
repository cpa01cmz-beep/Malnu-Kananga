import { useState } from 'react';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { DateRange, AnalyticsFilters } from '../../types/analytics.types';

interface DateRangeFilterProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onApplyFilters: () => void;
}

const PRESET_RANGES: DateRange[] = [
  {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Today',
  },
  {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Last 7 Days',
  },
  {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Last 30 Days',
  },
  {
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Last 3 Months',
  },
  {
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Last Year',
  },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [customStart, setCustomStart] = useState(filters.dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(filters.dateRange.endDate);

  const handlePresetSelect = (preset: DateRange) => {
    onFiltersChange({
      ...filters,
      dateRange: preset,
    });
  };

  const handleCustomApply = () => {
    if (customStart && customEnd && customStart <= customEnd) {
      onFiltersChange({
        ...filters,
        dateRange: {
          startDate: customStart,
          endDate: customEnd,
          label: 'Custom',
        },
      });
      setShowCalendar(false);
      onApplyFilters();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Date Range:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_RANGES.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filters.dateRange.label === preset.label
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              aria-label="Custom date range"
            >
              <span>Custom</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showCalendar && (
              <div className="absolute top-full mt-2 right-0 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 z-50">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="start-date"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      Start Date
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      End Date
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCustomApply}
                    disabled={!customStart || !customEnd || customStart > customEnd}
                    className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="px-4 py-1.5 text-sm font-medium rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Selected:</span> {formatDate(filters.dateRange.startDate)} - {formatDate(filters.dateRange.endDate)}
          </div>
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
