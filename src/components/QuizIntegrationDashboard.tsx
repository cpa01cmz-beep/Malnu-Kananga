import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import {
  integrateAllQuizAttempts,
  getIntegrationStatus,
  type BatchIntegrationResult,
} from '../services/quizGradeIntegrationService';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { EmptyState } from './ui/LoadingState';
import LoadingSpinner from './ui/LoadingSpinner';
import ProgressBar from './ui/ProgressBar';

interface QuizIntegrationDashboardProps {
  onBack: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const QuizIntegrationDashboard: React.FC<QuizIntegrationDashboardProps> = ({
  onBack,
  onShowToast = () => {}
}) => {
  const currentUser = authAPI.getCurrentUser();
  const [status, setStatus] = useState<{
    totalAttempts: number;
    integratedCount: number;
    pendingCount: number;
  }>({
    totalAttempts: 0,
    integratedCount: 0,
    pendingCount: 0
  });
  const [integrating, setIntegrating] = useState(false);
  const [lastResult, setLastResult] = useState<BatchIntegrationResult | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    onShowToast(msg, type);
  }, [onShowToast]);

  const loadStatus = useCallback(() => {
    try {
      const integrationStatus = getIntegrationStatus();
      setStatus({
        totalAttempts: integrationStatus.totalAttempts,
        integratedCount: integrationStatus.integratedCount,
        pendingCount: integrationStatus.pendingCount
      });
    } catch (error) {
      logger.error('Failed to load integration status:', error);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleIntegrateAll = async () => {
    if (!currentUser?.id) {
      showToast('Anda harus login untuk mengintegrasikan kuis', 'error');
      return;
    }

    try {
      setIntegrating(true);
      showToast('Mengintegrasikan hasil kuis...', 'info');

      const result = await integrateAllQuizAttempts(currentUser.id);

      setLastResult(result);
      loadStatus();

      if (result.succeeded > 0) {
        showToast(
          `${result.succeeded} kuis berhasil diintegrasikan ke nilai`,
          'success'
        );
      }

      if (result.failed > 0) {
        showToast(
          `${result.failed} kuis gagal diintegrasikan. Coba lagi.`,
          'error'
        );
      }

      if (result.skipped > 0) {
        showToast(
          `${result.skipped} kuis sudah memiliki nilai dan dilewati`,
          'warning'
        );
      }

      if (result.total === 0) {
        showToast('Tidak ada hasil kuis yang perlu diintegrasikan', 'info');
      }
    } catch (error) {
      logger.error('Failed to integrate quiz attempts:', error);
      showToast('Gagal mengintegrasikan kuis. Silakan coba lagi.', 'error');
    } finally {
      setIntegrating(false);
    }
  };

  const canIntegrate = status.pendingCount > 0;

  return (
    <div className="pt-24 min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack}>
            Kembali
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Integrasi Kuis ke Nilai
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Otomatis mengonversi hasil kuis siswa ke entri nilai buku nilai
        </p>

        {status.totalAttempts === 0 ? (
          <Card className="p-8 text-center">
            <EmptyState
              icon="📝"
              title="Tidak Ada Hasil Kuis"
              message="Belum ada siswa yang menyelesaikan kuis"
              submessage="Hasil kuis akan muncul di sini setelah siswa mengirim jawaban kuis"
            />
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Status Integrasi
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Total Hasil Kuis
                  </span>
                  <Badge variant="info">
                    {status.totalAttempts}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Sudah Diintegrasikan
                  </span>
                  <Badge variant="success">
                    {status.integratedCount}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Menunggu Integrasi
                  </span>
                  <Badge variant={canIntegrate ? 'warning' : 'default'}>
                    {status.pendingCount}
                  </Badge>
                </div>

                {status.totalAttempts > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <ProgressBar
                      value={status.integratedCount}
                      max={status.totalAttempts}
                      label={`Integrasi Selesai: ${Math.round((status.integratedCount / status.totalAttempts) * 100)}%`}
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Integrasi Massal
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Integrasikan semua hasil kuis yang belum terintegrasi ke buku nilai.
                Integrasi akan membuat entri nilai baru dengan tipe &quot;quiz&quot;.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={handleIntegrateAll}
                  disabled={!canIntegrate || integrating}
                  fullWidth
                >
                  {integrating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Integrasikan {status.pendingCount} Hasil Kuis
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={loadStatus}
                  disabled={integrating}
                >
                  Refresh
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Catatan:</strong> Kuis yang sudah diintegrasikan akan
                  dilewati saat integrasi berikutnya untuk menghindari duplikasi.
                </p>
              </div>
            </Card>

            {lastResult && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Hasil Integrasi Terakhir
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Total Diproses
                    </span>
                    <Badge variant="info">{lastResult.total}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Berhasil
                    </span>
                    <Badge variant="success">{lastResult.succeeded}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Gagal
                    </span>
                    <Badge variant="error">{lastResult.failed}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Dilewati
                    </span>
                    <Badge variant="warning">{lastResult.skipped}</Badge>
                  </div>
                </div>

                {lastResult.failed > 0 && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Detail Kegagalan
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {lastResult.results
                        .filter(r => !r.success && r.error)
                        .map((result, index) => (
                          <li key={index} className="text-red-700 dark:text-red-300">
                            • {result.message}: {result.error}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizIntegrationDashboard;
