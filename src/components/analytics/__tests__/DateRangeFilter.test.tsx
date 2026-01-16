import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DateRangeFilter from '../DateRangeFilter';
import type { AnalyticsFilters } from '../../../types/analytics.types';

describe('DateRangeFilter', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnApplyFilters = vi.fn();

  const defaultFilters: AnalyticsFilters = {
    dateRange: {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      label: 'Test Range',
    },
    role: 'admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render filter component', () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    expect(screen.getByText('Date Range:')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
  });

  it('should display selected date range', () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    expect(screen.getByText(/1 Jan 2026/)).toBeInTheDocument();
    expect(screen.getByText(/31 Jan 2026/)).toBeInTheDocument();
  });

  it('should call onFiltersChange when preset is selected', () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    const last7DaysButton = screen.getByText('Last 7 Days');
    fireEvent.click(last7DaysButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: expect.objectContaining({
          label: 'Last 7 Days',
        }),
      }),
    );
  });

  it('should call onApplyFilters when Apply Filters button is clicked', () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    expect(mockOnApplyFilters).toHaveBeenCalled();
  });

  it('should open calendar when Custom is clicked', async () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });
  });

  it('should apply custom date range', async () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    await waitFor(() => {
      const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
      const endDateInput = screen.getByLabelText('End Date') as HTMLInputElement;

      fireEvent.change(startDateInput, { target: { value: '2026-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2026-01-15' } });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: expect.objectContaining({
            startDate: '2026-01-01',
            endDate: '2026-01-15',
            label: 'Custom',
          }),
        }),
      );
    });
  });

  it('should disable Apply button for invalid date range', async () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    await waitFor(() => {
      const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
      const endDateInput = screen.getByLabelText('End Date') as HTMLInputElement;

      fireEvent.change(startDateInput, { target: { value: '2026-01-15' } });
      fireEvent.change(endDateInput, { target: { value: '2026-01-01' } });

      const applyButton = screen.getByText('Apply');
      expect(applyButton).toBeDisabled();
    });
  });

  it('should close calendar when Cancel is clicked', async () => {
    render(
      <DateRangeFilter
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByLabelText('Start Date')).not.toBeInTheDocument();
    });
  });

  it('should highlight active preset', () => {
    const filters: AnalyticsFilters = {
      dateRange: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        label: 'Today',
      },
      role: 'admin',
    };

    render(
      <DateRangeFilter
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        onApplyFilters={mockOnApplyFilters}
      />,
    );

    const todayButton = screen.getByText('Today');
    expect(todayButton).toHaveClass('bg-blue-600');
  });
});
