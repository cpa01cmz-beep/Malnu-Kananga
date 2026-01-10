import React, { useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from './Table';
import Pagination from './Pagination';
import LoadingOverlay from './LoadingOverlay';
import { EmptyState } from './LoadingState';
import Button from './Button';
import { MagnifyingGlassIcon } from '../icons/SearchIcon';
import { FunnelIcon } from '../icons/FunnelIcon';

export interface Column<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface DataTableProps<T = any> {
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
}

const DataTable = <T extends Record<string, any>>({
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
      return column.render(record[column.key], record, index);
    }
    return record[column.key];
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
        className="min-h-[400px]"
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

  return (
    <div className="space-y-4">
      {(filter?.searchable || selection) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {filter?.searchable && (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={filter?.placeholder || 'Search...'}
                  className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50%"
                />
              </div>
            )}
            {sort && (
              <Button
                variant="outline"
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {selection.selectedRowKeys.length} selected
              </span>
              {selection.selectedRowKeys.length > 0 && (
                <Button
                  variant="outline"
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
                        input.indeterminate = isIndeterminate;
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
                    ${column.width ? `w-[${column.width}]` : ''}
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