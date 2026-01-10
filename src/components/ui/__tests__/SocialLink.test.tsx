 
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialLink from '../SocialLink';

describe('SocialLink', () => {
  const mockIcon = <svg data-testid="test-icon"><path d="M1 1h20v20H1z" /></svg>;

  describe('rendering', () => {
    it('renders as anchor link when href is provided', () => {
      render(
        <SocialLink
          href="https://facebook.com"
          icon={mockIcon}
          label="Facebook"
        />
      );

      const link = screen.getByRole('link', { name: 'Facebook' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://facebook.com');
    });

    it('renders as button when onClick is provided without href', () => {
      const handleClick = vi.fn();
      render(
        <SocialLink
          onClick={handleClick}
          icon={mockIcon}
          label="Toggle theme"
        />
      );

      const button = screen.getByRole('button', { name: 'Toggle theme' });
      expect(button).toBeInTheDocument();
    });

    it('renders icon correctly', () => {
      render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies correct aria-label', () => {
      render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Twitter"
        />
      );

      const link = screen.getByRole('link', { name: 'Twitter' });
      expect(link).toHaveAttribute('aria-label', 'Twitter');
    });

    it('adds rel attribute with default value', () => {
      render(
        <SocialLink
          href="https://example.com"
          icon={mockIcon}
          label="Example"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('adds custom rel attribute', () => {
      render(
        <SocialLink
          href="https://example.com"
          icon={mockIcon}
          label="Example"
          rel="nofollow"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'nofollow');
    });

    it('adds target attribute', () => {
      render(
        <SocialLink
          href="https://example.com"
          icon={mockIcon}
          label="Example"
          target="_blank"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('variants', () => {
    it('renders default variant with correct styles', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          variant="default"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('text-neutral-400', 'hover:text-primary-600', 'dark:hover:text-primary-400');
    });

    it('renders primary variant with correct styles', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          variant="primary"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('text-primary-600', 'dark:text-primary-400', 'hover:text-primary-700');
    });

    it('renders secondary variant with correct styles', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          variant="secondary"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('text-neutral-500', 'dark:text-neutral-500', 'hover:text-neutral-700');
    });
  });

  describe('sizes', () => {
    it('renders sm size with correct padding', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          size="sm"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('p-2');
    });

    it('renders md size with correct padding', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          size="md"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('p-2.5');
    });

    it('renders lg size with correct padding', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          size="lg"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('p-3');
    });

    it('renders xl size with correct padding', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          size="xl"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('p-4');
    });

    it('applies correct icon sizes', () => {
      const { container: smContainer } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          size="sm"
        />
      );

      const { container: lgContainer } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          size="lg"
        />
      );

      const smIcon = smContainer.querySelector('[aria-hidden="true"]');
      const lgIcon = lgContainer.querySelector('[aria-hidden="true"]');

      expect(smIcon).toHaveClass('w-5', 'h-5');
      expect(lgIcon).toHaveClass('w-6', 'h-6');
    });
  });

  describe('interactions', () => {
    it('handles button click', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <SocialLink
          onClick={handleClick}
          icon={mockIcon}
          label="Test Button"
        />
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('navigates to href when clicked', async () => {
      const user = userEvent.setup();

      render(
        <SocialLink
          href="#test"
          icon={mockIcon}
          label="Test Link"
        />
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      await user.click(link);

      expect(window.location.hash).toBe('#test');
    });

    it('is disabled when disabled prop is true', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          disabled
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('accessibility', () => {
    it('has proper focus indicators', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-primary-500/50');
    });

    it('applies focus offset in dark mode', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('dark:focus-visible:ring-offset-neutral-800');
    });

    it('has proper keyboard navigation', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('focus:outline-none');
    });

    it('has aria-hidden on icon content', () => {
      render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const icon = screen.getByRole('link').querySelector('[aria-hidden]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('hover and active states', () => {
    it('has hover scale effect', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('hover:scale-110');
    });

    it('has active scale effect', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('active:scale-95');
    });

    it('has hover shadow effect', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('shadow-sm', 'hover:shadow-md');
    });
  });

  describe('custom classes', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          className="custom-class"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('custom-class');
    });

    it('merges custom classes with default classes', () => {
      const { container } = render(
        <SocialLink
          href="#"
          icon={mockIcon}
          label="Test"
          className="mt-4 ml-2"
        />
      );

      const link = container.firstChild as HTMLElement;
      expect(link).toHaveClass('mt-4', 'ml-2', 'p-3');
    });
  });
});
