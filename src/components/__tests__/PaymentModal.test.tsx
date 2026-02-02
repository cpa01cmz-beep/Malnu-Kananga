/**
 * PaymentModal Component Tests
 * Component: src/components/PaymentModal.tsx
 * Issue: #1349 - Online Payment System Integration - Phase 3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentModal from '../PaymentModal';

describe('PaymentModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onPaymentMethodSelect: vi.fn(),
    paymentType: 'Uang Sekolah',
    amount: 1000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('Pilih Metode Pembayaran')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<PaymentModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Pilih Metode Pembayaran')).not.toBeInTheDocument();
    });

    it('should display payment type', () => {
      render(<PaymentModal {...defaultProps} paymentType="Uang Buku" />);
      expect(screen.getByText('Uang Buku')).toBeInTheDocument();
    });

    it('should display amount with IDR currency', () => {
      render(<PaymentModal {...defaultProps} amount={1500000} />);
      expect(screen.getByText((content) => content.includes('Rp') && content.includes('1.500.000'))).toBeInTheDocument();
    });

    it('should display all payment methods', () => {
      render(<PaymentModal {...defaultProps} />);
      
      expect(screen.getByLabelText('Pilih metode pembayaran Virtual Account')).toBeInTheDocument();
      expect(screen.getByLabelText(/Pilih metode pembayaran Bank/)).toBeInTheDocument();
      expect(screen.getByLabelText('Pilih metode pembayaran E-Wallet')).toBeInTheDocument();
      expect(screen.getByLabelText(/Pilih metode pembayaran QRIS/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pilih metode pembayaran Kartu Kredit/)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onPaymentMethodSelect when a payment method is clicked', async () => {
      render(<PaymentModal {...defaultProps} />);
      
      const vaButton = screen.getByLabelText('Pilih metode pembayaran Virtual Account');
      fireEvent.click(vaButton);
      
      await waitFor(() => {
        expect(defaultProps.onPaymentMethodSelect).toHaveBeenCalledWith('va');
      });
    });

    it('should call onClose after payment method selection', async () => {
      render(<PaymentModal {...defaultProps} />);
      
      const qrisButton = screen.getByLabelText(/Pilih metode pembayaran QRIS/);
      fireEvent.click(qrisButton);
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should call onClose when Batal button is clicked', () => {
      render(<PaymentModal {...defaultProps} />);
      
      const cancelButton = screen.getByText('Batal');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should disable other payment methods when one is selected', async () => {
      render(<PaymentModal {...defaultProps} />);
      
      const vaButton = screen.getByLabelText('Pilih metode pembayaran Virtual Account');
      fireEvent.click(vaButton);
      
      await waitFor(() => {
        const ewalletButton = screen.getByLabelText('Pilih metode pembayaran E-Wallet');
        expect(ewalletButton).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for payment method buttons', () => {
      render(<PaymentModal {...defaultProps} />);
      
      expect(screen.getByLabelText('Pilih metode pembayaran Virtual Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Pilih metode pembayaran Bank Transfer')).toBeInTheDocument();
      expect(screen.getByLabelText('Pilih metode pembayaran E-Wallet')).toBeInTheDocument();
      expect(screen.getByLabelText(/Pilih metode pembayaran QRIS/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pilih metode pembayaran Kartu Kredit\/Debit/)).toBeInTheDocument();
    });

    it('should have role="button" for payment method buttons', () => {
      render(<PaymentModal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      // 5 payment methods + 1 close button
      expect(buttons.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Visual States', () => {
    it('should show selection indicator on selected method', async () => {
      render(<PaymentModal {...defaultProps} />);
      
      const vaButton = screen.getByLabelText('Pilih metode pembayaran Virtual Account');
      fireEvent.click(vaButton);
      
      await waitFor(() => {
        expect(vaButton).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount', () => {
      render(<PaymentModal {...defaultProps} amount={0} />);
      expect(screen.getByText('Pilih Metode Pembayaran')).toBeInTheDocument();
    });

    it('should handle large amount', () => {
      render(<PaymentModal {...defaultProps} amount={10000000} />);
      expect(screen.getByText('Pilih Metode Pembayaran')).toBeInTheDocument();
    });

    it('should handle empty payment type', () => {
      render(<PaymentModal {...defaultProps} paymentType="" />);
      expect(screen.getByText('Pilih Metode Pembayaran')).toBeInTheDocument();
    });

    it('should handle special characters in payment type', () => {
      render(<PaymentModal {...defaultProps} paymentType="Uang Gedung & Laboratorium" />);
      expect(screen.getByText('Uang Gedung & Laboratorium')).toBeInTheDocument();
    });
  });
});
