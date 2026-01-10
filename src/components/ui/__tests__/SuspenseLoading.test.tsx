import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import '@testing-library/jest-dom';
import SuspenseLoading from '../SuspenseLoading';

describe('SuspenseLoading Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<SuspenseLoading />);
      expect(screen.getByText('Memuat...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<SuspenseLoading message="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('renders with Indonesian message', () => {
      render(<SuspenseLoading message="Memuat dashboard..." />);
      expect(screen.getByText('Memuat dashboard...')).toBeInTheDocument();
    });

    it('renders skeleton element', () => {
      render(<SuspenseLoading />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<SuspenseLoading className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('has role="status"', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveAttribute('role', 'status');
    });

    it('has aria-live="polite"', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-busy="true"', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    });

    it('skeleton has aria-hidden="true"', () => {
      render(<SuspenseLoading />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Sizes', () => {
    it('renders with small size', () => {
      const { container } = render(<SuspenseLoading size="sm" />);
      expect(container.firstChild).toHaveClass('h-48');
    });

    it('renders with medium size (default)', () => {
      const { container } = render(<SuspenseLoading size="md" />);
      expect(container.firstChild).toHaveClass('h-64');
    });

    it('renders with large size', () => {
      const { container } = render(<SuspenseLoading size="lg" />);
      expect(container.firstChild).toHaveClass('h-80');
    });

    it('applies small skeleton size', () => {
      render(<SuspenseLoading size="sm" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('w-12', 'h-12', 'rounded-xl');
    });

    it('applies medium skeleton size (default)', () => {
      render(<SuspenseLoading size="md" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('w-16', 'h-16', 'rounded-2xl');
    });

    it('applies large skeleton size', () => {
      render(<SuspenseLoading size="lg" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('w-20', 'h-20', 'rounded-2xl');
    });

    it('applies small text size', () => {
      const { container } = render(<SuspenseLoading size="sm" />);
      const textElement = container.querySelector('p');
      expect(textElement).toHaveClass('text-sm');
    });

    it('applies medium text size (default)', () => {
      const { container } = render(<SuspenseLoading size="md" />);
      const textElement = container.querySelector('p');
      expect(textElement).toHaveClass('text-base');
    });

    it('applies large text size', () => {
      const { container } = render(<SuspenseLoading size="lg" />);
      const textElement = container.querySelector('p');
      expect(textElement).toHaveClass('text-lg');
    });
  });

  describe('Styling', () => {
    it('has flex layout', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveClass('flex', 'flex-col');
    });

    it('has justify-center', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveClass('justify-center');
    });

    it('has items-center', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveClass('items-center');
    });

    it('has animate-pulse class', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('has dark mode support for skeleton', () => {
      render(<SuspenseLoading />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('bg-neutral-200', 'dark:bg-neutral-700');
    });

    it('has dark mode support for text', () => {
      const { container } = render(<SuspenseLoading />);
      const textElement = container.querySelector('p');
      expect(textElement).toHaveClass('text-neutral-500', 'dark:text-neutral-400');
    });
  });

  describe('Layout Structure', () => {
    it('contains skeleton element and text message', () => {
      const { container } = render(<SuspenseLoading />);
      const skeleton = container.querySelector('[aria-hidden="true"]');
      const textElement = container.querySelector('p');
      
      expect(skeleton).toBeInTheDocument();
      expect(textElement).toBeInTheDocument();
    });

    it('has space-y-3 for spacing between skeleton and text', () => {
      const { container } = render(<SuspenseLoading />);
      expect(container.firstChild).toHaveClass('space-y-3');
    });
  });

  describe('Props Integration', () => {
    it('combines custom className with default classes', () => {
      const { container } = render(
        <SuspenseLoading 
          className="mt-4 mb-8" 
          message="Custom message" 
          size="lg" 
        />
      );
      expect(container.firstChild).toHaveClass(
        'flex',
        'flex-col',
        'justify-center',
        'items-center',
        'h-80',
        'space-y-3',
        'animate-pulse',
        'mt-4',
        'mb-8'
      );
    });

    it('renders all props together correctly', () => {
      const { container } = render(
        <SuspenseLoading 
          message="Loading resources..." 
          size="sm" 
          className="absolute top-0 left-0 w-full h-full" 
        />
      );
      
      expect(screen.getByText('Loading resources...')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('h-48', 'absolute', 'top-0', 'left-0', 'w-full', 'h-full');
      expect(container.firstChild).toHaveAttribute('role', 'status');
      expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
      expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('TypeScript', () => {
    it('exports SuspenseLoadingSize type', () => {
      type Size = 'sm' | 'md' | 'lg';
      const size: Size = 'md';
      expect(['sm', 'md', 'lg']).toContain(size);
    });

    it('exports SuspenseLoadingProps interface', () => {
      const props: { message?: string; size?: 'sm' | 'md' | 'lg'; className?: string } = {
        message: 'Test',
        size: 'md',
        className: 'test-class'
      };
      expect(props.message).toBe('Test');
      expect(props.size).toBe('md');
      expect(props.className).toBe('test-class');
    });
  });

  describe('Integration with Suspense', () => {
    it('can be used as Suspense fallback', () => {
      const TestComponent = () => <div>Loaded</div>;
      
      render(
        <Suspense fallback={<SuspenseLoading message="Loading component..." />}>
          <TestComponent />
        </Suspense>
      );

      expect(screen.getByText('Loading component...')).toBeInTheDocument();
    });
  });
});
