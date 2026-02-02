import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentMethodSelect: (method: 'va' | 'bank_transfer' | 'ewallet' | 'qris' | 'credit_card') => void;
  paymentType: string;
  amount: number;
}

interface PaymentMethod {
  id: 'va' | 'bank_transfer' | 'ewallet' | 'qris' | 'credit_card';
  name: string;
  description: string;
  icon: string;
  color: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'va',
    name: 'Virtual Account',
    description: 'Transfer ke Virtual Account bank (BCA, BNI, BRI, Mandiri, dll)',
    icon: '💳',
    color: 'blue',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Transfer langsung ke rekening sekolah',
    icon: '🏦',
    color: 'green',
  },
  {
    id: 'ewallet',
    name: 'E-Wallet',
    description: 'Bayar menggunakan GoPay, OVO, DANA, ShopeePay',
    icon: '📱',
    color: 'purple',
  },
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Scan QRIS untuk pembayaran cepat',
    icon: '📷',
    color: 'orange',
  },
  {
    id: 'credit_card',
    name: 'Kartu Kredit/Debit',
    description: 'Bayar menggunakan kartu kredit atau debit',
    icon: '💳',
    color: 'red',
  },
];

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentMethodSelect,
  paymentType,
  amount,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'va' | 'bank_transfer' | 'ewallet' | 'qris' | 'credit_card' | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method.id);
    setTimeout(() => {
      onPaymentMethodSelect(method.id);
      onClose();
    }, 300);
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-500 dark:hover:border-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-500 dark:hover:border-orange-600',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-500 dark:hover:border-red-600',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Metode Pembayaran"
      description="Pilih metode pembayaran yang Anda inginkan"
      size="lg"
      animation="fade-in-up"
      closeOnBackdropClick
      closeOnEscape
      showCloseButton
    >
      <div className="space-y-6">
        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            Jenis Pembayaran:
          </p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {paymentType}
          </p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-3">
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Metode Pembayaran:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method)}
                disabled={selectedMethod !== null}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${colorClasses[method.color]}
                  ${selectedMethod === method.id ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-primary-400 dark:ring-offset-neutral-800' : ''}
                  ${selectedMethod !== null && selectedMethod !== method.id ? 'opacity-50' : 'hover:shadow-md active:scale-[0.98]'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 dark:focus:ring-offset-neutral-800
                `}
                aria-label={`Pilih metode pembayaran ${method.name}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {method.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {method.name}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {method.description}
                    </p>
                  </div>
                  {selectedMethod === method.id && (
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-pulse" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={selectedMethod !== null}
          >
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
