import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';

describe('ArrowRightIcon', () => {
  it('renders correctly', () => {
    const { container } = render(<ArrowRightIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has default className', () => {
    const { container } = render(<ArrowRightIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-5', 'h-5');
  });

  it('applies custom className', () => {
    const { container } = render(<ArrowRightIcon className="w-6 h-6" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-6', 'h-6');
  });

  it('has aria-hidden attribute for accessibility', () => {
    const { container } = render(<ArrowRightIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('has proper SVG attributes', () => {
    const { container } = render(<ArrowRightIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('stroke-width', '2');
  });

  it('has correct path for arrow right icon', () => {
    const { container } = render(<ArrowRightIcon />);
    const svg = container.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('d', 'M13 7l5 5m0 0l-5 5m5-5H6');
  });

  it('has proper strokeLinecap and strokeLinejoin', () => {
    const { container } = render(<ArrowRightIcon />);
    const svg = container.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });
});
