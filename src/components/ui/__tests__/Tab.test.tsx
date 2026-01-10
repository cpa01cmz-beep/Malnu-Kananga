import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tab from './Tab';
import type { TabOption } from './Tab';

describe('Tab', () => {
  const mockOnTabChange = vi.fn();
  const defaultOptions: TabOption[] = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'trends', label: 'Tren Nilai' },
    { id: 'goals', label: 'Target Prestasi' },
  ];

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders all tab options', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
      expect(screen.getByText('Tren Nilai')).toBeInTheDocument();
      expect(screen.getByText('Target Prestasi')).toBeInTheDocument();
    });

    it('renders active tab with active styling', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('bg-green-600', 'text-white');
    });

    it('renders inactive tabs with inactive styling', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const inactiveTab = screen.getByText('Tren Nilai');
      expect(inactiveTab).toHaveClass('bg-neutral-100');
    });

    it('renders tabs with icons when variant is icon', () => {
      const optionsWithIcons: TabOption[] = [
        { id: 'items', label: 'Daftar Barang', icon: () => <span data-testid="icon-test">TestIcon</span> },
        { id: 'maintenance', label: 'Jadwal' },
      ];

      render(
        <Tab
          options={optionsWithIcons}
          activeTab="items"
          onTabChange={mockOnTabChange}
          variant="icon"
        />
      );

      expect(screen.getByTestId('icon-test')).toBeInTheDocument();
    });

    it('renders badge when provided', () => {
      const optionsWithBadge: TabOption[] = [
        { id: 'settings', label: 'Pengaturan' },
        { id: 'batches', label: 'Batch', badge: 3 },
      ];

      render(
        <Tab
          options={optionsWithBadge}
          activeTab="settings"
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByLabelText('3 items')).toBeInTheDocument();
    });

    it('does not render badge when value is 0', () => {
      const optionsWithBadge: TabOption[] = [
        { id: 'settings', label: 'Pengaturan' },
        { id: 'batches', label: 'Batch', badge: 0 },
      ];

      render(
        <Tab
          options={optionsWithBadge}
          activeTab="settings"
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders pill variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('px-4', 'py-2', 'rounded-lg');
    });

    it('renders border variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="border"
          color="blue"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('border-b-2', 'border-blue-500', 'text-blue-600');
    });

    it('renders icon variant correctly', () => {
      const optionsWithIcons: TabOption[] = [
        { id: 'items', label: 'Daftar Barang', icon: () => <span>Icon</span> },
      ];

      render(
        <Tab
          options={optionsWithIcons}
          activeTab="items"
          onTabChange={mockOnTabChange}
          variant="icon"
          color="green"
        />
      );

      const activeTab = screen.getByText('Daftar Barang');
      expect(activeTab).toHaveClass('bg-white', 'dark:bg-neutral-700', 'text-green-600');
    });
  });

  describe('Colors', () => {
    it('applies green color variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('bg-green-600', 'text-white');
    });

    it('applies blue color variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="blue"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('bg-blue-600', 'text-white');
    });

    it('applies purple color variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="purple"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('bg-purple-600', 'text-white');
    });

    it('applies red color variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="red"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('bg-red-600', 'text-white');
    });

    it('applies yellow color variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="yellow"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('bg-yellow-500', 'text-white');
    });

    it('applies neutral color variant correctly', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="neutral"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveClass('bg-neutral-800', 'text-white');
    });
  });

  describe('Interactions', () => {
    it('calls onTabChange when tab is clicked', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      fireEvent.click(screen.getByText('Tren Nilai'));
      expect(mockOnTabChange).toHaveBeenCalledWith('trends');
    });

    it('does not call onTabChange when disabled tab is clicked', () => {
      const optionsWithDisabled: TabOption[] = [
        { id: 'overview', label: 'Ringkasan' },
        { id: 'trends', label: 'Tren Nilai', disabled: true },
      ];

      render(
        <Tab
          options={optionsWithDisabled}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      fireEvent.click(screen.getByText('Tren Nilai'));
      expect(mockOnTabChange).not.toHaveBeenCalled();
    });

    it('updates active tab state when clicked', () => {
      const { rerender } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const overviewTab = screen.getByText('Ringkasan');
      expect(overviewTab).toHaveClass('bg-green-600');

      rerender(
        <Tab
          options={defaultOptions}
          activeTab="trends"
          onTabChange={mockOnTabChange}
        />
      );

      const trendsTab = screen.getByText('Tren Nilai');
      expect(trendsTab).toHaveClass('bg-green-600');
    });
  });

  describe('Accessibility', () => {
    it('has role="tablist" on container', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
    });

    it('sets role="tab" on each tab button', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('sets aria-selected for active tab', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-selected="false" for inactive tabs', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const inactiveTab = screen.getByText('Tren Nilai');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    });

    it('sets aria-controls for each tab', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const overviewTab = screen.getByText('Ringkasan');
      expect(overviewTab).toHaveAttribute('aria-controls', 'panel-overview');
    });

    it('sets tabIndex for keyboard navigation', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      expect(activeTab).toHaveAttribute('tabIndex', '0');

      const inactiveTab = screen.getByText('Tren Nilai');
      expect(inactiveTab).toHaveAttribute('tabIndex', '-1');
    });

    it('responds to Enter key', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const inactiveTab = screen.getByText('Tren Nilai');
      fireEvent.keyDown(inactiveTab, { key: 'Enter' });
      expect(mockOnTabChange).toHaveBeenCalledWith('trends');
    });

    it('responds to Space key', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const inactiveTab = screen.getByText('Tren Nilai');
      fireEvent.keyDown(inactiveTab, { key: ' ' });
      expect(mockOnTabChange).toHaveBeenCalledWith('trends');
    });

    it('sets disabled attribute on disabled tabs', () => {
      const optionsWithDisabled: TabOption[] = [
        { id: 'overview', label: 'Ringkasan' },
        { id: 'trends', label: 'Tren Nilai', disabled: true },
      ];

      render(
        <Tab
          options={optionsWithDisabled}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const disabledTab = screen.getByText('Tren Nilai');
      expect(disabledTab).toHaveAttribute('disabled');
    });
  });

  describe('Orientation', () => {
    it('renders horizontal orientation by default', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="horizontal"
        />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toHaveClass('flex');
    });

    it('renders vertical orientation when specified', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="vertical"
        />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toHaveClass('flex', 'flex-col');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          className="custom-class"
        />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist?.parentElement).toHaveClass('custom-class');
    });
  });

  describe('Dark mode', () => {
    it('applies dark mode classes for inactive tabs', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const inactiveTab = screen.getByText('Tren Nilai');
      expect(inactiveTab).toHaveClass('dark:bg-neutral-700', 'dark:text-neutral-300');
    });

    it('applies dark mode classes for active tabs in border variant', () => {
      const { container } = render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="border"
          color="blue"
        />
      );

      const inactiveTab = screen.getByText('Tren Nilai');
      expect(inactiveTab).toHaveClass('dark:text-neutral-400', 'dark:hover:text-neutral-200');
    });
  });
});
