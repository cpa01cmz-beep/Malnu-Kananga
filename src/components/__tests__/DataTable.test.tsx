// DataTable.test.tsx - Tests for DataTable component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable, { Column } from '../ui/DataTable';

type TestData = Record<string, unknown>;

describe('DataTable Component', () => {
  const mockColumns: Column<TestData>[] = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'age', title: 'Age', sortable: true },
    { key: 'status', title: 'Status' },
  ];

  const mockData: TestData[] = [
    { id: '1', name: 'John Doe', age: 25, status: 'Active' },
    { id: '2', name: 'Jane Smith', age: 30, status: 'Inactive' },
    { id: '3', name: 'Bob Wilson', age: 35, status: 'Active' },
  ];

  const mockOnPageChange = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnSortChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table with data', () => {
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
        />
      );
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
        />
      );
      
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      render(
        <DataTable 
          data={[]} 
          columns={mockColumns}
          empty={true}
          emptyMessage="No data available"
        />
      );
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(
        <DataTable 
          data={[]} 
          columns={mockColumns}
          loading={true}
        />
      );
      
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    it('should render error state', () => {
      render(
        <DataTable 
          data={[]} 
          columns={mockColumns}
          error="Failed to load data"
        />
      );
      
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should render sortable columns with sort indicator', () => {
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          sort={{
            sortKey: 'name',
            sortDirection: 'asc',
            onSortChange: mockOnSortChange,
          }}
        />
      );
      
      const sortableHeaders = screen.getAllByRole('button', { name: '' });
      expect(sortableHeaders.length).toBeGreaterThan(0);
    });

    it('should call onSortChange when clicking sortable header', async () => {
      const user = userEvent.setup();
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          sort={{
            sortKey: '',
            sortDirection: 'asc',
            onSortChange: mockOnSortChange,
          }}
        />
      );
      
      const nameHeader = screen.getByText('Name').closest('th') || screen.getByText('Name');
      await user.click(nameHeader);
      
      expect(mockOnSortChange).toHaveBeenCalled();
    });
  });

  describe('Search', () => {
    it('should render search input when searchable is true', () => {
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          filter={{
            searchable: true,
            onSearch: mockOnSearch,
            placeholder: 'Search...',
          }}
        />
      );
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should call onSearch when typing in search input', async () => {
      const user = userEvent.setup();
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          filter={{
            searchable: true,
            onSearch: mockOnSearch,
          }}
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'John');
      
      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should render pagination when provided', () => {
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          pagination={{
            currentPage: 1,
            totalPages: 5,
            totalItems: 50,
            itemsPerPage: 10,
            onPageChange: mockOnPageChange,
          }}
        />
      );
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should call onPageChange when clicking next page', async () => {
      const user = userEvent.setup();
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          pagination={{
            currentPage: 1,
            totalPages: 5,
            totalItems: 50,
            itemsPerPage: 10,
            onPageChange: mockOnPageChange,
          }}
        />
      );
      
      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Selection', () => {
    it('should render checkboxes when selection is enabled', () => {
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          selection={{
            selectedRowKeys: [],
            onSelectAll: vi.fn(),
            onSelect: vi.fn(),
            getRowKey: (record) => String(record.id),
          }}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should display selected row count', () => {
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          selection={{
            selectedRowKeys: ['1', '2'],
            onSelectAll: vi.fn(),
            onSelect: vi.fn(),
            getRowKey: (record) => String(record.id),
          }}
        />
      );
      
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('should render custom cell content', () => {
      const columnsWithRender: Column<TestData>[] = [
        { 
          key: 'status', 
          title: 'Status',
          render: (value) => `<${value}>` 
        },
      ];
      
      render(
        <DataTable 
          data={[{ id: '1', name: 'Test', age: 20, status: 'Active' }]} 
          columns={columnsWithRender}
        />
      );
      
      expect(screen.getByText('<Active>')).toBeInTheDocument();
    });
  });

  describe('Row Interaction', () => {
    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const mockRowClick = vi.fn();
      
      render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          onRowClick={mockRowClick}
        />
      );
      
      const row = screen.getByText('John Doe').closest('tr');
      if (row) {
        await user.click(row);
        expect(mockRowClick).toHaveBeenCalled();
      }
    });
  });

  describe('Size Variants', () => {
    it('should render small size table', () => {
      const { container } = render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          size="sm"
        />
      );
      
      expect(container.querySelector('.text-xs')).toBeInTheDocument();
    });

    it('should render large size table', () => {
      const { container } = render(
        <DataTable 
          data={mockData} 
          columns={mockColumns}
          size="lg"
        />
      );
      
      expect(container.querySelector('.text-lg')).toBeInTheDocument();
    });
  });
});
