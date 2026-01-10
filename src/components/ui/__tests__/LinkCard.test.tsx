import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LinkCard from './LinkCard';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';

describe('LinkCard', () => {
  const defaultProps = {
    name: 'Test Link',
    href: 'https://example.com',
    icon: <DocumentTextIcon />,
    colorClass: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  };

  it('renders correctly', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    expect(screen.getByRole('link', { name: 'Test Link' })).toBeInTheDocument();
  });

  it('has correct href attribute', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('opens in new tab', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has custom aria-label when provided', () => {
    render(
      <ul>
        <LinkCard 
          {...defaultProps} 
          ariaLabel="Buka Test Link di tab baru" 
        />
      </ul>
    );
    expect(screen.getByRole('link', { name: 'Buka Test Link di tab baru' })).toBeInTheDocument();
  });

  it('renders name text', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('has role="listitem" on li element', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveAttribute('role', 'listitem');
  });

  it('applies color class to icon container', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = document.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toHaveClass('bg-primary-100');
    expect(iconContainer).toHaveClass('dark:bg-primary-900/30');
    expect(iconContainer).toHaveClass('text-primary-600');
  });

  it('applies color class to icon container', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = document.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toHaveClass('bg-primary-100');
    expect(iconContainer).toHaveClass('dark:bg-primary-900/30');
    expect(iconContainer).toHaveClass('text-primary-600');
  });

  it('has focus styles for accessibility', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('focus:ring-2');
    expect(link).toHaveClass('focus:ring-primary-500/50');
  });

  it('has hover effects', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:shadow-card-hover');
    expect(link).toHaveClass('hover:scale-[1.02]');
  });

  it('has keyboard navigation support', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href');
    expect(link).toHaveClass('focus:outline-none');
  });

  it('has correct responsive padding classes', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('p-7');
    expect(link).toHaveClass('sm:p-8');
    expect(link).toHaveClass('lg:p-10');
  });

  it('has correct responsive icon sizes', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = document.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toHaveClass('h-14');
    expect(iconContainer).toHaveClass('w-14');
    expect(iconContainer).toHaveClass('sm:h-16');
    expect(iconContainer).toHaveClass('sm:w-16');
    expect(iconContainer).toHaveClass('lg:h-20');
    expect(iconContainer).toHaveClass('lg:w-20');
  });

  it('has icon aria-hidden attribute', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = document.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it('has dark mode support', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-white');
    expect(link).toHaveClass('dark:bg-neutral-800');
  });

  it('has transition effects', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('transition-all');
    expect(link).toHaveClass('duration-300');
  });

  it('has scale animation on icon hover', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = document.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toHaveClass('group-hover:scale-110');
  });

  it('has ring offset for dark mode focus', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('dark:focus:ring-offset-neutral-800');
  });

  it('applies color class to icon container', () => {
    render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = screen.queryByAttribute('aria-hidden', document.body, 'true');
    expect(iconContainer).toHaveClass('bg-primary-100');
    expect(iconContainer).toHaveClass('dark:bg-primary-900/30');
    expect(iconContainer).toHaveClass('text-primary-600');
  });

  it('has focus styles for accessibility', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('focus:ring-2');
    expect(link).toHaveClass('focus:ring-primary-500/50');
  });

  it('has hover effects', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:shadow-card-hover');
    expect(link).toHaveClass('hover:scale-[1.02]');
  });

  it('has keyboard navigation support', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href');
    expect(link).toHaveClass('focus:outline-none');
  });

  it('has correct responsive padding classes', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('p-7');
    expect(link).toHaveClass('sm:p-8');
    expect(link).toHaveClass('lg:p-10');
  });

  it('has correct responsive icon sizes', () => {
    const { container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = container.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toHaveClass('h-14');
    expect(iconContainer).toHaveClass('w-14');
    expect(iconContainer).toHaveClass('sm:h-16');
    expect(iconContainer).toHaveClass('sm:w-16');
    expect(iconContainer).toHaveClass('lg:h-20');
    expect(iconContainer).toHaveClass('lg:w-20');
  });

  it('has icon aria-hidden attribute', () => {
    const { container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = container.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it('has dark mode support', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-white');
    expect(link).toHaveClass('dark:bg-neutral-800');
  });

  it('has transition effects', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('transition-all');
    expect(link).toHaveClass('duration-300');
  });

  it('has scale animation on icon hover', () => {
    const { container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const iconContainer = container.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toHaveClass('group-hover:scale-110');
  });

  it('has ring offset for dark mode focus', () => {
    const { container: _container } = render(<ul><LinkCard {...defaultProps} /></ul>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('dark:focus:ring-offset-neutral-800');
  });
});
