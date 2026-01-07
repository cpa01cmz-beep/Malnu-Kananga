import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import SkipLink from '../SkipLink';

describe('SkipLink', () => {
  let mainElement: HTMLElement;

  beforeEach(() => {
    mainElement = document.createElement('div');
    mainElement.id = 'main-content';
    document.body.appendChild(mainElement);
  });

  afterEach(() => {
    document.body.removeChild(mainElement);
  });

  it('should render skip link with default props', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation', { name: 'Langsung ke konten utama' });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should render with custom target id', () => {
    mainElement.id = 'custom-target';
    render(<SkipLink targetId="custom-target" />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveAttribute('href', '#custom-target');
  });

  it('should render with custom label', () => {
    render(<SkipLink label="Skip to content" />);

    const skipLink = screen.getByRole('navigation', { name: 'Skip to content' });
    expect(skipLink).toBeInTheDocument();
  });

  it('should be hidden by default', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('-translate-y-[200%]');
  });

  it('should become visible when focused', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    skipLink.focus();

    expect(skipLink).toHaveClass('focus:translate-y-0');
  });

  it('should apply custom className', () => {
    render(<SkipLink className="custom-class" />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('custom-class');
  });

  it('should have proper ARIA label', () => {
    render(<SkipLink label="Test Label" />);

    const skipLink = screen.getByRole('navigation', { name: 'Test Label' });
    expect(skipLink).toHaveAttribute('aria-label', 'Test Label');
  });

  it('should link to main content element', () => {
    render(<SkipLink targetId="main-content" />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const mainContent = document.getElementById('main-content');
    expect(mainContent).toBeInTheDocument();
  });

  it('should have high z-index for accessibility', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('z-[100]');
  });

  it('should have proper transition classes', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('transition-all', 'duration-200');
  });

  it('should have proper positioning', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('absolute', 'top-4', 'left-4');
  });

  it('should have proper padding', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('px-4', 'py-3');
  });

  it('should have proper text styling', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('text-base', 'font-semibold');
  });

  it('should have proper rounded corners', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('rounded-lg');
  });

  it('should have focus ring styles', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
  });

  it('should have dark mode support', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('dark:focus:ring-offset-neutral-900');
  });

  it('should have hover effects', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('hover:bg-primary-700', 'hover:shadow-lg');
  });

  it('should have proper shadow on default', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('shadow-md');
  });

  it('should have proper focus outline removal', () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole('navigation');
    expect(skipLink).toHaveClass('focus:outline-none');
  });

  it('should handle custom label properly', () => {
    render(<SkipLink label="Custom Skip Link" />);

    const skipLink = screen.getByRole('navigation', { name: 'Custom Skip Link' });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveTextContent('Custom Skip Link');
  });
});
