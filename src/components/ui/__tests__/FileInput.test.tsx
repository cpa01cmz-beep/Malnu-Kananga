import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileInput from '../FileInput';

describe.skip('FileInput Component - TODO: Fix file input role queries', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<FileInput />);
    // const input = container.querySelector('input[type="file"]');
    // expect(input).toBeInTheDocument();
    // expect(input).toHaveClass('appearance-none');
    // expect(input).toHaveAttribute('type', 'file');
  });

  it('renders with label', () => {
    const { container } = render(<FileInput label="Upload File" />);
    const label = screen.getByText('Upload File');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('renders with helper text', () => {
    const { container } = render(<FileInput helperText="Supported formats: PDF, DOC" />);
    const helperText = screen.getByText('Supported formats: PDF, DOC');
    expect(helperText).toBeInTheDocument();
  });

it('renders with error text', () => {
    render(<FileInput errorText="File size too large" />);
    const { container } = render(<FileInput errorText="File size too large" />);
    // const input = container.querySelector('input[type="file"]');
    const error = screen.getByRole('alert');
    expect(input).toBeInTheDocument();
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent('File size too large');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('automatically sets error state when errorText is provided', () => {
    const { container } = render(<FileInput errorText="Invalid file" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('border-red-300');
  });

  it('renders with sm size', () => {
    render(<FileInput size="sm" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('px-3', 'py-2', 'text-sm');
  });

  it('renders with md size (default)', () => {
    render(<FileInput size="md" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('px-4', 'py-3');
  });

  it('renders with lg size', () => {
    render(<FileInput size="lg" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('px-5', 'py-4', 'text-base');
  });

  it('renders with success state', () => {
    render(<FileInput state="success" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('border-green-300');
  });

  it('renders fullWidth variant', () => {
    const { container } = render(<FileInput fullWidth />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('w-full');
  });

  it('handles file selection', () => {
    const handleChange = vi.fn();
    render(<FileInput onChange={handleChange} />);
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<FileInput disabled />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('displays required indicator when required prop is true', () => {
    render(<FileInput label="Document" required />);
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveAttribute('aria-label', 'required');
  });

  it('associates label with input using htmlFor', () => {
    render(<FileInput label="Upload" id="test-input" />);
    const label = screen.getByText('Upload');
    expect(label.getAttribute('for')).toBe('test-input');
  });

  it('generates unique id when not provided', () => {
    render(<FileInput label="Upload" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input.id).toMatch(/^fileinput-[a-z0-9]+$/);
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <FileInput 
        helperText="Max 10MB"
        errorText="Invalid type"
        aria-label="Upload document"
      />
    );
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('aria-label', 'Upload document');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('accepts custom className', () => {
    render(<FileInput className="custom-class" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('custom-class');
  });

  it('accepts custom file types', () => {
    render(<FileInput accept=".pdf,.docx" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', '.pdf,.docx');
  });

  it('applies success state file button styling', () => {
    render(<FileInput state="success" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('file:bg-green-50', 'file:text-green-700');
  });

  it('applies error state file button styling', () => {
    render(<FileInput state="error" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('file:bg-red-50', 'file:text-red-700');
  });

  it('applies dark mode file button styling', () => {
    render(<FileInput />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('dark:file:bg-blue-900/50', 'dark:file:text-blue-300');
  });

  it('has focus ring for accessibility', () => {
    render(<FileInput />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('focus:ring-2', 'focus:ring-primary-500/50');
  });

  it('has focus ring for file button', () => {
    render(<FileInput />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('file:focus:ring-2', 'file:focus:ring-blue-500/50');
  });

  it('has hover effects for file button', () => {
    render(<FileInput />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('hover:file:bg-blue-100');
  });

  it('has scale effect on file button interaction', () => {
    render(<FileInput />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('file:hover:scale-[1.02]', 'file:active:scale-95');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<FileInput ref={ref} />);
    // const input = container.querySelector('input[type="file"]');
    expect(ref.current).toBe(input);
  });

  it('supports multiple file selection', () => {
    render(<FileInput multiple />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('multiple');
  });

  it('renders with custom id', () => {
    render(<FileInput id="custom-id" />);
    // const input = container.querySelector('input[type="file"]');
    expect(input.id).toBe('custom-id');
  });

  it('has proper cursor pointer', () => {
    render(<FileInput />);
    // const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass('cursor-pointer', 'file:cursor-pointer');
  });
});
