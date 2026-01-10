 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Select from '../Select';

describe('Select Component', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  it('renders correctly with basic props', () => {
    render(<Select options={mockOptions} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders with label and helper text', () => {
    render(
      <Select
        label="Choose an option"
        helperText="Select from the available options"
        options={mockOptions}
      />
    );
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
    expect(screen.getByText('Select from the available options')).toBeInTheDocument();
  });

  it('shows error state and error text', () => {
    render(
      <Select
        label="Select"
        errorText="This field is required"
        options={mockOptions}
      />
    );
    const select = screen.getByLabelText('Select');
    expect(select).toHaveClass('border-red-300');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Select options={mockOptions} size="sm" />);
    let select = screen.getByRole('combobox');
    expect(select).toHaveClass('px-3', 'py-2', 'text-sm');

    rerender(<Select options={mockOptions} size="md" />);
    select = screen.getByRole('combobox');
    expect(select).toHaveClass('px-4', 'py-3');

    rerender(<Select options={mockOptions} size="lg" />);
    select = screen.getByRole('combobox');
    expect(select).toHaveClass('px-5', 'py-4', 'text-base');
  });

  it('disables select when disabled prop is true', () => {
    render(<Select options={mockOptions} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('shows required asterisk when required prop is true', () => {
    render(<Select label="Category" required options={mockOptions} />);
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange handler when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders placeholder option when provided', () => {
    render(
      <Select
        options={mockOptions}
        placeholder="Select an option..."
      />
    );
    expect(screen.getByText('Select an option...')).toBeInTheDocument();
  });

  it('disables individual options', () => {
    render(<Select options={mockOptions} />);
    const options = screen.getAllByRole('option');
    expect(options[2]).toBeDisabled();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Select label="Test Select" options={mockOptions} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAccessibleName('Test Select');
  });

  it('associates helper text with select using aria-describedby', () => {
    render(
      <Select
        label="Category"
        helperText="Choose a category from the list"
        options={mockOptions}
      />
    );
    const select = screen.getByRole('combobox');
    const helperText = screen.getByText('Choose a category from the list');
    expect(select).toHaveAttribute('aria-describedby');
    expect(helperText.id).toBe(select.getAttribute('aria-describedby'));
  });

  it('associates error text with select using aria-describedby and role="alert"', () => {
    render(
      <Select
        label="Status"
        errorText="Please select a valid status"
        options={mockOptions}
      />
    );
    const select = screen.getByRole('combobox');
    const errorText = screen.getByText('Please select a valid status');
    expect(select).toHaveAttribute('aria-describedby');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(errorText).toHaveAttribute('role', 'alert');
    expect(errorText.id).toBe(select.getAttribute('aria-describedby'));
  });

  it('sets aria-invalid to false for non-error states', () => {
    render(<Select label="Test" options={mockOptions} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'false');
  });

  it('supports fullWidth prop', () => {
    render(<Select options={mockOptions} fullWidth />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('w-full');
  });
});
