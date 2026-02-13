 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tab from '../Tab';
import type { TabOption } from '../Tab';

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
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-white', 'z-10');
    });

    it('renders inactive tabs with inactive styling', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const inactiveTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      expect(inactiveTab).toHaveClass('bg-neutral-100', 'z-10');
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
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('px-4', 'py-2', 'rounded-lg');
    });

    it('renders border variant correctly', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="border"
          color="blue"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-blue-600', 'z-10');
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

      const activeTab = screen.getByRole('tab', { name: /Daftar Barang/i });
      expect(activeTab).toHaveClass('bg-white', 'dark:bg-neutral-700', 'text-green-600');
    });
  });

  describe('Colors', () => {
    it('applies green color variant correctly', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-white', 'z-10');
    });

    it('applies blue color variant correctly', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="blue"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-white', 'z-10');
    });

    it('applies purple color variant correctly', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="purple"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-white', 'z-10');
    });

    it('applies red color variant correctly', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="red"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-white', 'z-10');
    });

    it('applies yellow color variant correctly', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="yellow"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-white', 'z-10');
    });

    it('applies neutral color variant correctly', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="neutral"
        />
      );

      const activeTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(activeTab).toHaveClass('text-white', 'z-10');
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

      const overviewTab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(overviewTab).toHaveClass('text-white');

      rerender(
        <Tab
          options={defaultOptions}
          activeTab="trends"
          onTabChange={mockOnTabChange}
        />
      );

      const trendsTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      expect(trendsTab).toHaveClass('text-white');
    });
  });

  describe('Accessibility', () => {
    it('has role="tablist" on container', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
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

      const activeTabButton = screen.getByRole('tab', { selected: true });
      expect(activeTabButton).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-selected="false" for inactive tabs', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const inactiveTabs = screen.getAllByRole('tab', { selected: false });
      expect(inactiveTabs.length).toBeGreaterThan(0);
      inactiveTabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('sets aria-controls for each tab', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const overviewTab = screen.getByRole('tab', { name: /Ringkasan/i });
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

      const activeTab = screen.getByRole('tab', { selected: true });
      expect(activeTab).toHaveAttribute('tabIndex', '0');

      const inactiveTab = screen.getAllByRole('tab', { selected: false })[0];
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

      const inactiveTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      fireEvent.click(inactiveTab);
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

      const inactiveTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      fireEvent.click(inactiveTab);
      expect(mockOnTabChange).toHaveBeenCalledWith('trends');
    });

    it('responds to ArrowRight key for horizontal orientation', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="horizontal"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      fireEvent.keyDown(activeTab, { key: 'ArrowRight' });
      expect(mockOnTabChange).toHaveBeenCalledWith('trends');
    });

    it('responds to ArrowLeft key for horizontal orientation', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="trends"
          onTabChange={mockOnTabChange}
          orientation="horizontal"
        />
      );

      const activeTab = screen.getByText('Tren Nilai');
      fireEvent.keyDown(activeTab, { key: 'ArrowLeft' });
      expect(mockOnTabChange).toHaveBeenCalledWith('overview');
    });

    it('responds to ArrowDown key for vertical orientation', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="vertical"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      fireEvent.keyDown(activeTab, { key: 'ArrowDown' });
      expect(mockOnTabChange).toHaveBeenCalledWith('trends');
    });

    it('responds to ArrowUp key for vertical orientation', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="trends"
          onTabChange={mockOnTabChange}
          orientation="vertical"
        />
      );

      const activeTab = screen.getByText('Tren Nilai');
      fireEvent.keyDown(activeTab, { key: 'ArrowUp' });
      expect(mockOnTabChange).toHaveBeenCalledWith('overview');
    });

    it('skips disabled tabs when navigating with arrow keys', () => {
      const optionsWithDisabled: TabOption[] = [
        { id: 'overview', label: 'Ringkasan' },
        { id: 'trends', label: 'Tren Nilai', disabled: true },
        { id: 'goals', label: 'Target Prestasi' },
      ];

      render(
        <Tab
          options={optionsWithDisabled}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="horizontal"
        />
      );

      const activeTab = screen.getByText('Ringkasan');
      fireEvent.keyDown(activeTab, { key: 'ArrowRight' });
      expect(mockOnTabChange).toHaveBeenCalledWith('goals');
    });

    it('has aria-label on tablist', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Tabs');
    });

    it('uses custom aria-label when provided', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          aria-label="Main Navigation"
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Main Navigation');
    });

    it('has aria-orientation="horizontal" by default', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('has aria-orientation="vertical" when orientation is vertical', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="vertical"
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
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

      const disabledTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      expect(disabledTab).toBeDisabled();
    });
  });

  describe('Orientation', () => {
    it('renders horizontal orientation by default', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="horizontal"
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('flex');
    });

    it('renders vertical orientation when specified', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="vertical"
        />
      );

      const tablist = screen.getByRole('tablist');
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

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Dark mode', () => {
    it('applies dark mode classes for inactive tabs', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="pill"
          color="green"
        />
      );

      const inactiveTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      expect(inactiveTab).toHaveClass('dark:bg-neutral-700', 'dark:text-neutral-300');
    });

    it('applies dark mode classes for active tabs in border variant', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          variant="border"
          color="blue"
        />
      );

      const inactiveTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      expect(inactiveTab).toHaveClass('dark:text-neutral-400', 'dark:hover:text-neutral-200');
    });
  });

  describe('Keyboard shortcut hint', () => {
    it('renders keyboard navigation hint tooltip when showKeyboardHint is true', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="horizontal"
        />
      );

      const tab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(tab).toBeInTheDocument();
    });

    it('shows horizontal arrow keys for horizontal orientation', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="horizontal"
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('shows vertical arrow keys for vertical orientation', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
          orientation="vertical"
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('does not show keyboard shortcut for disabled tabs', () => {
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

      const disabledTab = screen.getByRole('tab', { name: /Tren Nilai/i });
      expect(disabledTab).toBeDisabled();
    });

    it('has event handlers for keyboard shortcut hint on enabled tabs', () => {
      render(
        <Tab
          options={defaultOptions}
          activeTab="overview"
          onTabChange={mockOnTabChange}
        />
      );

      const tab = screen.getByRole('tab', { name: /Ringkasan/i });
      expect(tab).toHaveAttribute('tabindex', '0');
    });
  });
});
