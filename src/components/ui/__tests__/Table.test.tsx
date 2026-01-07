import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td } from '../Table';

describe('Table Component', () => {
  describe('Table - Root Component', () => {
    it('renders table with default props', () => {
      render(
        <Table>
          <Tbody>
            <Tr><Td>Test</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('w-full');
      expect(table).toHaveClass('text-sm');
    });

    it('renders with custom size', () => {
      render(
        <Table size="lg">
          <Tbody><Tr><Td>Test</Td></Tr></Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('text-base');
    });

    it('renders with striped variant', () => {
      render(
        <Table variant="striped">
          <Tbody><Tr><Td>Test</Td></Tr></Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('divide-y');
    });

    it('renders with bordered variant', () => {
      render(
        <Table variant="bordered">
          <Tbody><Tr><Td>Test</Td></Tr></Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('border-x');
    });

    it('renders with custom className', () => {
      render(
        <Table className="custom-class">
          <Tbody><Tr><Td>Test</Td></Tr></Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('custom-class');
    });

    it('has proper accessibility attributes', () => {
      render(
        <Table ariaLabel="Student list" description="List of all students">
          <Tbody><Tr><Td>Test</Td></Tr></Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Student list');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Table ref={ref}>
          <Tbody><Tr><Td>Test</Td></Tr></Tbody>
        </Table>
      );
      
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Thead Component', () => {
    it('renders table header', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th>Header</Th></Tr>
          </Thead>
          <Tbody><Tr><Td>Data</Td></Tr></Tbody>
        </Table>
      );
      
      const rowgroups = screen.getAllByRole('rowgroup');
      expect(rowgroups).toHaveLength(2);
    });

    it('has proper styling classes', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th>Header</Th></Tr>
          </Thead>
        </Table>
      );
      
      const table = screen.getByRole('table');
      const tableHTML = table.innerHTML;
      expect(tableHTML).toContain('bg-neutral-50');
    });
  });

  describe('Tbody Component', () => {
    it('renders table body', () => {
      render(
        <Table>
          <Tbody>
            <Tr><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const tbody = screen.getByRole('rowgroup');
      expect(tbody).toBeInTheDocument();
    });
  });

  describe('Tfoot Component', () => {
    it('renders table footer', () => {
      render(
        <Table>
          <Tbody><Tr><Td>Data</Td></Tr></Tbody>
          <Tfoot>
            <Tr><Td>Footer</Td></Tr>
          </Tfoot>
        </Table>
      );
      
      const rowgroups = screen.getAllByRole('rowgroup');
      expect(rowgroups).toHaveLength(2);
    });

    it('has footer styling', () => {
      render(
        <Table>
          <Tbody><Tr><Td>Data</Td></Tr></Tbody>
          <Tfoot>
            <Tr><Td>Footer</Td></Tr>
          </Tfoot>
        </Table>
      );
      
      const table = screen.getByRole('table');
      const tableHTML = table.innerHTML;
      expect(tableHTML).toContain('border-t-2');
    });
  });

  describe('Tr Component', () => {
    it('renders table row', () => {
      render(
        <Table>
          <Tbody>
            <Tr><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const row = screen.getByRole('row');
      expect(row).toBeInTheDocument();
    });

    it('applies hover effect by default', () => {
      render(
        <Table>
          <Tbody>
            <Tr><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const row = screen.getByRole('row');
      expect(row).toHaveClass('hover:bg-neutral-50');
    });

    it('can disable hover effect', () => {
      render(
        <Table>
          <Tbody>
            <Tr hoverable={false}><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const row = screen.getByRole('row');
      expect(row).not.toHaveClass('hover:bg-neutral-50');
    });

    it('shows selected state', () => {
      render(
        <Table>
          <Tbody>
            <Tr selected><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const row = screen.getByRole('row');
      expect(row).toHaveClass('bg-primary-50');
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('has custom className', () => {
      render(
        <Table>
          <Tbody>
            <Tr className="custom-row"><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const row = screen.getByRole('row');
      expect(row).toHaveClass('custom-row');
    });
  });

  describe('Th Component', () => {
    it('renders table header cell', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th scope="col">Name</Th></Tr>
          </Thead>
          <Tbody><Tr><Td>John</Td></Tr></Tbody>
        </Table>
      );
      
      const th = screen.getByRole('columnheader');
      expect(th).toBeInTheDocument();
      expect(th).toHaveTextContent('Name');
    });

    it('has correct scope attribute', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th scope="col">Name</Th></Tr>
          </Thead>
        </Table>
      );
      
      const th = screen.getByRole('columnheader');
      expect(th).toHaveAttribute('scope', 'col');
    });

    it('shows sortable indicator', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th sortable sortDirection="asc">Name</Th></Tr>
          </Thead>
        </Table>
      );
      
      const th = screen.getByRole('columnheader');
      expect(th).toHaveAttribute('aria-sort', 'ascending');
      
      const sortIcon = th.querySelector('svg');
      expect(sortIcon).toBeInTheDocument();
    });

    it('has cursor-pointer for sortable headers', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th sortable>Name</Th></Tr>
          </Thead>
        </Table>
      );
      
      const th = screen.getByRole('columnheader');
      expect(th).toHaveClass('cursor-pointer');
    });

    it('applies proper padding', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th>Name</Th></Tr>
          </Thead>
        </Table>
      );
      
      const th = screen.getByRole('columnheader');
      expect(th).toHaveClass('px-6');
    });
  });

  describe('Td Component', () => {
    it('renders table data cell', () => {
      render(
        <Table>
          <Tbody>
            <Tr><Td>John Doe</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const td = screen.getByRole('cell');
      expect(td).toBeInTheDocument();
      expect(td).toHaveTextContent('John Doe');
    });

    it('has role="cell" for accessibility', () => {
      render(
        <Table>
          <Tbody>
            <Tr><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const td = screen.getByRole('cell');
      expect(td).toHaveAttribute('role', 'cell');
    });

    it('applies proper padding', () => {
      render(
        <Table>
          <Tbody>
            <Tr><Td>Data</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const td = screen.getByRole('cell');
      expect(td).toHaveClass('px-6');
    });
  });

  describe('Integration - Complete Table', () => {
    it('renders a complete accessible table', () => {
      render(
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table ariaLabel="Student grades" description="List of student grades for this semester">
              <Thead>
                <Tr>
                  <Th scope="col">Name</Th>
                  <Th scope="col">Subject</Th>
                  <Th scope="col">Grade</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>John Doe</Td>
                  <Td>Mathematics</Td>
                  <Td>A</Td>
                </Tr>
                <Tr>
                  <Td>Jane Smith</Td>
                  <Td>Mathematics</Td>
                  <Td>B</Td>
                </Tr>
              </Tbody>
              <Tfoot>
                <Tr>
                  <Td colSpan={3}>Total Students: 2</Td>
                </Tr>
              </Tfoot>
            </Table>
          </div>
        </div>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Student grades');
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(3);
      
      const cells = screen.getAllByRole('cell');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('renders striped table with hover effects', () => {
      render(
        <Table variant="striped">
          <Thead>
            <Tr><Th scope="col">Name</Th></Tr>
          </Thead>
          <Tbody>
            <Tr><Td>John</Td></Tr>
            <Tr><Td>Jane</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('divide-y');
      
      const rows = screen.getAllByRole('row');
      const dataRows = rows.filter(row => row.textContent && !row.textContent.includes('Name'));
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-neutral-50');
      });
    });

    it('supports selected rows', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th scope="col">Name</Th></Tr>
          </Thead>
          <Tbody>
            <Tr selected><Td>John</Td></Tr>
            <Tr><Td>Jane</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const rows = screen.getAllByRole('row');
      const selectedRow = rows.find(row => row.textContent === 'John');
      expect(selectedRow).toHaveClass('bg-primary-50');
      expect(selectedRow).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Dark Mode Support', () => {
    it('renders with dark mode classes', () => {
      render(
        <Table>
          <Thead>
            <Tr><Th scope="col">Name</Th></Tr>
          </Thead>
          <Tbody>
            <Tr><Td>John</Td></Tr>
          </Tbody>
        </Table>
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('dark:text-neutral-300');
      
      const tableHTML = table.innerHTML;
      expect(tableHTML).toContain('dark:bg-neutral-700');
    });
  });
});
