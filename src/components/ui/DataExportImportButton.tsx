import React, { useState, useRef } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { dataExportImportService, type DataEntityType, type ImportFormat } from '../../services/dataExportImportService';
import { logger } from '../../utils/logger';

interface DataExportImportButtonProps {
  entityType: DataEntityType;
  showExport?: boolean;
  showImport?: boolean;
  showBackup?: boolean;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onExportSuccess?: (filename: string) => void;
  onImportSuccess?: (result: { imported: number; skipped: number }) => void;
  onError?: (error: string) => void;
}

const DataExportImportButton: React.FC<DataExportImportButtonProps> = ({
  entityType,
  showExport = true,
  showImport = true,
  showBackup = true,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'sm',
  className = '',
  onExportSuccess,
  onImportSuccess,
  onError,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await dataExportImportService.exportData({
        entityType,
        format: 'json',
      });

      if (result) {
        const filename = `${entityType}_export_${new Date().toISOString().split('T')[0]}`;
        dataExportImportService.downloadExport(result, filename, 'json');
        onExportSuccess?.(filename);
        logger.info('Export successful:', filename);
      } else {
        onError?.('No data to export');
      }
    } catch (error) {
      logger.error('Export failed:', error);
      onError?.('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await dataExportImportService.readFile(file);
      const format: ImportFormat = file.name.endsWith('.csv') ? 'csv' : 
                                     file.name.endsWith('.xlsx') ? 'excel' : 'json';

      const result = await dataExportImportService.importData(data, {
        entityType,
        format,
        validation: { maxRows: 10000 },
      });

      if (result.success) {
        onImportSuccess?.({ imported: result.imported, skipped: result.skipped });
        logger.info('Import successful:', result);
      } else {
        onError?.(result.errors.join(', '));
      }
    } catch (error) {
      logger.error('Import failed:', error);
      onError?.('Import failed');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const metadata = await dataExportImportService.executeScheduledBackup();
      if (metadata) {
        logger.info('Backup successful:', metadata.id);
      } else {
        onError?.('Backup failed or not scheduled');
      }
    } catch (error) {
      logger.error('Backup failed:', error);
      onError?.('Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const isProcessing = isExporting || isImporting || isBackingUp || loading;

  return (
    <div className={`flex gap-2 ${className}`}>
      {showExport && (
        <Button
          onClick={handleExport}
          disabled={disabled || isProcessing}
          variant={variant}
          size={size}
        >
          {isExporting ? <LoadingSpinner size="sm" variant="ring" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
          Export
        </Button>
      )}

      {showImport && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv,.xlsx"
            onChange={handleImport}
            className="hidden"
            id={`import-${entityType}`}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessing}
            variant={variant}
            size={size}
          >
            {isImporting ? <LoadingSpinner size="sm" variant="ring" /> : <ArrowUpTrayIcon className="h-4 w-4" />}
            Import
          </Button>
        </>
      )}

      {showBackup && (
        <Button
          onClick={handleBackup}
          disabled={disabled || isProcessing}
          variant={variant}
          size={size}
        >
          {isBackingUp ? <LoadingSpinner size="sm" variant="ring" /> : <CloudArrowDownIcon className="h-4 w-4" />}
          Backup
        </Button>
      )}
    </div>
  );
};

export default DataExportImportButton;
