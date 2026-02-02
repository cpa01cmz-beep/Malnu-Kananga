/**
 * PaymentButton Component Tests
 * Component: src/components/PaymentButton.tsx
 * Issue: #1349 - Online Payment System Integration - Phase 3
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentButton from '../PaymentButton';

describe('PaymentButton', () => {
  const defaultProps = {
    amount: 100000,
    description: 'Uang Sekolah',
    onClick: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render button with correct text', () => {
      render(<PaymentButton {...defaultProps} />);
      expect(screen.getByText('Bayar Sekarang')).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      render(<PaymentButton {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with custom variant', () => {
      render(<PaymentButton {...defaultProps} variant="primary" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(<PaymentButton {...defaultProps} size="lg" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label attribute', () => {
      render(<PaymentButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('should include payment description in aria-label', () => {
      render(<PaymentButton {...defaultProps} />);
      const button = screen.getByRole('button');
      const ariaLabel = button.getAttribute('aria-label') || '';
      expect(ariaLabel).toContain('Uang Sekolah');
    });

    it('should include amount in aria-label', () => {
      render(<PaymentButton {...defaultProps} />);
      const button = screen.getByRole('button');
      const ariaLabel = button.getAttribute('aria-label') || '';
      expect(ariaLabel).toContain('Rp');
      expect(ariaLabel).toContain('100.000');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when button is clicked', () => {
      const handleClick = vi.fn();
      render(<PaymentButton {...defaultProps} onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      button.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', () => {
      const handleClick = vi.fn();
      render(<PaymentButton {...defaultProps} onClick={handleClick} disabled={true} />);
      
      const button = screen.getByRole('button');
      button.click();
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render with disabled attribute when disabled', () => {
      const { container } = render(<PaymentButton {...defaultProps} disabled={true} />);
      const button = container.querySelector('button');
      expect(button).toBeDisabled();
    });

    it('should not render with disabled attribute by default', () => {
      const { container } = render(<PaymentButton {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount', () => {
      render(<PaymentButton {...defaultProps} amount={0} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle large amount', () => {
      render(<PaymentButton {...defaultProps} amount={10000000} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle empty description', () => {
      render(<PaymentButton {...defaultProps} description="" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle special characters in description', () => {
      render(<PaymentButton {...defaultProps} description="Uang Gedung & Lab" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
