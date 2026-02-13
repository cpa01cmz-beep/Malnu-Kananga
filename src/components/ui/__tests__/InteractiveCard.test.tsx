import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InteractiveCard from '../InteractiveCard';

describe('InteractiveCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic rendering', () => {
    it('renders children correctly', () => {
      render(
        <InteractiveCard>
          <div data-testid="card-content">Card Content</div>
        </InteractiveCard>
      );

      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(
        <InteractiveCard className="custom-class">
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('keyboard accessibility', () => {
    it('has role="button" when onClick is provided', () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });

    it('has tabIndex=0 when onClick is provided and not disabled', () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('has tabIndex=-1 when disabled', () => {
      render(
        <InteractiveCard onClick={mockOnClick} disabled>
          <div>Disabled Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button', { hidden: true });
      expect(card).toHaveAttribute('tabIndex', '-1');
    });

    it('calls onClick when Enter key is pressed', async () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onClick when Space key is pressed', async () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onClick when other keys are pressed', () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Tab' });

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when disabled', () => {
      render(
        <InteractiveCard onClick={mockOnClick} disabled>
          <div>Disabled Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button', { hidden: true });
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('calls onClick on mouse click', () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ARIA attributes', () => {
    it('has aria-label when provided', () => {
      render(
        <InteractiveCard onClick={mockOnClick} ariaLabel="Custom Card Label">
          <div>Card</div>
        </InteractiveCard>
      );

      const card = screen.getByLabelText('Custom Card Label');
      expect(card).toBeInTheDocument();
    });

    it('has aria-disabled when disabled', () => {
      render(
        <InteractiveCard onClick={mockOnClick} disabled>
          <div>Disabled Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button', { hidden: true });
      expect(card).toHaveAttribute('aria-disabled', 'true');
    });

    it('has aria-describedby when ariaDescription is provided', () => {
      render(
        <InteractiveCard 
          onClick={mockOnClick} 
          ariaLabel="Card" 
          ariaDescription="This is a detailed description"
        >
          <div>Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      const describedById = card.getAttribute('aria-describedby');
      expect(describedById).toBeTruthy();

      const description = document.getElementById(describedById!);
      expect(description).toHaveTextContent('This is a detailed description');
      expect(description).toHaveClass('sr-only');
    });
  });

  describe('button variant', () => {
    it('renders as native button when as="button"', () => {
      render(
        <InteractiveCard as="button" onClick={mockOnClick}>
          <div>Native Button Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      expect(card.tagName.toLowerCase()).toBe('button');
    });

    it('has disabled attribute when as="button" and disabled', () => {
      render(
        <InteractiveCard as="button" onClick={mockOnClick} disabled>
          <div>Disabled Button Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      expect(card).toBeDisabled();
    });
  });

  describe('anchor variant', () => {
    it('renders as anchor when as="a" with href', () => {
      render(
        <InteractiveCard as="a" href="https://example.com">
          <div>Link Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('link');
      expect(card.tagName.toLowerCase()).toBe('a');
      expect(card).toHaveAttribute('href', 'https://example.com');
    });

    it('has no href when disabled', () => {
      render(
        <InteractiveCard as="a" href="https://example.com" disabled>
          <div>Disabled Link Card</div>
        </InteractiveCard>
      );

      const card = document.querySelector('a');
      expect(card).not.toHaveAttribute('href');
    });
  });

  describe('visual feedback', () => {
    it('applies scale transform when pressed', () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      
      fireEvent.mouseDown(card);
      expect(card.className).toContain('scale-[0.98]');

      fireEvent.mouseUp(card);
      expect(card.className).not.toContain('scale-[0.98]');
    });

    it('applies focus ring when focused', () => {
      render(
        <InteractiveCard onClick={mockOnClick}>
          <div>Clickable Card</div>
        </InteractiveCard>
      );

      const card = screen.getByRole('button');
      
      fireEvent.focus(card);
      expect(card.className).toContain('ring-2');

      fireEvent.blur(card);
      expect(card.className).not.toContain('ring-2');
    });
  });

  describe('hover effects', () => {
    it('applies lift effect by default', () => {
      render(
        <InteractiveCard>
          <div>Card</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Card').parentElement;
      expect(card).toHaveClass('hover-lift');
    });

    it('applies custom hover effect when specified', () => {
      render(
        <InteractiveCard hoverEffect="glow">
          <div>Card</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Card').parentElement;
      expect(card).toHaveClass('hover-glow');
    });
  });
});
