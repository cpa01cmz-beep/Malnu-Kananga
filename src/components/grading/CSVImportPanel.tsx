
import React from 'react';
import Papa from 'papaparse';
import { CSV_MESSAGES, DATA_MESSAGES, VALIDATION_MESSAGES, EXPORT_MESSAGES } from '../../utils/errorMessages';
import { validateCSVImport } from '../../utils/teacherValidation';

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
  csvError,
  setCsvError,
  grades,
  setGrades,
  setIsBatchMode,
  setConfirmDialog,
  onShowToast,
}) => {
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
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
        } catch (err) {
          onShowToast(CSV_MESSAGES.IMPORT_FAILED, 'error');
        }
      },
      error: (err) => {
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
      <button
        onClick={() => document.getElementById('csv-import-input')?.click()}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
      >
        Import CSV
      </button>
    </div>
  );
};

export default CSVImportPanel;
