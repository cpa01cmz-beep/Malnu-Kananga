import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ScrollToTop from '../ScrollToTop';

// Mock the hooks
vi.mock('../../hooks/useAccessibility', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('../../utils/hapticFeedback', () => ({
  useHapticFeedback: vi.fn(() => ({
    onSuccess: vi.fn(),
  })),
}));

describe('ScrollToTop', () => {
  let scrollYMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollYMock = vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
    
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 0,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<ScrollToTop />);
    expect(document.body).toBeTruthy();
  });

  it('has correct ARIA attributes for accessibility', () => {
    scrollYMock.mockReturnValue(500);
    
    render(<ScrollToTop showThreshold={300} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('Scroll to top');
    expect(button).toHaveAttribute('aria-live', 'polite');
    expect(button).toHaveAttribute('title', 'Scroll to top');
  });

  it('has focus outline classes for keyboard navigation', () => {
    scrollYMock.mockReturnValue(500);
    
    render(<ScrollToTop showThreshold={300} />);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('focus-visible:ring-2');
  });

  it('renders with different sizes', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container: containerSm } = render(<ScrollToTop size="sm" />);
    const buttonSm = containerSm.querySelector('button');
    expect(buttonSm?.className).toContain('w-10');

    const { container: containerMd } = render(<ScrollToTop size="md" />);
    const buttonMd = containerMd.querySelector('button');
    expect(buttonMd?.className).toContain('w-12');

    const { container: containerLg } = render(<ScrollToTop size="lg" />);
    const buttonLg = containerLg.querySelector('button');
    expect(buttonLg?.className).toContain('w-14');
  });

  it('renders with different variants', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container: defaultVariant } = render(<ScrollToTop variant="default" />);
    const buttonDefault = defaultVariant.querySelector('button');
    expect(buttonDefault?.className).toContain('bg-white');

    const { container: minimalVariant } = render(<ScrollToTop variant="minimal" />);
    const buttonMinimal = minimalVariant.querySelector('button');
    expect(buttonMinimal?.className).toContain('bg-neutral-900/80');

    const { container: elevatedVariant } = render(<ScrollToTop variant="elevated" />);
    const buttonElevated = elevatedVariant.querySelector('button');
    expect(buttonElevated?.className).toContain('bg-primary-600');
  });

  it('shows progress ring when showProgress is true', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container } = render(<ScrollToTop showProgress={true} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('does not show progress ring when showProgress is false', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container } = render(<ScrollToTop showProgress={false} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(0);
  });

  it('has upward arrow icon', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container } = render(<ScrollToTop />);
    const svgs = container.querySelectorAll('svg');
    
    let iconPath = null;
    svgs.forEach(svg => {
      const path = svg.querySelector('path');
      if (path && path.getAttribute('d') === 'M5 10l7-7m0 0l7 7m-7-7v18') {
        iconPath = path;
      }
    });
    
    expect(iconPath).toBeTruthy();
  });

  it('has scale animation classes', () => {
    scrollYMock.mockReturnValue(500);
    
    render(<ScrollToTop />);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('transition-all');
    expect(button.className).toContain('duration-200');
  });

  it('has cursor pointer class', () => {
    scrollYMock.mockReturnValue(500);
    
    render(<ScrollToTop />);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('cursor-pointer');
  });

  it('accepts custom className', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container } = render(
      <ScrollToTop className="custom-class" />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('is positioned fixed', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container } = render(<ScrollToTop />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('fixed');
    expect(wrapper.className).toContain('z-50');
  });

  it('has rounded full button', () => {
    scrollYMock.mockReturnValue(500);
    
    render(<ScrollToTop />);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('rounded-full');
  });

  it('has correct button type', () => {
    scrollYMock.mockReturnValue(500);
    
    render(<ScrollToTop />);
    
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('is disabled when not visible', () => {
    scrollYMock.mockReturnValue(100);
    
    const { container } = render(<ScrollToTop showThreshold={300} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0');
    expect(wrapper.className).toContain('pointer-events-none');
  });

  it('is enabled when visible', () => {
    scrollYMock.mockReturnValue(500);
    
    const { container } = render(<ScrollToTop showThreshold={300} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.className).toContain('pointer-events-auto');
  });

});
