import React, { useState, useMemo, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/MaterialIcons';
import { Table, Thead, Tbody, Th, Tr, Td, TableSize, TableVariant } from './Table';

export interface EnhancedTableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface EnhancedTableProps<T> {
  data: T[];
  columns: EnhancedTableColumn<T>[];
  size?: TableSize;
  variant?: TableVariant;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (column: keyof T, value: string) => void;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  uniqueKey?: keyof T;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
}

type SortState = {
  column: string;
  direction: 'asc' | 'desc';
} | null;

type FilterState = Record<string, string>;

function EnhancedTable<T extends Record<string, string | number | boolean>>({
  data,
  columns,
  size = 'md',
  variant = 'default',
  className = '',
  searchable = true,
  searchPlaceholder = 'Cari data...',
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'Tidak ada data tersedia',
  onRowClick,
  onSort,
  onFilter,
  onSearch,
  onPageChange,
  uniqueKey = 'id' as keyof T,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
}: EnhancedTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortState>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFilters, setExpandedFilters] = useState(false);

  // Filter and search logic
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
        result = result.filter(row =>
          columns.some(column => {
            const value = row[column.key] as string | number | boolean | null | undefined;
            return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
          })
        );
    }

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      result = result.filter(row => {
        const rowValue = row[key as keyof T];
        return rowValue && String(rowValue).toLowerCase().includes(value.toLowerCase());
      });
    }
  });

    // Apply sorting
    if (sort) {
      result.sort((a, b) => {
        const aValue = a[sort.column as keyof T];
        const bValue = b[sort.column as keyof T];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = String(aValue).localeCompare(String(bValue));
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, filters, sort, columns]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!paginated) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Event handlers
  const handleSort = useCallback((column: keyof T) => {
    if (!sortable || !columns.find(c => c.key === column)?.sortable) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (sort?.column === column && sort.direction === 'asc') {
      newDirection = 'desc';
    }

    const newSort = { column: String(column), direction: newDirection };
    setSort(newSort);
    onSort?.(column, newDirection);
  }, [sortable, columns, sort, onSort]);

  const handleFilter = useCallback((column: keyof T, value: string) => {
    if (!filterable || !columns.find(c => c.key === column)?.filterable) return;

    const newFilters = { ...filters, [String(column)]: value };
    setFilters(newFilters);
    onFilter?.(column, value);
    setCurrentPage(1);
  }, [filterable, columns, filters, onFilter]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
    setCurrentPage(1);
  }, [onSearch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  const handleRowSelection = useCallback((row: T) => {
    if (!selectable || !onSelectionChange) return;

    const isSelected = selectedRows.some(r => r[uniqueKey] === row[uniqueKey]);
    let newSelection: T[];

    if (isSelected) {
      newSelection = selectedRows.filter(r => r[uniqueKey] !== row[uniqueKey]);
    } else {
      newSelection = [...selectedRows, row];
    }

    onSelectionChange(newSelection);
  }, [selectable, selectedRows, uniqueKey, onSelectionChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
          )}

          {filterable && (
            <button
              onClick={() => setExpandedFilters(!expandedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                expandedFilters
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filter</span>
              {Object.values(filters).some(v => v) && (
                <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      {expandedFilters && filterable && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
          {columns.filter(col => col.filterable).map(column => (
            <div key={String(column.key)}>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {column.label}
              </label>
              <input
                type="text"
                placeholder={`Filter ${column.label}...`}
                value={filters[String(column.key)] || ''}
                onChange={(e) => handleFilter(column.key, e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <Table size={size} variant={variant} className="w-full">
          <Thead>
            <Tr>
              {selectable && (
                <Th scope="col" className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectionChange?.(data);
                      } else {
                        onSelectionChange?.([]);
                      }
                    }}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </Th>
              )}
              {columns.map((column) => (
                <Th
                  key={String(column.key)}
                  scope="col"
                  sortable={sortable && column.sortable}
                  sortDirection={sort?.column === column.key ? sort.direction : undefined}
                  className={column.className}
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <Tr key={`skeleton-${index}`}>
                  {selectable && (
                    <Td>
                      <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    </Td>
                  )}
                  {columns.map((column) => (
                    <Td key={String(column.key)}>
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    </Td>
                  ))}
                </Tr>
              ))
            ) : paginatedData.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  {emptyMessage}
                </Td>
              </Tr>
            ) : (
              paginatedData.map((row, index) => (
                <Tr
                  key={String(row[uniqueKey])}
                  hoverable={!!onRowClick}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {selectable && (
                    <Td>
                      <input
                        type="checkbox"
                        checked={selectedRows.some(r => r[uniqueKey] === row[uniqueKey])}
                        onChange={() => handleRowSelection(row)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </Td>
                  )}
                  {columns.map((column) => (
                    <Td key={String(column.key)} className={column.className}>
                      {column.render ? column.render(row[column.key], row, index) : String(row[column.key] || '')}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Menampilkan {(currentPage - 1) * pageSize + 1} hingga {Math.min(currentPage * pageSize, processedData.length)} dari {processedData.length} data
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      pageNum === currentPage
                        ? 'bg-primary-500 text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedTable;