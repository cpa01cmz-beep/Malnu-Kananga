 
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackButton from '../BackButton';

describe('BackButton', () => {
  const mockOnClick = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default label and variant', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    expect(screen.getByRole('button', { name: /navigasi kembali ke kembali/i })).toBeInTheDocument();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<BackButton onClick={mockOnClick} label="Back to Home" />);
    
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /navigasi kembali ke back to home/i })).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    render(<BackButton onClick={mockOnClick} variant="primary" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-primary-600', 'dark:text-primary-400');
  });

  it('renders with green variant', () => {
    render(<BackButton onClick={mockOnClick} variant="green" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-green-600', 'dark:text-green-400');
  });

  it('renders with custom variant', () => {
    render(<BackButton onClick={mockOnClick} variant="custom" />);
    
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('text-primary-600', 'dark:text-primary-400', 'text-green-600', 'dark:text-green-400');
  });

  it('renders with custom className', () => {
    render(<BackButton onClick={mockOnClick} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has proper aria-label', () => {
    render(<BackButton onClick={mockOnClick} label="Dashboard" ariaLabel="Go to Dashboard" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Go to Dashboard');
  });

  it('renders chevron icon', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-5', 'h-5');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('has focus ring for keyboard navigation', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('has hover effects', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:underline', 'hover:translate-x-[-4px]');
  });

  it('prevents default link behavior', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
