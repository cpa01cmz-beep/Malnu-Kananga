import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardActionCard from '../DashboardActionCard';

describe('DashboardActionCard', () => {
  it('renders correctly with all props', () => {
    render(
      <DashboardActionCard
        icon={<span data-testid="icon">Icon</span>}
        title="Test Title"
        description="Test Description"
        colorTheme="blue"
        onClick={vi.fn()}
        ariaLabel="Test card"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with primary color theme by default', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        onClick={vi.fn()}
      />
    );

    const iconContainer = screen.getByText('Icon').parentElement;
    expect(iconContainer).toHaveClass('bg-primary-100');
  });

  it('renders with different color themes', () => {
    const { rerender } = render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        colorTheme="green"
        onClick={vi.fn()}
      />
    );

    let iconContainer = screen.getByText('Icon').parentElement;
    expect(iconContainer).toHaveClass('bg-green-100');

    rerender(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        colorTheme="purple"
        onClick={vi.fn()}
      />
    );

    iconContainer = screen.getByText('Icon').parentElement;
    expect(iconContainer).toHaveClass('bg-purple-100');
  });

  it('renders with status badge', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        statusBadge="Online"
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders with offline state', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        isOnline={false}
        offlineBadge="Offline"
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('Memerlukan koneksi internet')).toBeInTheDocument();
  });

  it('renders with extra role badge', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        isExtraRole={true}
        extraRoleBadge="Extra"
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        onClick={handleClick}
        ariaLabel="Click me"
      />
    );

    const button = screen.getByLabelText('Click me');
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        disabled={true}
        onClick={handleClick}
      />
    );

    const card = screen.getByRole('button');
    card.click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when offline', () => {
    const handleClick = vi.fn();
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        isOnline={false}
        onClick={handleClick}
      />
    );

    const card = screen.getByRole('button');
    card.click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled styling when offline', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        isOnline={false}
        onClick={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('opacity-60', 'cursor-not-allowed');
  });

  it('applies disabled styling when explicitly disabled', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        disabled={true}
        onClick={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('opacity-60', 'cursor-not-allowed');
  });

  it('applies custom className', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        className="custom-class"
        onClick={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('custom-class');
  });

  it('renders with gradient variant', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        variant="gradient"
        gradient={{ from: 'from-blue-50', to: 'to-indigo-50' }}
        onClick={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('from-blue-50', 'to-indigo-50');
  });

  it('has proper ARIA attributes', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        ariaLabel="Open settings"
        onClick={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Open settings');
  });

  it('renders title as aria-label when not provided', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test Title"
        description="Desc"
        onClick={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Test Title');
  });

  it('renders multiple badges correctly', () => {
    render(
      <DashboardActionCard
        icon={<span>Icon</span>}
        title="Test"
        description="Desc"
        statusBadge="Active"
        isExtraRole={true}
        extraRoleBadge="OSIS"
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('OSIS')).toBeInTheDocument();
  });

  it('renders all color themes', () => {
    const themes: Array<'primary' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'indigo' | 'red'> = [
      'primary', 'blue', 'green', 'purple', 'orange', 'teal', 'indigo', 'red'
    ];

    themes.forEach(theme => {
      const { unmount } = render(
        <DashboardActionCard
          icon={<span>Icon</span>}
          title="Test"
          description="Desc"
          colorTheme={theme}
          onClick={vi.fn()}
        />
      );

      const iconContainer = screen.getByText('Icon').parentElement;
      expect(iconContainer).toBeInTheDocument();
      unmount();
    });
  });
});
