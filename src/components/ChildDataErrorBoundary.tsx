import React from 'react';
import Card from './ui/Card';
import { UserIcon } from './icons/UserIcon';

interface ChildDataErrorBoundaryProps {
  selectedChild: {
    studentId: string;
    studentName: string;
    className?: string;
  } | null;
  onRetry: () => void;
  onShowToast: (msg: string, type: 'error' | 'info' | 'success') => void;
}

const ChildDataErrorBoundary: React.FC<ChildDataErrorBoundaryProps> = ({
  selectedChild,
  onRetry,
  onShowToast
}) => {
  if (!selectedChild) {
    return (
      <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Data Anak Tidak Tersedia
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">
              Data anak tidak dapat dimuat. Hal ini dapat terjadi karena:
            </p>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mb-4 space-y-1">
              <li>Koneksi internet bermasalah</li>
              <li>Data anak sedang diperbarui</li>
              <li>Terjadi kesalahan teknis</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => onShowToast('Menggunakan mode offline', 'info')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Mode Offline
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <UserIcon />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Data Anak Terbatas
          </h3>
          <p className="text-yellow-600 dark:text-yellow-400">
            Beberapa data untuk {selectedChild.studentName} mungkin tidak lengkap.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ChildDataErrorBoundary;