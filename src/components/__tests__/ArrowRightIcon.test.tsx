import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';

describe('ArrowRightIcon', () => {
  it('renders correctly', () => {
    render(<ArrowRightIcon />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('has default className', () => {
    render(<ArrowRightIcon />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveClass('w-5', 'h-5');
  });

  it('applies custom className', () => {
    render(<ArrowRightIcon className="w-6 h-6" />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveClass('w-6', 'h-6');
  });

  it('has aria-hidden attribute for accessibility', () => {
    render(<ArrowRightIcon />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('has proper SVG attributes', () => {
    render(<ArrowRightIcon />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('strokeWidth', '2');
  });

  it('has correct path for arrow right icon', () => {
    render(<ArrowRightIcon />);
    const svg = screen.getByRole('img');
    const path = svg.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('d', 'M13 7l5 5m0 0l-5 5m5-5H6');
  });

  it('has proper strokeLinecap and strokeLinejoin', () => {
    render(<ArrowRightIcon />);
    const svg = screen.getByRole('img');
    const path = svg.querySelector('path');
    expect(path).toHaveAttribute('strokeLinecap', 'round');
    expect(path).toHaveAttribute('strokeLinejoin', 'round');
  });
});
