/**
 * Payment Configuration - Flexy: Never hardcode payment methods!
 * Centralized payment method configurations
 */

import { CreditCardIcon, BanknotesIcon, QrCodeIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    isActive: boolean;
    processingFee?: number;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'transfer',
        name: 'Transfer Bank',
        description: 'Bayar melalui transfer bank',
        icon: BuildingLibraryIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        isActive: true,
        processingFee: 0,
    },
    {
        id: 'virtual_account',
        name: 'Virtual Account',
        description: 'Bayar melalui virtual account',
        icon: CreditCardIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        isActive: true,
        processingFee: 2500,
    },
    {
        id: 'qris',
        name: 'QRIS',
        description: 'Scan QR code untuk bayar',
        icon: QrCodeIcon,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        isActive: true,
        processingFee: 0,
    },
    {
        id: 'cash',
        name: 'Tunai',
        description: 'Bayar langsung di sekolah',
        icon: BanknotesIcon,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        isActive: true,
        processingFee: 0,
    },
] as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    [PAYMENT_STATUS.PENDING]: 'Menunggu Pembayaran',
    [PAYMENT_STATUS.PROCESSING]: 'Diproses',
    [PAYMENT_STATUS.COMPLETED]: 'Selesai',
    [PAYMENT_STATUS.FAILED]: 'Gagal',
    [PAYMENT_STATUS.CANCELLED]: 'Dibatalkan',
    [PAYMENT_STATUS.REFUNDED]: 'Dikembalikan',
} as const;

export const PAYMENT_CONFIG = {
    /** Minimum payment amount in IDR */
    MIN_AMOUNT: 10000,
    /** Maximum payment amount in IDR */
    MAX_AMOUNT: 100000000,
    /** Default expiry time in hours */
    DEFAULT_EXPIRY_HOURS: 24,
    /** Retry attempts for failed payments */
    MAX_RETRY_ATTEMPTS: 3,
    /** Delay after selection before closing modal (ms) */
    SELECTION_DELAY_MS: 300,
} as const;
