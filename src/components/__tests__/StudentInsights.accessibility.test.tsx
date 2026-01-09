import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import StudentInsights from '../StudentInsights';

describe('StudentInsights Accessibility', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  it('should render trend icons with proper ARIA attributes', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const trendIconSpans = container.querySelectorAll('[role="img"][aria-label^="Tren"]');
    
    expect(trendIconSpans.length).toBeGreaterThan(0);
    
    trendIconSpans.forEach((span) => {
      expect(span).toHaveAttribute('role', 'img');
      expect(span.getAttribute('aria-label')).toMatch(/^Tren (Meningkat|Menurun|Stabil)$/);
    });
  });

  it('should include sr-only text labels for screen readers', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const srOnlyLabels = container.querySelectorAll('.sr-only');
    
    expect(srOnlyLabels.length).toBeGreaterThan(0);
    
    srOnlyLabels.forEach((label) => {
      const labelText = label.textContent?.trim();
      expect(['Meningkat', 'Menurun', 'Stabil']).toContain(labelText);
    });
  });

  it('should use appropriate colors for each trend type', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const improvingIcon = Array.from(container.querySelectorAll('[role="img"]')).find(
      span => span.getAttribute('aria-label') === 'Tren Meningkat'
    );
    expect(improvingIcon).toHaveClass('text-green-600', 'dark:text-green-400');

    const decliningIcon = Array.from(container.querySelectorAll('[role="img"]')).find(
      span => span.getAttribute('aria-label') === 'Tren Menurun'
    );
    expect(decliningIcon).toHaveClass('text-red-600', 'dark:text-red-400');

    const stableIcon = Array.from(container.querySelectorAll('[role="img"]')).find(
      span => span.getAttribute('aria-label') === 'Tren Stabil'
    );
    expect(stableIcon).toHaveClass('text-blue-600', 'dark:text-blue-400');
  });

  it('should display correct visual icons for each trend', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const icons = container.querySelectorAll('[role="img"]');
    
    icons.forEach((icon) => {
      const ariaLabel = icon.getAttribute('aria-label');
      const visualIcon = icon.textContent?.replace(/\s/g, '');
      
      if (ariaLabel === 'Tren Meningkat') {
        expect(visualIcon).toBe('↗');
      } else if (ariaLabel === 'Tren Menurun') {
        expect(visualIcon).toBe('↘');
      } else if (ariaLabel === 'Tren Stabil') {
        expect(visualIcon).toBe('→');
      }
    });
  });
});
