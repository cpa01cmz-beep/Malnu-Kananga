 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataTable from '../DataTable';

// Mock icons
vi.mock('../../icons/FunnelIcon', () => ({
  default: () => <div data-testid="funnel-icon">Filter</div>,
}));

interface TestData extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

const mockColumns = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    render: (value: unknown) => (
      <span className={`badge ${(value as string) === 'active' ? 'badge-success' : 'badge-danger'}`}>
        {value as string}
      </span>
    ),
  },
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<DataTable data={[]} columns={mockColumns} loading={true} />);
    
    expect(screen.getByText(/Memuat data/i)).toBeInTheDocument();
  });

  it('displays empty state', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        empty={true}
        emptyMessage="No users found"
      />
    );
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('displays error state', () => {
    render(<DataTable data={[]} columns={mockColumns} error="Failed to load data" />);
    
    expect(screen.getByText(/Terjadi Kesalahan/i)).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const mockSearch = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        filter={{
          searchable: true,
          onSearch: mockSearch,
        }}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/Cari data/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('John');
    });
  });

  it('handles sorting', async () => {
    const mockSort = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        sort={{
          sortKey: '',
          sortDirection: 'asc',
          onSortChange: mockSort,
        }}
      />
    );
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    await waitFor(() => {
      expect(mockSort).toHaveBeenCalledWith('name', 'asc');
    });
  });

  it('handles row selection', async () => {
    const mockOnSelect = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        selection={{
          selectedRowKeys: [],
          onSelectAll: vi.fn(),
          onSelect: mockOnSelect,
          getRowKey: (record: TestData) => record.id,
        }}
      />
    );
    
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]; // Skip 'select all' checkbox
    fireEvent.click(firstRowCheckbox);
    
    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith('1', true);
    });
  });

  it('handles pagination', async () => {
    const mockOnPageChange = vi.fn();
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
    
    const nextPageButton = screen.getByLabelText('Next page');
    fireEvent.click(nextPageButton);
    
    await waitFor(() => {
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  it('handles row click', async () => {
    const mockOnRowClick = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onRowClick={mockOnRowClick}
      />
    );
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow!);
    
    await waitFor(() => {
      expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0], 0);
    });
  });

  it('renders custom cell content', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const statusCells = screen.getAllByText('active');
    expect(statusCells[0]).toHaveClass('badge-success');
  });

  it('handles select all functionality', async () => {
    const mockOnSelectAll = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        selection={{
          selectedRowKeys: [],
          onSelectAll: mockOnSelectAll,
          onSelect: vi.fn(),
          getRowKey: (record: TestData) => record.id,
        }}
      />
    );
    
    const selectAllCheckbox = screen.getByLabelText(/Pilih semua baris/i);
    fireEvent.click(selectAllCheckbox);
    
    await waitFor(() => {
      expect(mockOnSelectAll).toHaveBeenCalledWith(true);
    });
  });

  describe('Keyboard shortcuts', () => {
    it('focuses search input when Ctrl+F is pressed', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          filter={{
            searchable: true,
            onSearch: vi.fn(),
          }}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Cari data/i);
      
      // Press Ctrl+F
      fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
      
      // Search input should be focused
      expect(searchInput).toHaveFocus();
    });

    it('focuses search input when Cmd+F is pressed (Mac)', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          filter={{
            searchable: true,
            onSearch: vi.fn(),
          }}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Cari data/i);
      
      // Press Cmd+F (Mac shortcut)
      fireEvent.keyDown(document, { key: 'f', metaKey: true });
      
      // Search input should be focused
      expect(searchInput).toHaveFocus();
    });

    it('does not focus search when Ctrl+F is pressed inside a modal', () => {
      // Create a modal container
      const modalContainer = document.createElement('div');
      modalContainer.setAttribute('role', 'dialog');
      document.body.appendChild(modalContainer);
      
      // Create an input inside the modal and focus it
      const modalInput = document.createElement('input');
      modalContainer.appendChild(modalInput);
      modalInput.focus();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          filter={{
            searchable: true,
            onSearch: vi.fn(),
          }}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Cari data/i);
      
      // Press Ctrl+F while modal is active
      fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
      
      // Search input should NOT be focused (modal input should remain focused)
      expect(searchInput).not.toHaveFocus();
      
      // Cleanup
      document.body.removeChild(modalContainer);
    });

    it('does not add keyboard listener when searchable is false', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
        />
      );

      // Press Ctrl+F - should not throw error even without search
      expect(() => {
        fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
      }).not.toThrow();
    });
  });
});