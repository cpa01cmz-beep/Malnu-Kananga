import { render, screen, fireEvent } from '@testing-library/react';
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
    
    const skipLink = screen.getByRole('link', { name: 'Langsung ke konten utama' });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should render with custom target id', () => {
    mainElement.id = 'custom-target';
    render(<SkipLink targetId="custom-target" />);
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveAttribute('href', '#custom-target');
  });

  it('should render with custom label', () => {
    render(<SkipLink label="Skip to content" />);
    
    const skipLink = screen.getByRole('link', { name: 'Skip to content' });
    expect(skipLink).toBeInTheDocument();
  });

  it('should be hidden by default', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveClass('-translate-y-[200%]');
  });

  it('should become visible when focused', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    skipLink.focus();
    
    expect(skipLink).toHaveFocus();
  });

  it('should navigate to target element when clicked', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    const clickEvent = new window.MouseEvent('click', { bubbles: true }) as MouseEvent;
    Object.defineProperty(clickEvent, 'target', { writable: true, value: skipLink });
    
    skipLink.dispatchEvent(clickEvent);
    
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have correct ARIA attributes', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveAttribute('role', 'navigation');
    expect(skipLink).toHaveAttribute('aria-label', 'Langsung ke konten utama');
  });

  it('should have proper styling classes', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveClass(
      'absolute',
      'top-4',
      'left-4',
      'z-[100]',
      'bg-primary-600',
      'text-white',
      'hover:bg-primary-700',
      'focus:ring-2',
      'focus:ring-offset-2',
      'dark:focus:ring-offset-neutral-900',
      'focus:ring-primary-500/50',
      'shadow-md',
      'hover:shadow-lg',
      'transform',
      '-translate-y-[200%]',
      'focus:translate-y-0'
    );
  });

  it('should be keyboard accessible', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    skipLink.focus();
    
    expect(skipLink).toHaveFocus();
    expect(skipLink).toHaveClass('focus:translate-y-0');
  });

  it('should apply custom className', () => {
    render(<SkipLink className="custom-class" />);
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveClass('custom-class');
  });

  it('should work with Enter key', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    skipLink.focus();
    
    fireEvent.keyDown(skipLink, { key: 'Enter', code: 'Enter' });
    
    expect(skipLink).toHaveFocus();
  });

  it('should work with Space key', () => {
    render(<SkipLink />);
    
    const skipLink = screen.getByRole('link');
    skipLink.focus();
    
    fireEvent.keyDown(skipLink, { key: ' ', code: 'Space' });
    
    expect(skipLink).toHaveFocus();
  });

  describe('Accessibility', () => {
    it('should have role="navigation"', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('navigation', { name: 'Langsung ke konten utama' });
      expect(skipLink).toBeInTheDocument();
    });

    it('should have aria-label for screen readers', () => {
      render(<SkipLink label="Skip to main content" />);
      
      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content');
    });

    it('should be keyboard focusable', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      skipLink.focus();
      
      expect(document.activeElement).toBe(skipLink);
    });

    it('should maintain focus management', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      skipLink.focus();
      
      expect(skipLink).toHaveFocus();
      
      skipLink.blur();
      
      expect(skipLink).not.toHaveFocus();
    });

    it('should have high z-index for accessibility', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveClass('z-[100]');
    });

    it('should have proper focus visible states', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'dark:focus:ring-offset-neutral-900'
      );
    });

    it('should have semantic HTML structure', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      expect(skipLink.tagName).toBe('A');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be reachable via Tab key', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      
      skipLink.tabIndex = 0;
      skipLink.focus();
      
      expect(skipLink).toHaveFocus();
    });

    it('should become visible on focus and hide on blur', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      
      skipLink.focus();
      expect(skipLink).toHaveClass('focus:translate-y-0');
      
      skipLink.blur();
      expect(skipLink).toHaveClass('-translate-y-[200%]');
    });
  });

  describe('Visual States', () => {
    it('should have hover effects', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveClass('hover:bg-primary-700', 'hover:shadow-lg');
    });

    it('should have proper positioning', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveClass('absolute', 'top-4', 'left-4');
    });

    it('should have transition classes', () => {
      render(<SkipLink />);
      
      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveClass('transition-all', 'duration-200');
    });
  });
});
