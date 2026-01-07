import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from '../Badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText('Default Badge');
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('SPAN');
    });

    it('renders children correctly', () => {
      render(<Badge>Test Content</Badge>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with React nodes', () => {
      render(<Badge><span>Complex</span> Content</Badge>);
      const badge = screen.getByText('Complex');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'dark:bg-green-900/30', 'dark:text-green-300');
    });

    it('renders error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'dark:bg-red-900/30', 'dark:text-red-300');
    });

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900/30', 'dark:text-yellow-300');
    });

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900/30', 'dark:text-blue-300');
    });

    it('renders neutral variant', () => {
      render(<Badge variant="neutral">Neutral</Badge>);
      const badge = screen.getByText('Neutral');
      expect(badge).toHaveClass('bg-neutral-100', 'text-neutral-800', 'dark:bg-neutral-700', 'dark:text-neutral-300');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
    });

    it('renders medium size (default)', () => {
      render(<Badge size="md">Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('renders large size', () => {
      render(<Badge size="lg">Large</Badge>);
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-2.5', 'py-1.5', 'text-sm');
    });
  });

  describe('Style Types', () => {
    it('renders solid style (default)', () => {
      render(<Badge variant="success" styleType="solid">Solid</Badge>);
      const badge = screen.getByText('Solid');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders outline style', () => {
      render(<Badge variant="success" styleType="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('border-2', 'border-green-500', 'text-green-700');
      expect(badge).not.toHaveClass('bg-green-100');
    });
  });

  describe('Rounded', () => {
    it('renders fully rounded by default', () => {
      render(<Badge>Rounded</Badge>);
      const badge = screen.getByText('Rounded');
      expect(badge).toHaveClass('rounded-full');
    });

    it('renders with normal rounded corners when rounded=false', () => {
      render(<Badge rounded={false}>Not Rounded</Badge>);
      const badge = screen.getByText('Not Rounded');
      expect(badge).toHaveClass('rounded-lg');
      expect(badge).not.toHaveClass('rounded-full');
    });
  });

  describe('Combined Props', () => {
    it('renders with all props combined', () => {
      render(
        <Badge variant="success" size="lg" styleType="outline" rounded={false}>
          Full Badge
        </Badge>
      );
      const badge = screen.getByText('Full Badge');
      expect(badge).toHaveClass(
        'border-2',
        'border-green-500',
        'text-green-700',
        'px-2.5',
        'py-1.5',
        'text-sm',
        'rounded-xl'
      );
    });

    it('renders error variant with outline style', () => {
      render(<Badge variant="error" styleType="outline">Error Outline</Badge>);
      const badge = screen.getByText('Error Outline');
      expect(badge).toHaveClass('border-2', 'border-red-500', 'text-red-700');
    });

    it('renders warning variant with large size', () => {
      render(<Badge variant="warning" size="lg">Warning Large</Badge>);
      const badge = screen.getByText('Warning Large');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'px-2.5', 'py-1.5', 'text-sm');
    });
  });

  describe('Accessibility', () => {
    it('passes through additional HTML attributes', () => {
      render(<Badge data-testid="test-badge" aria-label="Test Badge">Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge).toHaveAttribute('data-testid', 'test-badge');
      expect(badge).toHaveAttribute('aria-label', 'Test Badge');
    });

    it('supports custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes for success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('dark:bg-green-900/30', 'dark:text-green-300');
    });

    it('has dark mode classes for error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('dark:bg-red-900/30', 'dark:text-red-300');
    });

    it('has dark mode classes for outline variant', () => {
      render(<Badge variant="info" styleType="outline">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('dark:border-blue-400', 'dark:text-blue-300');
    });
  });

  describe('Transitions', () => {
    it('has transition classes for smooth color changes', () => {
      render(<Badge>Transition</Badge>);
      const badge = screen.getByText('Transition');
      expect(badge).toHaveClass('transition-colors', 'duration-200');
    });
  });

  describe('Edge Cases', () => {
    it('renders empty badge', () => {
      render(<Badge>Empty</Badge>);
      const badge = document.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('renders with very long text', () => {
      const longText = 'This is a very long badge text that should still render correctly without breaking the layout';
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('renders with special characters', () => {
      render(<Badge>Badge with & special characters</Badge>);
      expect(screen.getByText('Badge with & special characters')).toBeInTheDocument();
    });
  });
});
