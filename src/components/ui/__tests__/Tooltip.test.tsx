import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Tooltip from '../Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('should render children without tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should show tooltip on mouse enter after delay', async () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button', { name: 'Hover me' });
    fireEvent.mouseEnter(button);
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip text" delay={100} hideDelay={50}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button', { name: 'Hover me' });
    fireEvent.mouseEnter(button);
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    fireEvent.mouseLeave(button);
    vi.advanceTimersByTime(50);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should show tooltip on focus', async () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Focus me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button', { name: 'Focus me' });
    fireEvent.focus(button);
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should hide tooltip on blur', async () => {
    render(
      <Tooltip content="Tooltip text" delay={100} hideDelay={50}>
        <button>Focus me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button', { name: 'Focus me' });
    fireEvent.focus(button);
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    fireEvent.blur(button);
    vi.advanceTimersByTime(50);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should hide tooltip on escape key', async () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Focus me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button', { name: 'Focus me' });
    fireEvent.focus(button);
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(button, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should not show tooltip when disabled', () => {
    render(
      <Tooltip content="Tooltip text" delay={100} disabled>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button', { name: 'Hover me' });
    fireEvent.mouseEnter(button);
    vi.advanceTimersByTime(100);
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should render with different variants', async () => {
    const { rerender } = render(
      <Tooltip content="Text" delay={0} variant="primary">
        <button>Button</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByRole('button'));
    vi.advanceTimersByTime(0);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bg-primary-600');
    });
    
    rerender(
      <Tooltip content="Text" delay={0} variant="success">
        <button>Button</button>
      </Tooltip>
    );
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bg-green-600');
    });
  });

  it('should render with different positions', async () => {
    const { rerender } = render(
      <Tooltip content="Text" delay={0} position="top">
        <button>Button</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByRole('button'));
    vi.advanceTimersByTime(0);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
    });
    
    rerender(
      <Tooltip content="Text" delay={0} position="left">
        <button>Button</button>
      </Tooltip>
    );
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('right-full');
    });
  });

  it('should render with different sizes', async () => {
    render(
      <Tooltip content="Text" delay={0} size="lg">
        <button>Button</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByRole('button'));
    vi.advanceTimersByTime(0);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('px-3', 'py-2', 'text-sm');
    });
  });

  it('should call onVisibilityChange when visibility changes', async () => {
    const onVisibilityChange = vi.fn();
    
    render(
      <Tooltip content="Text" delay={100} onVisibilityChange={onVisibilityChange}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(onVisibilityChange).toHaveBeenCalledWith(true);
    });
    
    fireEvent.mouseLeave(button);
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(onVisibilityChange).toHaveBeenCalledWith(false);
    });
  });

  it('should set aria-describedby on trigger when visible', async () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-describedby');
    
    fireEvent.mouseEnter(button);
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-describedby');
    });
  });

  it('should respect controlled visible prop', async () => {
    const { rerender } = render(
      <Tooltip content="Text" visible={false}>
        <button>Button</button>
      </Tooltip>
    );
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    rerender(
      <Tooltip content="Text" visible={true}>
        <button>Button</button>
      </Tooltip>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should render complex content', async () => {
    render(
      <Tooltip content={<span data-testid="complex">Complex content</span>} delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByRole('button'));
    vi.advanceTimersByTime(0);
    
    await waitFor(() => {
      expect(screen.getByTestId('complex')).toBeInTheDocument();
    });
  });
});
