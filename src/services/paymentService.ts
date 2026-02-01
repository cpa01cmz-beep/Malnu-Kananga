import { logger } from '../utils/logger';
import { classifyError, logError, getUserFriendlyMessage, ErrorContext } from '../utils/errorHandler';

export interface PaymentRequest {
  amount: number;
  paymentType: string;
  description: string;
  studentId: string;
  parentEmail: string;
  paymentMethod: 'va' | 'bank_transfer' | 'ewallet' | 'qris' | 'credit_card';
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    paymentId: string;
    paymentUrl: string;
    expiryDate: string;
    transactionId: string;
  };
  error?: string;
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

export interface WebhookPayload {
  paymentId: string;
  transactionId: string;
  status: 'paid' | 'failed' | 'expired' | 'cancelled';
  signature: string;
  timestamp: string;
}

const PAYMENT_API_URL = (import.meta.env.VITE_PAYMENT_GATEWAY_URL as string) || 'https://app.midtrans.com/snap/v1';
const PAYMENT_API_KEY = (import.meta.env.VITE_PAYMENT_API_KEY as string) || '';

class PaymentService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = PAYMENT_API_URL;
    this.apiKey = PAYMENT_API_KEY;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      logger.info('Creating payment:', { amount: request.amount, paymentType: request.paymentType });

      const orderId = this.generateOrderId(request.studentId, Date.now());

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.encodeBase64(this.apiKey + ':')}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: request.amount,
          },
          customer_details: {
            email: request.parentEmail,
            first_name: request.description.split(' ')[0] || 'Orang Tua',
            last_name: '',
          },
          payment_method: request.paymentMethod,
          item_details: [
            {
              id: request.paymentType,
              price: request.amount,
              quantity: 1,
              name: request.description,
            },
          ],
          expiry: {
            unit: 'hours',
            duration: 24,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      logger.info('Payment created successfully:', { paymentId: data.order_id });

      return {
        success: true,
        message: 'Pembayaran berhasil dibuat',
        data: {
          paymentId: data.order_id,
          paymentUrl: data.redirect_url,
          expiryDate: this.calculateExpiryDate(24),
          transactionId: data.transaction_id,
        },
      };
    } catch (error) {
      const context: ErrorContext = {
        operation: 'createPayment',
        timestamp: Date.now(),
      };
      const classifiedError = classifyError(error, context);
      logError(classifiedError);
      logger.error('Payment creation error:', error);

      return {
        success: false,
        message: getUserFriendlyMessage(classifiedError),
        error: classifiedError.message,
      };
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<{ success: boolean; status?: PaymentStatus; error?: string }> {
    try {
      logger.info('Checking payment status:', { paymentId });

      const response = await fetch(`${this.baseUrl}/transactions/${paymentId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.encodeBase64(this.apiKey + ':')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check payment status: ${response.status}`);
      }

      const data = await response.json();

      const status: PaymentStatus = {
        paymentId: data.order_id,
        status: data.transaction_status,
        amount: data.gross_amount,
        paymentMethod: data.payment_type,
        transactionId: data.transaction_id,
        paidAt: data.settlement_time,
        failureReason: data.failure_reason,
      };

      logger.info('Payment status checked:', { paymentId, status: status.status });

      return { success: true, status };
    } catch (error) {
      const context: ErrorContext = {
        operation: 'checkPaymentStatus',
        timestamp: Date.now(),
      };
      const classifiedError = classifyError(error, context);
      logError(classifiedError);
      logger.error('Payment status check error:', error);

      return {
        success: false,
        error: getUserFriendlyMessage(classifiedError),
      };
    }
  }

  async handlePaymentCallback(payload: WebhookPayload): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      logger.info('Handling payment callback:', { paymentId: payload.paymentId, status: payload.status });

      if (!this.verifyWebhookSignature(payload)) {
        logger.error('Invalid webhook signature:', payload);
        return {
          success: false,
          message: 'Tanda tangan webhook tidak valid',
          error: 'Invalid webhook signature',
        };
      }

      const response = await fetch('/api/payments/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to process webhook: ${response.status}`);
      }

      logger.info('Payment callback processed successfully:', { paymentId: payload.paymentId });

      return { success: true, message: 'Webhook berhasil diproses' };
    } catch (error) {
      const context: ErrorContext = {
        operation: 'handlePaymentCallback',
        timestamp: Date.now(),
      };
      const classifiedError = classifyError(error, context);
      logError(classifiedError);
      logger.error('Payment callback error:', error);

      return {
        success: false,
        message: getUserFriendlyMessage(classifiedError),
        error: classifiedError.message,
      };
    }
  }

  async cancelPayment(paymentId: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      logger.info('Cancelling payment:', { paymentId });

      const response = await fetch(`${this.baseUrl}/transactions/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.encodeBase64(this.apiKey + ':')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel payment: ${response.status}`);
      }

      logger.info('Payment cancelled successfully:', { paymentId });

      return { success: true, message: 'Pembayaran berhasil dibatalkan' };
    } catch (error) {
      const context: ErrorContext = {
        operation: 'cancelPayment',
        timestamp: Date.now(),
      };
      const classifiedError = classifyError(error, context);
      logError(classifiedError);
      logger.error('Payment cancellation error:', error);

      return {
        success: false,
        message: getUserFriendlyMessage(classifiedError),
        error: classifiedError.message,
      };
    }
  }

  private generateOrderId(studentId: string, timestamp: number): string {
    return `PAY-${studentId}-${timestamp}`;
  }

  private calculateExpiryDate(hours: number): string {
    const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    return expiryDate.toISOString();
  }

  private encodeBase64(input: string): string {
    try {
      return window.btoa(input);
    } catch (error) {
      logger.error('Base64 encoding error:', error);
      return '';
    }
  }

  private verifyWebhookSignature(payload: WebhookPayload): boolean {
    if (!payload.signature) {
      return false;
    }

    const expectedSignature = this.generateSignature(payload);
    return payload.signature === expectedSignature;
  }

  private generateSignature(payload: WebhookPayload): string {
    const dataString = `${payload.paymentId}|${payload.transactionId}|${payload.status}|${payload.timestamp}`;

    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }
}

export const paymentService = new PaymentService();
