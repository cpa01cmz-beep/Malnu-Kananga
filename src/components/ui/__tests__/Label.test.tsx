import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Label from '../Label';

describe('Label Component', () => {
  it('renders correctly with basic props', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('shows required asterisk when required prop is true', () => {
    render(<Label htmlFor="test-input" required>Required Field</Label>);
    expect(screen.getByText('Required Field')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('text-red-500');
  });

  it('renders helper text when provided', () => {
    render(
      <Label htmlFor="test-input" helperText="This is helper text">
        Label Text
      </Label>
    );
    expect(screen.getByText('Label Text')).toBeInTheDocument();
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Label htmlFor="test" size="sm">Small Label</Label>);
    let label = screen.getByText('Small Label');
    expect(label).toHaveClass('text-xs');

    rerender(<Label htmlFor="test" size="md">Medium Label</Label>);
    label = screen.getByText('Medium Label');
    expect(label).toHaveClass('text-sm');

    rerender(<Label htmlFor="test" size="lg">Large Label</Label>);
    label = screen.getByText('Large Label');
    expect(label).toHaveClass('text-base');
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Label htmlFor="test-input">Accessibility Test</Label>);
    const label = screen.getByText('Accessibility Test');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('applies custom className', () => {
    render(<Label htmlFor="test" className="custom-class">Custom Label</Label>);
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
  });

  it('has correct default styling classes', () => {
    render(<Label htmlFor="test">Default Label</Label>);
    const label = screen.getByText('Default Label');
    expect(label).toHaveClass('font-semibold', 'text-neutral-700', 'dark:text-neutral-300', 'block');
  });
});
