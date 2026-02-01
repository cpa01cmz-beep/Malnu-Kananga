import React from 'react';
import Button from './ui/Button';

export interface PaymentButtonProps {
  amount: number;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  onClick,
  disabled = false,
  variant = 'success',
  size = 'md',
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Bayar ${description} sebesar ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount)}`}
    >
      Bayar Sekarang
    </Button>
  );
};

export default PaymentButton;
