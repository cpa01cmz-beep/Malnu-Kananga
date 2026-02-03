import React from 'react';
import OfflineBanner from '../ui/OfflineBanner';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import type { CacheFreshnessInfo, ValidationResult } from '../../utils/studentPortalValidator';
import type { SyncStatus } from '../../services/offlineDataService';

interface StudentPortalOfflineProps {
  bannerMode: 'offline' | 'slow' | 'both';
  showBanner: boolean;
  syncStatus: SyncStatus;
  onSync: () => void;
  isSyncLoading: boolean;
  cachedDataAvailable: boolean;
  validationResults: Record<string, ValidationResult>;
  cacheFreshness: CacheFreshnessInfo | null;
  showValidationDetails: boolean;
  onToggleValidationDetails: () => void;
}

export const StudentPortalOffline: React.FC<StudentPortalOfflineProps> = ({
  bannerMode,
  showBanner,
  syncStatus,
  onSync,
  isSyncLoading,
  cachedDataAvailable,
  validationResults,
  cacheFreshness,
  showValidationDetails,
  onToggleValidationDetails,
}) => {
  return (
    <>
      <OfflineBanner
        mode={bannerMode}
        show={showBanner}
        syncStatus={syncStatus.needsSync || syncStatus.pendingActions > 0 ? syncStatus : undefined}
        onSync={onSync}
        isSyncLoading={isSyncLoading}
        cachedDataAvailable={cachedDataAvailable}
        cachedDataInfo={cachedDataAvailable ? 'Data Offline Tersedia' : undefined}
      />

      {validationResults.student && (
        <div className="mb-4">
          {cacheFreshness && !cacheFreshness.isFresh && (
            <Alert variant="warning" size="md" fullWidth>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">Status Data Offline</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{cacheFreshness.message}</p>
                </div>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={onSync}
                  disabled={isSyncLoading}
                >
                  {isSyncLoading ? 'Sinkronisasi...' : 'Sinkronkan'}
                </Button>
              </div>
            </Alert>
          )}

          {(validationResults.grades?.warnings.length > 0 ||
            validationResults.attendance?.warnings.length > 0) && (
            <Alert variant="info" size="md" fullWidth className="mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">Validasi Data</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {validationResults.grades?.warnings.length || 0} peringatan nilai, {validationResults.attendance?.warnings.length || 0} peringatan kehadiran
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleValidationDetails}
                >
                  {showValidationDetails ? 'Tutup Detail' : 'Lihat Detail'}
                </Button>
              </div>
            </Alert>
          )}

          {showValidationDetails && (
            <div className="mt-2 space-y-2">
              {validationResults.grades?.warnings.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">Peringatan Nilai</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    {validationResults.grades.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.attendance?.warnings.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">Peringatan Kehadiran</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    {validationResults.attendance.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {(validationResults.student?.errors.length > 0 ||
            validationResults.grades?.errors.length > 0 ||
            validationResults.attendance?.errors.length > 0) && (
            <Alert variant="error" size="md" fullWidth className="mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">Error Validasi Data</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {validationResults.student?.errors.length || 0} error siswa, {validationResults.grades?.errors.length || 0} error nilai, {validationResults.attendance?.errors.length || 0} error kehadiran
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleValidationDetails}
                >
                  {showValidationDetails ? 'Tutup Detail' : 'Lihat Detail'}
                </Button>
              </div>
            </Alert>
          )}

          {showValidationDetails && (validationResults.student?.errors.length > 0 ||
            validationResults.grades?.errors.length > 0 ||
            validationResults.attendance?.errors.length > 0) && (
            <div className="mt-2 space-y-2">
              {validationResults.student?.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-2">Error Data Siswa</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    {validationResults.student.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.grades?.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-2">Error Data Nilai</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    {validationResults.grades.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResults.attendance?.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-2">Error Data Kehadiran</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    {validationResults.attendance.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentPortalOffline;
