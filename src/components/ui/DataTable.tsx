import React, { useState, useCallback, useRef } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from './Table';
import Pagination from './Pagination';
import LoadingOverlay from './LoadingOverlay';
import Button from './Button';
import SearchInput from './SearchInput';
import Card from './Card';
import FunnelIcon from '../icons/FunnelIcon';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import { XMarkIcon } from '../icons/MaterialIcons';
import { HEIGHTS } from '../../config/heights';
import { DATATABLE_CONFIG } from '../../constants';
import { buildAriaAttributes } from '../../utils/accessibilityUtils';

export interface Column<T = Record<string, unknown>> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onSelectAll: (checked: boolean) => void;
    onSelect: (key: string, checked: boolean) => void;
    getRowKey: (record: T) => string;
  };
  filter?: {
    searchable: boolean;
    onSearch: (value: string) => void;
    searchValue?: string;
    placeholder?: string;
  };
  sort?: {
    sortKey: string;
    sortDirection: 'asc' | 'desc';
    onSortChange: (key: string, direction: 'asc' | 'desc') => void;
  };
  rowClassName?: (record: T, index: number) => string;
  onRowClick?: (record: T, index: number) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'striped' | 'simple';
  className?: string;
  stickyHeader?: boolean;
  scrollX?: boolean;
  scrollY?: number;
  mobileLayout?: 'table' | 'cards';
  cardTitleColumn?: string;
  /** Custom error recovery actions */
  errorRecovery?: {
    onRetry?: () => void;
    onRefresh?: () => void;
    onClearFilter?: () => void;
  };
}

