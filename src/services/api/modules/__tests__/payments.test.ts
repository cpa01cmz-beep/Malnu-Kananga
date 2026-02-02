/**
 * paymentsAPI Module Tests
 * Module: src/services/api/modules/payments.ts
 * Issue: #1349 - Online Payment System Integration - Phase 3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentsAPI } from '../payments';
import { request } from '../../client';

// Mock the request function
vi.mock('../../client', () => ({
  request: vi.fn(),
}));

describe('paymentsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should call request with correct parameters', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment created successfully',
        data: {
          paymentId: 'PAY-123-456',
          paymentUrl: 'https://app.midtrans.com/snap/v3/pay/test-payment-id',
          expiryDate: '2026-02-03T10:00:00Z',
          transactionId: 'TRANS-123456',
        },
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const paymentRequest = {
        amount: 1000000,
        paymentType: 'Uang Sekolah',
        description: 'Pembayaran uang sekolah bulan Februari',
        studentId: 'STU-001',
        parentEmail: 'parent@example.com',
        paymentMethod: 'va' as const,
      };

      const result = await paymentsAPI.createPayment(paymentRequest);

      expect(request).toHaveBeenCalledWith('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify(paymentRequest),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = {
        success: false,
        message: 'Failed to create payment',
        error: 'Failed to create payment',
      };
      
      vi.mocked(request).mockResolvedValue(mockError);

      const paymentRequest = {
        amount: 1000000,
        paymentType: 'Uang Sekolah',
        description: 'Pembayaran uang sekolah',
        studentId: 'STU-001',
        parentEmail: 'parent@example.com',
        paymentMethod: 'qris' as const,
      };

      const result = await paymentsAPI.createPayment(paymentRequest);

      expect(result).toEqual(mockError);
    });

    it('should handle network errors', async () => {
      vi.mocked(request).mockRejectedValue(new Error('Network error'));

      const paymentRequest = {
        amount: 1000000,
        paymentType: 'Uang Sekolah',
        description: 'Pembayaran uang sekolah',
        studentId: 'STU-001',
        parentEmail: 'parent@example.com',
        paymentMethod: 'bank_transfer' as const,
      };

      await expect(paymentsAPI.createPayment(paymentRequest)).rejects.toThrow('Network error');
    });
  });

  describe('getPaymentStatus', () => {
    it('should call request with correct payment ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment status retrieved',
        data: {
          paymentId: 'PAY-123-456',
          status: 'paid' as const,
          amount: 1000000,
          paymentMethod: 'va',
          transactionId: 'TRANS-123456',
          paidAt: '2026-02-02T10:00:00Z',
        },
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentStatus('PAY-123-456');

      expect(request).toHaveBeenCalledWith('/api/payments/PAY-123-456/status');
      expect(result).toEqual(mockResponse);
    });

    it('should handle pending payment status', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment status retrieved',
        data: {
          paymentId: 'PAY-123-456',
          status: 'pending' as const,
          amount: 1000000,
          paymentMethod: 'qris',
          transactionId: 'TRANS-123456',
          expiryDate: '2026-02-03T10:00:00Z',
        },
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentStatus('PAY-123-456');

      expect(result.data?.status).toBe('pending');
    });

    it('should handle failed payment status', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment status retrieved',
        data: {
          paymentId: 'PAY-123-456',
          status: 'failed' as const,
          amount: 1000000,
          paymentMethod: 'ewallet',
          failureReason: 'Payment gateway error',
        },
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentStatus('PAY-123-456');

      expect(result.data?.status).toBe('failed');
      expect(result.data?.failureReason).toBe('Payment gateway error');
    });

    it('should handle expired payment status', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment status retrieved',
        data: {
          paymentId: 'PAY-123-456',
          status: 'expired' as const,
          amount: 1000000,
          paymentMethod: 'bank_transfer',
        },
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentStatus('PAY-123-456');

      expect(result.data?.status).toBe('expired');
    });
  });

  describe('getPaymentHistory', () => {
    it('should call request with correct student ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment history retrieved',
        data: [
          {
            id: 'PAY-001',
            paymentType: 'Uang Sekolah',
            amount: 1000000,
            status: 'paid' as const,
            paymentMethod: 'va',
            paymentDate: '2026-02-01T10:00:00Z',
            dueDate: '2026-02-01T10:00:00Z',
          },
          {
            id: 'PAY-002',
            paymentType: 'Uang Buku',
            amount: 500000,
            status: 'pending' as const,
            paymentMethod: 'qris',
            dueDate: '2026-02-15T10:00:00Z',
          },
        ],
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentHistory('STU-001');

      expect(request).toHaveBeenCalledWith('/api/payments/history?student_id=STU-001');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty payment history', async () => {
      const mockResponse = {
        success: true,
        message: 'No payments found',
        data: [],
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentHistory('STU-001');

      expect(result.data).toEqual([]);
    });

    it('should handle API errors', async () => {
      const mockError = {
        success: false,
        message: 'Failed to fetch payment history',
        error: 'Failed to fetch payment history',
      };
      
      vi.mocked(request).mockResolvedValue(mockError);

      const result = await paymentsAPI.getPaymentHistory('STU-001');

      expect(result).toEqual(mockError);
    });
  });

  describe('cancelPayment', () => {
    it('should call request with correct payment ID and POST method', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment cancelled successfully',
        data: null,
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await paymentsAPI.cancelPayment('PAY-123-456');

      expect(request).toHaveBeenCalledWith('/api/payments/PAY-123-456/cancel', {
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = {
        success: false,
        message: 'Payment cannot be cancelled',
        error: 'Payment cannot be cancelled',
      };
      
      vi.mocked(request).mockResolvedValue(mockError);

      const result = await paymentsAPI.cancelPayment('PAY-123-456');

      expect(result).toEqual(mockError);
    });

    it('should handle network errors', async () => {
      vi.mocked(request).mockRejectedValue(new Error('Network error'));

      await expect(paymentsAPI.cancelPayment('PAY-123-456')).rejects.toThrow('Network error');
    });
  });

  describe('Payment Method Types', () => {
    it('should accept valid payment method types', async () => {
      const paymentMethods = ['va', 'bank_transfer', 'ewallet', 'qris', 'credit_card'] as const;
      
      for (const method of paymentMethods) {
        const mockResponse = {
          success: true,
          message: 'Payment created',
          data: {
            paymentId: `PAY-${method}`,
            paymentUrl: 'https://example.com',
            expiryDate: '2026-02-03T10:00:00Z',
            transactionId: `TRANS-${method}`,
          },
        };
        
        vi.mocked(request).mockResolvedValue(mockResponse);

        await paymentsAPI.createPayment({
          amount: 1000000,
          paymentType: 'Test',
          description: 'Test payment',
          studentId: 'STU-001',
          parentEmail: 'test@example.com',
          paymentMethod: method,
        });

        expect(request).toHaveBeenCalled();
        vi.clearAllMocks();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large payment amounts', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment created',
        data: {
          paymentId: 'PAY-LARGE',
          paymentUrl: 'https://example.com',
          expiryDate: '2026-02-03T10:00:00Z',
          transactionId: 'TRANS-LARGE',
        },
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      await paymentsAPI.createPayment({
        amount: 100000000, // 100 million IDR
        paymentType: 'Uang Gedung',
        description: 'Pembayaran uang gedung',
        studentId: 'STU-001',
        parentEmail: 'parent@example.com',
        paymentMethod: 'va' as const,
      });

      expect(request).toHaveBeenCalled();
    });

    it('should handle very small payment amounts', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment created',
        data: {
          paymentId: 'PAY-SMALL',
          paymentUrl: 'https://example.com',
          expiryDate: '2026-02-03T10:00:00Z',
          transactionId: 'TRANS-SMALL',
        },
      };
      
      vi.mocked(request).mockResolvedValue(mockResponse);

      await paymentsAPI.createPayment({
        amount: 100, // 100 IDR
        paymentType: 'Biaya Kecil',
        description: 'Pembayaran biaya kecil',
        studentId: 'STU-001',
        parentEmail: 'parent@example.com',
        paymentMethod: 'qris' as const,
      });

      expect(request).toHaveBeenCalled();
    });
  });
});
