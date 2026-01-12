import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Heading from './Heading';

describe('Heading Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Heading>Test Heading</Heading>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Heading');
    });

    it('renders with custom children', () => {
      render(<Heading>Custom Content</Heading>);
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('renders with React element children', () => {
      render(
        <Heading>
          <span>Test</span>
        </Heading>
      );
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Heading Level', () => {
    it('renders as h1 when level is 1', () => {
      render(<Heading level={1}>Heading 1</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h1');
    });

    it('renders as h2 when level is 2 (default)', () => {
      render(<Heading level={2}>Heading 2</Heading>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h2');
    });

    it('renders as h3 when level is 3', () => {
      render(<Heading level={3}>Heading 3</Heading>);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h3');
    });

    it('renders as h4 when level is 4', () => {
      render(<Heading level={4}>Heading 4</Heading>);
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h4');
    });

    it('renders as h5 when level is 5', () => {
      render(<Heading level={5}>Heading 5</Heading>);
      const heading = screen.getByRole('heading', { level: 5 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h5');
    });

    it('renders as h6 when level is 6', () => {
      render(<Heading level={6}>Heading 6</Heading>);
      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h6');
    });
  });

  describe('Size Variants', () => {
    it('applies xs size classes', () => {
      const { container } = render(<Heading size="xs">Small Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-xs');
    });

    it('applies sm size classes', () => {
      const { container } = render(<Heading size="sm">Small Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-sm');
    });

    it('applies base size classes', () => {
      const { container } = render(<Heading size="base">Base Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-base');
    });

    it('applies lg size classes', () => {
      const { container } = render(<Heading size="lg">Large Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-lg');
    });

    it('applies xl size classes', () => {
      const { container } = render(<Heading size="xl">XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-xl');
    });

    it('applies 2xl size classes', () => {
      const { container } = render(<Heading size="2xl">2XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-2xl');
    });

    it('applies 3xl size classes', () => {
      const { container } = render(<Heading size="3xl">3XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-3xl');
    });

    it('applies 4xl size classes', () => {
      const { container } = render(<Heading size="4xl">4XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-4xl');
    });

    it('applies 5xl size classes', () => {
      const { container } = render(<Heading size="5xl">5XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-5xl');
    });

    it('applies 6xl size classes', () => {
      const { container } = render(<Heading size="6xl">6XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-6xl');
    });

    it('applies 7xl size classes', () => {
      const { container } = render(<Heading size="7xl">7XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-7xl');
    });

    it('applies 8xl size classes', () => {
      const { container } = render(<Heading size="8xl">8XL Text</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-8xl');
    });
  });

  describe('Weight Variants', () => {
    it('applies normal weight', () => {
      const { container } = render(<Heading weight="normal">Normal</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('font-normal');
    });

    it('applies medium weight', () => {
      const { container } = render(<Heading weight="medium">Medium</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('font-medium');
    });

    it('applies semibold weight', () => {
      const { container } = render(<Heading weight="semibold">Semibold</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('font-semibold');
    });

    it('applies bold weight (default)', () => {
      const { container } = render(<Heading weight="bold">Bold</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('font-bold');
    });
  });

  describe('Tracking Variants', () => {
    it('applies tight tracking', () => {
      const { container } = render(<Heading tracking="tight">Tight</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('tracking-tight');
    });

    it('applies normal tracking (default)', () => {
      const { container } = render(<Heading tracking="normal">Normal</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('tracking-normal');
    });

    it('applies wide tracking', () => {
      const { container } = render(<Heading tracking="wide">Wide</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('tracking-wide');
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode text colors', () => {
      const { container } = render(<Heading>Dark Mode</Heading>);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-neutral-900');
      expect(heading).toHaveClass('dark:text-white');
    });
  });

  describe('Accessibility', () => {
    it('passes id to heading element', () => {
      render(<Heading id="test-heading">Test</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveAttribute('id', 'test-heading');
    });

    it('passes additional ARIA attributes', () => {
      render(
        <Heading aria-label="Custom ARIA">Test</Heading>
      );
      const heading = screen.getByRole('heading');
      expect(heading).toHaveAttribute('aria-label', 'Custom ARIA');
    });

    it('passes custom className', () => {
      const { container } = render(
        <Heading className="custom-class">Test</Heading>
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('custom-class');
    });
  });

  describe('Leading and Custom Styles', () => {
    it('applies custom leading class', () => {
      const { container } = render(
        <Heading leading="leading-[1.1]">Test</Heading>
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('leading-[1.1]');
    });

    it('applies responsive size classes', () => {
      const { container } = render(
        <Heading className="text-4xl sm:text-5xl md:text-6xl">Responsive</Heading>
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-4xl', 'sm:text-5xl', 'md:text-6xl');
    });
  });

  describe('Forward Ref', () => {
    it('forwards ref to heading element', () => {
      const ref = { current: null };
      render(<Heading ref={ref}>Test</Heading>);
      expect(ref.current).toBeInTheDocument();
      expect(ref.current?.tagName.toLowerCase()).toBe('h2');
    });

    it('passes other HTML attributes', () => {
      const { container } = render(
        <Heading data-testid="custom-test">Test</Heading>
      );
      const heading = container.querySelector('[data-testid="custom-test"]');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('has correct display name for debugging', () => {
      expect(Heading.displayName).toBe('Heading');
    });
  });

  describe('Complex Usage Patterns', () => {
    it('handles combination of all props', () => {
      const { container } = render(
        <Heading
          level={1}
          size="6xl"
          weight="bold"
          tracking="tight"
          leading="leading-[1.1]"
          id="hero-heading"
          className="mb-8 animate-fade-in"
        >
          Hero Title
        </Heading>
      );
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass(
        'text-6xl',
        'font-bold',
        'tracking-tight',
        'leading-[1.1]',
        'text-neutral-900',
        'dark:text-white',
        'mb-8',
        'animate-fade-in'
      );
      expect(heading).toHaveAttribute('id', 'hero-heading');
      expect(heading).toHaveTextContent('Hero Title');
    });

    it('maintains semantic heading structure with proper levels', () => {
      const { container } = render(
        <div>
          <Heading level={1} size="4xl">Main Title</Heading>
          <Heading level={2} size="2xl">Section Title</Heading>
          <Heading level={3} size="xl">Subsection Title</Heading>
        </div>
      );
      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
      expect(h1).toHaveTextContent('Main Title');
      expect(h2).toHaveTextContent('Section Title');
      expect(h3).toHaveTextContent('Subsection Title');
    });
  });
});