const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No data available',
  pagination,
  selection,
  filter,
  sort,
  rowClassName,
  onRowClick,
  size = 'md',
  variant = 'default',
  className = '',
  stickyHeader = false,
  scrollX = false,
  scrollY,
  mobileLayout = 'table',
  cardTitleColumn,
  errorRecovery,
}: DataTableProps<T>) => {
  const [localSearch, setLocalSearch] = useState(filter?.searchValue || '');
  const tableRef = useRef<HTMLDivElement>(null);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selection) return;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        // Implement row navigation
        break;
      case ' ':
        e.preventDefault();
        // Space to select row
        break;
      case 'Enter':
        // Enter to activate row
        break;
    }
  }, [selection]);

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    filter?.onSearch(value);
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !sort) return;
    
    const newDirection = 
      sort.sortKey === column.key && sort.sortDirection === 'asc' ? 'desc' : 'asc';
    sort.onSortChange(column.key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    selection?.onSelectAll(checked);
  };

  const handleSelect = (key: string, checked: boolean) => {
    selection?.onSelect(key, checked);
  };

  const isAllSelected = selection && data.length > 0 && 
    data.every(record => selection.selectedRowKeys.includes(selection.getRowKey(record)));

  const isIndeterminate = selection && data.length > 0 &&
    data.some(record => selection.selectedRowKeys.includes(selection.getRowKey(record))) &&
    !isAllSelected;

  const getCellValue = (column: Column<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(record[column.key] as unknown, record, index);
    }
    return record[column.key] as React.ReactNode;
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  // Enhanced Mobile Card View Component
  const MobileCardView = () => {
    if (loading) {
      return (
        <div className="space-y-4 sm:hidden mobile-card-stack" aria-live="polite" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-700/60">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
                    <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                    <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                      <div className="h-5 bg-neutral-300 dark:bg-neutral-600 rounded w-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                      <div className="h-5 bg-neutral-300 dark:bg-neutral-600 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:hidden mobile-card-stack">
        {data.map((record, index) => {
        const isSelected = selection ? selection.selectedRowKeys.includes(selection.getRowKey(record)) : false;
        const titleColumn = cardTitleColumn || columns[0]?.key;
        const titleColumnObj = columns.find(col => col.key === titleColumn);
        const titleValue = titleColumnObj ? getCellValue(titleColumnObj, record, index) : '';
        
        return (
          <Card
            key={selection ? selection.getRowKey(record) : index}
            variant={onRowClick ? 'interactive' : 'default'}
            className={`
              ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900' : ''}
              ${rowClassName?.(record, index) || ''}
              transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] card-hover-enhanced mobile-gesture-feedback glass-effect-elevated
            `}
            onClick={() => {
              onRowClick?.(record, index);
              // Haptic feedback for card interaction
              if ('vibrate' in navigator) {
                navigator.vibrate(DATATABLE_CONFIG.VIBRATION_PATTERNS.CARD_TAP);
              }
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-700/60">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {selection && (
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        selection.onSelect(selection.getRowKey(record), e.target.checked);
                      }}
                      className="w-6 h-6 rounded-lg border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 shrink-0 cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] mobile-touch-target"
                      aria-label={`Pilih ${titleValue}`}
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full" aria-hidden="true" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="font-semibold text-base text-neutral-900 dark:text-white truncate leading-tight typography-enhanced">
                    {titleValue}
                  </h3>
                </div>
                {onRowClick && (
                  <div className="flex-shrink-0 p-3 -mr-3 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200">
                    <ChevronLeftIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500 rotate-180 transition-transform duration-200" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              {columns
                .filter(col => col.key !== titleColumn)
                .map((column) => {
                  const value = getCellValue(column, record, index);
                  const isEmpty = value === null || value === undefined || value === '';
                  
                  return (
                    <div 
                      key={column.key} 
                      className="flex flex-col gap-1.5 p-3.5 -m-3.5 rounded-xl touch-manipulation hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-200 group"
                    >
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity duration-150">
                        {column.title}
                      </p>
                      <p className="text-sm text-neutral-900 dark:text-white break-words leading-relaxed min-h-[24px] mobile-text-responsive">
                        {isEmpty ? (
                          <span className="text-neutral-400 dark:text-neutral-500 italic text-sm">— Tidak ada data —</span>
                        ) : (
                          <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                            {value}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
            </div>
          </Card>
        );
      })}
    </div>
    );
  };

  const tableClasses = `
    ${scrollX ? 'overflow-x-auto' : ''}
    ${stickyHeader ? 'relative' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Enhanced table accessibility
  const tableAriaProps = buildAriaAttributes({
    label: title || 'Data table',
    multiselectable: !!selection,
    rowcount: data.length,
  });

  if (loading || error || empty) {
    return (
      <LoadingOverlay
        isLoading={loading}
        message={loading ? 'Memuat data...' : undefined}
        className={HEIGHTS.CONTENT.TABLE}
      >
        {error && (
          <div className="text-center py-16 px-6 max-w-md mx-auto" role="alert" aria-live="polite">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Terjadi Kesalahan</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {errorRecovery?.onRetry && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={errorRecovery.onRetry}
                  className="touch-manipulation haptic-feedback"
                >
                  Coba Lagi
                </Button>
              )}
              {errorRecovery?.onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={errorRecovery.onRefresh}
                  className="touch-manipulation haptic-feedback"
                >
                  Muat Ulang Data
                </Button>
              )}
              {errorRecovery?.onClearFilter && filter?.searchable && localSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={errorRecovery.onClearFilter}
                  className="touch-manipulation haptic-feedback"
                >
                  Hapus Filter
                </Button>
              )}
              {!errorRecovery && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="touch-manipulation haptic-feedback"
                >
                  Muat Ulang Halaman
                </Button>
              )}
            </div>
          </div>
        )}
        {empty && !loading && !error && (
          <div className="text-center py-16 px-6">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Tidak Ada Data</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed max-w-sm mx-auto">{emptyMessage}</p>
            {filter?.searchable && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch('')}
                  icon={<XMarkIcon className="w-4 h-4" />}
                  className="touch-manipulation haptic-feedback"
                >
                  Hapus Pencarian
                </Button>
              </div>
            )}
          </div>
        )}
      </LoadingOverlay>
    );
  }

  // Determine if mobile view should be used
  const isMobileView = mobileLayout === 'cards' || (typeof window !== 'undefined' && window.innerWidth < DATATABLE_CONFIG.MOBILE_BREAKPOINT_PX && mobileLayout !== 'table');

  return (
    <div className="space-y-4">
       {(filter?.searchable || selection) && (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mobile-spacing-enhanced">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            {filter?.searchable && (
              <div className="w-full sm:w-auto">
                <SearchInput
                  value={localSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={filter?.placeholder || 'Cari data...'}
                  size="sm"
                  fullWidth={true}
                  showIcon={true}
                  className="sm:max-w-xs mobile-text-responsive"
                />
                {localSearch && (
                  <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <span>Menemukan hasil untuk</span>
                    <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-[10px] font-mono">{localSearch}</kbd>
                    <button
                      onClick={() => handleSearch('')}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline ml-1 touch-manipulation"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            )}
            {sort && (
              <Button
                variant="secondary"
                size="sm"
                icon={<FunnelIcon />}
                onClick={() => {
                  // Reset sort
                  sort?.onSortChange('', 'asc');
                }}
                className="touch-manipulation haptic-feedback mobile-touch-target"
              >
                <span className="hidden sm:inline">Hapus Urutan</span>
                <span className="sm:hidden">Urutan</span>
              </Button>
            )}
          </div>
          
          {selection && (
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end safe-area-enhanced">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400 mobile-text-responsive">
                  {selection.selectedRowKeys.length} dipilih
                </span>
                {selection.selectedRowKeys.length > 0 && (
                  <div className="flex -space-x-2">
                    {selection.selectedRowKeys.slice(0, 3).map((key, i) => (
                      <div
                        key={key}
                        className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center text-xs font-medium"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </div>
                    ))}
                    {selection.selectedRowKeys.length > 3 && (
                      <div className="w-6 h-6 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center text-xs font-medium">
                        +{selection.selectedRowKeys.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selection.selectedRowKeys.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selection?.onSelectAll(false)}
                  className="touch-manipulation haptic-feedback mobile-touch-target"
                >
                  <span className="hidden sm:inline">Hapus Pilihan</span>
                  <span className="sm:hidden">Hapus</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View */}
      {isMobileView ? (
        <MobileCardView />
      ) : (
        <div className={tableClasses} ref={tableRef} tabIndex={0} onKeyDown={handleKeyDown} {...tableAriaProps}>
          <Table
            size={size}
            variant={variant}
            className={scrollY ? 'w-full' : ''}
            style={scrollY ? { maxHeight: scrollY, overflowY: 'auto' } : undefined}
            aria-label={columns.map(col => col.title).join(', ')}
            aria-rowcount={data.length + 1} // +1 for header row
          >
            <Thead className={stickyHeader ? 'sticky top-0 bg-white dark:bg-neutral-900 z-10' : ''}>
              <Tr>
                {selection && (
                  <Th className="w-12" scope="col" aria-label="Pilih baris">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isIndeterminate || false;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500/50%"
                      aria-label="Pilih semua baris"
                    />
                  </Th>
                )}
                {columns.map((column) => (
                  <Th
                    key={column.key}
                    scope="col"
                    sortable={column.sortable && !!sort}
                    sortDirection={sort?.sortKey === column.key ? sort.sortDirection : undefined}
                    onClick={() => column.sortable && handleSort(column)}
                    aria-sort={
                      column.sortable && sort?.sortKey === column.key 
                        ? sort.sortDirection === 'asc' ? 'ascending' : 'descending'
                        : undefined
                    }
                    className={`
                      ${getAlignmentClass(column.align)}
                      ${column.fixed === 'left' ? 'sticky left-0 bg-white dark:bg-neutral-900' : ''}
                      ${column.sortable && sort ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700' : ''}
                    `}
                    style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                  >
                    {column.title}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.map((record, index) => {
                const isSelected = selection ? selection.selectedRowKeys.includes(selection.getRowKey(record)) : false;
                return (
                  <Tr
                    key={selection ? selection.getRowKey(record) : index}
                    hoverable
                    selected={isSelected}
                    onClick={() => onRowClick?.(record, index)}
                    aria-rowindex={index + 2} // +2 for header row and 0-based indexing
                    className={`
                      ${rowClassName?.(record, index) || ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                  >
                    {selection && (
                      <Td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelect(selection.getRowKey(record), e.target.checked)}
                          className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500/50%"
                          aria-label={`Pilih baris ${index + 1}`}
                        />
                      </Td>
                    )}
                    {columns.map((column) => (
                      <Td
                        key={column.key}
                        className={`
                          ${getAlignmentClass(column.align)}
                          ${column.fixed === 'left' ? 'sticky left-0 bg-white dark:bg-neutral-800' : ''}
                        `}
                        data-label={column.title}
                      >
                        {getCellValue(column, record, index)}
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </div>
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;