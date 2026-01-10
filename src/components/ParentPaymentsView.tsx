import React, { useState, useEffect } from 'react';
import { UserIcon } from './icons/UserIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ToastType } from './Toast';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Alert from './ui/Alert';
import type { ParentChild, ParentPayment } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { validateParentPayment } from '../utils/parentValidation';
import { GRADIENT_CLASSES } from '../config/gradients';

interface ParentPaymentsViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  children: ParentChild[];
}

interface ChildPaymentSummary {
  child: ParentChild;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  payments: ParentPayment[];
}

const ParentPaymentsView: React.FC<ParentPaymentsViewProps> = ({ onShowToast, children }) => {
  const [paymentData, setPaymentData] = useState<ChildPaymentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'all'>('current');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (children.length === 0) return;

      setLoading(true);
      try {
        const childPromises = children.map(async (child) => {
          const response = await parentsAPI.getPaymentHistory(child.studentId);
          const payments = response.success ? (response.data || []) : [];

          const validPayments = payments.filter(payment => {
            const validation = validateParentPayment(payment);
            if (!validation.isValid) {
              logger.error(`Invalid payment data for child ${child.studentId}:`, validation.errors);
            }
            return validation.isValid;
          });

          const paidAmount = validPayments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);

          const pendingAmount = validPayments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

          const overdueAmount = validPayments
            .filter(p => p.status === 'overdue')
            .reduce((sum, p) => sum + p.amount, 0);

          return {
            child,
            totalAmount: paidAmount + pendingAmount + overdueAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            payments: validPayments
          };
        });

        const results = await Promise.all(childPromises);
        setPaymentData(results);
      } catch (error) {
        logger.error('Failed to fetch payment data:', error);
        onShowToast('Gagal memuat data pembayaran', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [children, onShowToast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusVariant = (status: ParentPayment['status']) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'neutral';
    }
  };

  const getStatusText = (status: ParentPayment['status']) => {
    switch (status) {
      case 'paid': return 'Lunas';
      case 'pending': return 'Menunggu';
      case 'overdue': return 'Terlambat';
      default: return status;
    }
  };

  const toggleDetails = (childId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [childId]: !prev[childId]
    }));
  };

  const exportPaymentReport = () => {
    onShowToast('Mengunduh laporan pembayaran...', 'info');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPending = paymentData.reduce((sum, data) => sum + data.pendingAmount, 0);
  const totalOverdue = paymentData.reduce((sum, data) => sum + data.overdueAmount, 0);
  const totalPaid = paymentData.reduce((sum, data) => sum + data.paidAmount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Pembayaran</h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'current' | 'all')}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="current">Periode Saat Ini</option>
              <option value="all">Semua Periode</option>
            </select>
            <Button
              variant="green-solid"
              size="md"
              onClick={exportPaymentReport}
              icon={<DocumentTextIcon />}
            >
              Unduh Laporan
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Alert
            variant="warning"
            size="lg"
            icon={<CalendarDaysIcon />}
            fullWidth
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalPending)}
                </p>
              </div>
            </div>
          </Alert>

          <Alert
            variant="error"
            size="lg"
            icon={<CalendarDaysIcon />}
            fullWidth
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1">Terlambat</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalOverdue)}
                </p>
              </div>
            </div>
          </Alert>

          <Alert
            variant="success"
            size="lg"
            icon={<UserIcon />}
            fullWidth
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1">Sudah Dibayar</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </Alert>
        </div>
      </div>

      {/* Individual Payment Details */}
      {paymentData.map((data) => (
        <div key={data.child.studentId} className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`${GRADIENT_CLASSES.GREEN_MEDIUM} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                {data.child.studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{data.child.studentName}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{data.child.className}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => toggleDetails(data.child.studentId)}
            >
              {showDetails[data.child.studentId] ? 'Sembunyikan' : 'Lihat'} Detail
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Alert variant="neutral" size="md" fullWidth>
              <p className="text-sm mb-1">Total</p>
              <p className="text-lg font-bold">
                {formatCurrency(data.totalAmount)}
              </p>
            </Alert>
            <Alert variant="success" size="md" fullWidth>
              <p className="text-sm mb-1">Lunas</p>
              <p className="text-lg font-bold">
                {formatCurrency(data.paidAmount)}
              </p>
            </Alert>
            <Alert variant="warning" size="md" fullWidth>
              <p className="text-sm mb-1">Menunggu</p>
              <p className="text-lg font-bold">
                {formatCurrency(data.pendingAmount)}
              </p>
            </Alert>
            <Alert variant="error" size="md" fullWidth>
              <p className="text-sm mb-1">Terlambat</p>
              <p className="text-lg font-bold">
                {formatCurrency(data.overdueAmount)}
              </p>
            </Alert>
          </div>

          {showDetails[data.child.studentId] && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Rincian Pembayaran</h4>
              <div className="space-y-3">
                {data.payments.map((payment) => (
                  <div key={payment.id} className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900 dark:text-white">{payment.paymentType}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{payment.description}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          Jatuh tempo: {formatDate(payment.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900 dark:text-white mb-2">
                          {formatCurrency(payment.amount)}
                        </p>
                        <Badge variant={getStatusVariant(payment.status)} size="md">
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ParentPaymentsView;