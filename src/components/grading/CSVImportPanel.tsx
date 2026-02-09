
import React, { useState } from 'react';
import Papa from 'papaparse';
import { CSV_MESSAGES } from '../../utils/errorMessages';
import { validateCSVImport } from '../../utils/teacherValidation';
import Button from '../ui/Button';

export interface CSVImportPanelProps {
  csvError: string | null;
  setCsvError: React.Dispatch<React.SetStateAction<string | null>>;
  grades: Array<{ id: string; name: string; nis: string; assignment: number; midExam: number; finalExam: number }>;
  setGrades: React.Dispatch<React.SetStateAction<Array<{
    id: string; name: string; nis: string; assignment: number; midExam: number; finalExam: number;
  }>>>;
  setIsBatchMode: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>>;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const CSVImportPanel: React.FC<CSVImportPanelProps> = ({
  csvError: _csvError,
  setCsvError: _setCsvError,
  grades,
  setGrades,
  setIsBatchMode,
  setConfirmDialog,
  onShowToast,
}) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      complete: (results) => {
        try {
          const csvData = results.data as Record<string, string>[];
          const importResult = validateCSVImport(csvData, grades);

          if (importResult.failedImports > 0) {
            const errorMessage = `Import selesai dengan beberapa kesalahan:\n\n✓ Berhasil: ${importResult.successfulImports} siswa\n✗ Gagal: ${importResult.failedImports} siswa\n\nDetail kesalahan:\n${importResult.errorDetails.slice(0, 5).map(
              err => `- ${err.studentName} (${err.nis}): ${err.errors.join(', ')}`
            ).join('\n')}${importResult.errorDetails.length > 5 ? '\n...' : ''}`;

            setConfirmDialog({
              isOpen: true,
              title: 'Validasi Import CSV',
              message: errorMessage,
              type: 'danger',
              onConfirm: () => {
                setGrades(prev => prev.map(grade => {
                  const successfulImport = importResult.successDetails.find(s => s.nis === grade.nis);
                  if (successfulImport) {
                    return {
                      ...grade,
                      assignment: successfulImport.assignment,
                      midExam: successfulImport.midExam,
                      finalExam: successfulImport.finalExam
                    };
                  }
                   return grade;
                 }));
                 setIsBatchMode(false);
                 onShowToast(CSV_MESSAGES.IMPORT_SUCCESS(importResult.successfulImports), 'success');
               }
             });
           } else {
             setGrades(prev => prev.map(grade => {
               const successfulImport = importResult.successDetails.find(s => s.nis === grade.nis);
               if (successfulImport) {
                 return {
                   ...grade,
                   assignment: successfulImport.assignment,
                   midExam: successfulImport.midExam,
                   finalExam: successfulImport.finalExam
                 };
               }
               return grade;
              }));
              setIsBatchMode(false);
              onShowToast(CSV_MESSAGES.IMPORT_BATCH_SUCCESS(importResult.successfulImports), 'success');
            }
        } catch (_err) {
          onShowToast(CSV_MESSAGES.IMPORT_FAILED, 'error');
        } finally {
          setIsImporting(false);
        }
      },
      error: (_err: Error) => {
        setIsImporting(false);
        onShowToast(CSV_MESSAGES.PARSE_FAILED, 'error');
      }
    });

    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={undefined}
        type="file"
        accept=".csv"
        onChange={handleCSVImport}
        className="hidden"
        id="csv-import-input"
      />
      <Button
        onClick={() => document.getElementById('csv-import-input')?.click()}
        variant="warning"
        size="md"
        isLoading={isImporting}
        ariaLabel={isImporting ? 'Memproses file CSV...' : 'Import nilai dari file CSV'}
        disabled={isImporting}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        }
        iconPosition="left"
      >
        Import CSV
      </Button>
    </div>
  );
};

export default CSVImportPanel;
