// api/modules/payments.ts - Payment API Module

import { request, type ApiResponse } from '../client';
import type { ParentPayment } from '../../../types/users';
import { API_ENDPOINTS } from '../../../constants';

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
    return request<PaymentData>(API_ENDPOINTS.PAYMENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(paymentRequest),
    });
  },

  async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentStatusResponse['status']>> {
    return request<PaymentStatusResponse['status']>(API_ENDPOINTS.PAYMENTS.STATUS(paymentId));
  },

  async getPaymentHistory(studentId: string): Promise<ApiResponse<ParentPayment[]>> {
    return request<ParentPayment[]>(API_ENDPOINTS.PAYMENTS.HISTORY(studentId));
  },

  async cancelPayment(paymentId: string): Promise<ApiResponse<null>> {
    return request<null>(API_ENDPOINTS.PAYMENTS.CANCEL(paymentId), {
      method: 'POST',
    });
  },
};
