// api/modules/payments.ts - Payment API Module

import { request, type ApiResponse } from '../client';

export interface CreatePaymentRequest {
  amount: number;
  paymentType: string;
  description: string;
  studentId: string;
  parentEmail: string;
  paymentMethod: 'va' | 'bank_transfer' | 'ewallet' | 'qris' | 'credit_card';
}

export interface PaymentData {
  paymentId: string;
  paymentUrl: string;
  expiryDate: string;
  transactionId: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paidAt?: string;
  failureReason?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status?: PaymentStatus;
  error?: string;
}

export const paymentsAPI = {
  async createPayment(paymentRequest: CreatePaymentRequest): Promise<ApiResponse<PaymentData>> {
    return request<PaymentData>('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify(paymentRequest),
    });
  },

  async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentStatusResponse['status']>> {
    return request<PaymentStatusResponse['status']>(`/api/payments/${paymentId}/status`);
  },

  async getPaymentHistory(studentId: string): Promise<ApiResponse<unknown[]>> {
    return request<unknown[]>(`/api/payments/history?student_id=${studentId}`);
  },

  async cancelPayment(paymentId: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/payments/${paymentId}/cancel`, {
      method: 'POST',
    });
  },
};
