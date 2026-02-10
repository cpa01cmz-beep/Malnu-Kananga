import React, { useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from './Table';
import Pagination from './Pagination';
import LoadingOverlay from './LoadingOverlay';
import { EmptyState } from './LoadingState';
import Button from './Button';
import SearchInput from './SearchInput';
import Card from './Card';
import FunnelIcon from '../icons/FunnelIcon';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import { HEIGHTS } from '../../config/heights';

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
}: DataTableProps<T>) => {
  const [localSearch, setLocalSearch] = useState(filter?.searchValue || '');

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

  // Mobile Card View Component
  const MobileCardView = () => (
    <div className="space-y-4 sm:hidden">
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
              ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
              ${rowClassName?.(record, index) || ''}
            `}
            onClick={() => onRowClick?.(record, index)}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {selection && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      selection.onSelect(selection.getRowKey(record), e.target.checked);
                    }}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500/50% shrink-0"
                    aria-label={`Select ${titleValue}`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                    {titleValue}
                  </h3>
                </div>
                {onRowClick && (
                  <ChevronLeftIcon className="w-5 h-5 text-neutral-400 rotate-180 flex-shrink-0" />
                )}
              </div>
            </div>
            
            <div className="pt-3 space-y-3">
              {columns
                .filter(col => col.key !== titleColumn)
                .map((column) => {
                  const value = getCellValue(column, record, index);
                  const isEmpty = value === null || value === undefined || value === '';
                  
                  return (
                    <div key={column.key} className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                          {column.title}
                        </p>
                        <p className="text-sm text-neutral-900 dark:text-white break-words">
                          {isEmpty ? (
                            <span className="text-neutral-400 dark:text-neutral-500 italic">-</span>
                          ) : (
                            value
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        );
      })}
    </div>
  );

  const tableClasses = `
    ${scrollX ? 'overflow-x-auto' : ''}
    ${stickyHeader ? 'relative' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  if (loading || error || empty) {
    return (
      <LoadingOverlay
        isLoading={loading}
        message={loading ? 'Loading data...' : undefined}
        className={HEIGHTS.CONTENT.TABLE}
      >
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">Error loading data</div>
            <div className="text-neutral-600 dark:text-neutral-400">{error}</div>
          </div>
        )}
        {empty && !loading && !error && (
          <EmptyState message={emptyMessage} />
        )}
      </LoadingOverlay>
    );
  }

  // Determine if mobile view should be used
  const isMobileView = mobileLayout === 'cards' || (typeof window !== 'undefined' && window.innerWidth < 640 && mobileLayout !== 'table');

  return (
    <div className="space-y-4">
      {(filter?.searchable || selection) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            {filter?.searchable && (
              <SearchInput
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={filter?.placeholder || 'Search...'}
                size="sm"
                fullWidth={true}
                showIcon={true}
                className="sm:max-w-xs"
              />
            )}
            {sort && (
              <Button
                variant="secondary"
                size="sm"
                icon={<FunnelIcon />}
                onClick={() => {
                  // Reset sort
                  sort.onSortChange('', 'asc');
                }}
              >
                Clear Sort
              </Button>
            )}
          </div>
          
          {selection && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {selection.selectedRowKeys.length} selected
              </span>
              {selection.selectedRowKeys.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => selection?.onSelectAll(false)}
                >
                  Clear Selection
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
        <div className={tableClasses}>
          <Table
            size={size}
            variant={variant}
            className={scrollY ? 'w-full' : ''}
            style={scrollY ? { maxHeight: scrollY, overflowY: 'auto' } : undefined}
          >
            <Thead className={stickyHeader ? 'sticky top-0 bg-white dark:bg-neutral-900 z-10' : ''}>
              <Tr>
                {selection && (
                  <Th className="w-12">
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
                      aria-label="Select all rows"
                    />
                  </Th>
                )}
                {columns.map((column) => (
                  <Th
                    key={column.key}
                    sortable={column.sortable && !!sort}
                    sortDirection={sort?.sortKey === column.key ? sort.sortDirection : undefined}
                    onClick={() => column.sortable && handleSort(column)}
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
                          aria-label={`Select row ${index + 1}`}
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