import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageWithFallback from '../ImageWithFallback';

describe('ImageWithFallback', () => {
  describe('with valid image', () => {
    it('renders img element with proper alt text', () => {
      render(<ImageWithFallback src="/test.jpg" alt="Test image" />);
      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
      expect(img.tagName).toBe('IMG');
    });

    it('applies custom className', () => {
      render(<ImageWithFallback src="/test.jpg" alt="Test image" className="custom-class" />);
      const img = screen.getByAltText('Test image');
      expect(img).toHaveClass('custom-class');
    });

    it('passes additional props to img element', () => {
      render(
        <ImageWithFallback
          src="/test.jpg"
          alt="Test image"
          data-testid="test-img"
          loading="lazy"
        />
      );
      const img = screen.getByTestId('test-img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('fallback state (missing src)', () => {
    it('renders fallback div with role="img"', () => {
      render(<ImageWithFallback src="" alt="Test image" />);
      const fallback = screen.getByRole('img');
      expect(fallback).toBeInTheDocument();
      expect(fallback.tagName).toBe('DIV');
    });

    it('uses alt text as aria-label when fallbackText not provided', () => {
      render(<ImageWithFallback src="" alt="Test image" />);
      const fallback = screen.getByRole('img');
      expect(fallback).toHaveAttribute('aria-label', 'Test image');
    });

    it('uses fallbackText as aria-label when provided', () => {
      render(
        <ImageWithFallback src="" alt="Test image" fallbackText="Custom fallback message" />
      );
      const fallback = screen.getByRole('img');
      expect(fallback).toHaveAttribute('aria-label', 'Custom fallback message');
    });

    it('displays PhotoIcon with aria-hidden="true"', () => {
      render(<ImageWithFallback src="" alt="Test image" />);
      const icon = document.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides fallbackText with aria-hidden="true"', () => {
      render(<ImageWithFallback src="" alt="Test image" fallbackText="Fallback text" />);
      const fallbackText = screen.getByText('Fallback text');
      expect(fallbackText).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not display a text span when fallbackText is not provided', () => {
      render(<ImageWithFallback src="" alt="Test image" />);
      const fallback = screen.getByRole('img');
      const fallbackTextElement = fallback.querySelector('.text-xs');
      expect(fallbackTextElement).not.toBeInTheDocument();
    });

    it('applies custom className to fallback div', () => {
      render(<ImageWithFallback src="" alt="Test image" className="custom-class" />);
      const fallback = screen.getByRole('img');
      expect(fallback).toHaveClass('custom-class');
    });
  });

  describe('fallback state (error loading)', () => {
    it('renders fallback div when image fails to load', () => {
      render(<ImageWithFallback src="/invalid.jpg" alt="Test image" />);

      const img = screen.getByAltText('Test image');

      fireEvent.error(img);

      expect(screen.queryByAltText('Test image')).not.toBeInTheDocument();
      const fallback = screen.getByRole('img');
      expect(fallback).toBeInTheDocument();
      expect(fallback.tagName).toBe('DIV');
    });

    it('provides default aria-label when alt and fallbackText not provided', () => {
      render(<ImageWithFallback src="" />);
      const fallback = screen.getByRole('img');
      expect(fallback).toHaveAttribute('aria-label', 'Gambar tidak tersedia');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes in fallback state', () => {
      render(<ImageWithFallback src="" alt="Test image" fallbackText="No image" />);
      const fallback = screen.getByRole('img');
      
      expect(fallback).toHaveAttribute('role', 'img');
      expect(fallback).toHaveAttribute('aria-label', 'No image');
    });

    it('hides decorative icon from screen readers', () => {
      render(<ImageWithFallback src="" alt="Test image" />);
      const icon = document.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('maintains semantic meaning when image is missing', () => {
      render(<ImageWithFallback src="" alt="Program logo" fallbackText="Logo program tidak tersedia" />);
      const fallback = screen.getByRole('img');
      expect(fallback).toHaveAttribute('aria-label', 'Logo program tidak tersedia');
    });
  });

  describe('dark mode', () => {
    it('applies dark mode classes in fallback state', () => {
      render(<ImageWithFallback src="" alt="Test image" />);
      const fallback = screen.getByRole('img');
      expect(fallback).toHaveClass('dark:bg-neutral-700', 'dark:text-neutral-500');
    });
  });
});
