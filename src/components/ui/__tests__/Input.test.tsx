 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  it('renders correctly with basic props', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label and helper text', () => {
    render(
      <Input
        label="Email"
        helperText="Enter your email address"
      />
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('shows error state and error text', () => {
    render(
      <Input
        label="Password"
        errorText="Password is required"
      />
    );
    const input = screen.getByLabelText('Password');
    expect(input).toHaveClass('border-red-300');
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Input size="sm" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-3', 'py-2', 'text-sm');

    rerender(<Input size="md" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-4', 'py-3');

    rerender(<Input size="lg" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-5', 'py-4', 'text-base');
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('shows required asterisk when required prop is true', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange handler when input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders with left and right icons', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      />
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Input label="Test Label" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleName('Test Label');
  });

  it('associates helper text with input using aria-describedby', () => {
    render(
      <Input
        label="Email"
        helperText="Enter your email address"
      />
    );
    const input = screen.getByRole('textbox');
    const helperText = screen.getByText('Enter your email address');
    expect(input).toHaveAttribute('aria-describedby');
    expect(helperText.id).toBe(input.getAttribute('aria-describedby'));
  });

  it('associates error text with input using aria-describedby and role="alert"', () => {
    render(
      <Input
        label="Password"
        errorText="Password is required"
      />
    );
    const input = screen.getByRole('textbox');
    const errorText = screen.getByText('Password is required');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(errorText).toHaveAttribute('role', 'alert');
    expect(errorText.id).toBe(input.getAttribute('aria-describedby'));
  });

  it('sets aria-invalid to false for non-error states', () => {
    render(<Input label="Test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('supports fullWidth prop', () => {
    render(<Input fullWidth />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-full');
  });
});
