import React, { useState, useCallback, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { User, UserRole, UserExtraRole } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Table from './ui/Table';
import Badge from './ui/Badge';
import Alert from './ui/Alert';
import ProgressBar from './ui/ProgressBar';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { XMarkIcon } from './icons/MaterialIcons';
import { api } from '../services/apiService';
import { logger } from '../utils/logger';
import { classifyError, logError } from '../utils/errorHandler';
import { unifiedNotificationManager } from '../services/unifiedNotificationManager';

export interface CSVRow {
  [key: string]: string;
}

export interface ParsedUser extends Partial<User> {
  isValid: boolean;
  errors: string[];
  rowIndex: number;
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
}

interface UserImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

const UserImport: React.FC<UserImportProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('upload');
      setParsedUsers([]);
      setFile(null);
      setImportProgress(0);
      setImportResult(null);
      setIsClosing(false);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUser = (row: CSVRow, index: number): ParsedUser => {
    const errors: string[] = [];
    const name = row['name'] || row['Nama'] || row['NAMA'] || '';
    const email = row['email'] || row['Email'] || row['EMAIL'] || '';
    const roleStr = row['role'] || row['Role'] || row['ROLE'] || 'student';
    const status = (row['status'] || row['Status'] || row['STATUS'] || 'active') as 'active' | 'inactive';
    const extraRoleStr = row['extraRole'] || row['extra_role'] || row['Extra Role'] || '';

    if (!name || name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!email || !validateEmail(email)) {
      errors.push('Valid email is required');
    }

    const validRoles: UserRole[] = ['admin', 'teacher', 'student', 'parent'];
    const role: UserRole = validRoles.includes(roleStr.toLowerCase() as UserRole)
      ? (roleStr.toLowerCase() as UserRole)
      : 'student';

    let extraRole: UserExtraRole | null = null;
    if (extraRoleStr) {
      const validExtraRoles: UserExtraRole[] = ['staff', 'osis', 'wakasek', 'kepsek'];
      if (validExtraRoles.includes(extraRoleStr.toLowerCase() as UserExtraRole)) {
        extraRole = extraRoleStr.toLowerCase() as UserExtraRole;
      }
    }

    const validStatuses: ('active' | 'inactive')[] = ['active', 'inactive'];
    const userStatus = validStatuses.includes(status) ? status : 'active';

    return {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      extraRole,
      status: userStatus,
      isValid: errors.length === 0,
      errors,
      rowIndex: index + 2,
    };
  };

  const parseCSV = useCallback((file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            logger.error('CSV parsing errors:', results.errors);
            reject(new Error(`CSV parsing failed: ${results.errors[0].message}`));
            return;
          }
          resolve(results.data || []);
        },
        error: (error) => {
          logger.error('CSV parse error:', error);
          reject(error);
        },
      });
    });
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      logger.error('Invalid file type: Please select a CSV file');
      return;
    }

    try {
      const data = await parseCSV(selectedFile);
      if (data.length === 0) {
        logger.error('CSV file is empty');
        return;
      }

      const validatedUsers = data.map((row, index) => validateUser(row, index));
      setParsedUsers(validatedUsers);
      setFile(selectedFile);
      setStep('preview');
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'parseCSV',
        timestamp: Date.now(),
      });
      logError(classifiedError);
      logger.error('Failed to parse CSV file. Please check the format and try again.');
    }
  }, [parseCSV]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    const validUsers = parsedUsers.filter((user) => user.isValid);

    if (validUsers.length === 0) {
      logger.error('No valid users to import');
      return;
    }

    setStep('importing');
    setImportProgress(0);

    const result: ImportResult = {
      total: validUsers.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < validUsers.length; i++) {
      const user = validUsers[i];
      setImportProgress(Math.round(((i + 1) / validUsers.length) * 100));

      try {
        const response = await api.users.create(user as User);
        if (response.success) {
          result.success++;
        } else {
          result.failed++;
          result.errors.push({
            row: user.rowIndex,
            email: user.email || 'N/A',
            error: response.message || 'Unknown error',
          });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: user.rowIndex,
          email: user.email || 'N/A',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        logger.error(`Failed to import user at row ${user.rowIndex}:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setImportResult(result);
    setStep('complete');

    if (result.success > 0) {
      unifiedNotificationManager.showNotification({
        type: 'system',
        title: 'Bulk Import Complete',
        body: `${result.success} users imported successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        priority: result.failed > 0 ? 'normal' : 'high',
      });
      onImportComplete?.();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    onClose();
  };

  const validUserCount = parsedUsers.filter((user) => user.isValid).length;
  const invalidUserCount = parsedUsers.filter((user) => !user.isValid).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'complete' ? 'Import Complete' : 'Import Users from CSV'}
      size="lg"
    >
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="text-neutral-600 dark:text-neutral-400">
            <p className="mb-4">Upload a CSV file with user data. The CSV should include the following columns:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>name</code> (required) - User's full name</li>
              <li><code>email</code> (required) - User's email address</li>
              <li><code>role</code> (optional, default: student) - admin, teacher, student, or parent</li>
              <li><code>extraRole</code> (optional) - staff, osis, wakasek, or kepsek</li>
              <li><code>status</code> (optional, default: active) - active or inactive</li>
            </ul>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              const csvContent = 'name,email,role,extraRole,status\nJohn Doe,john@example.com,teacher,,active\nJane Smith,jane@example.com,student,,active\nAdmin User,admin@example.com,admin,,active';
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'users_template.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download CSV Template
          </Button>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
            }`}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mb-4" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              CSV file only
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {file && (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                iconOnly
                icon={<XMarkIcon className="w-4 h-4" />}
              />
            </div>
          )}
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <Alert variant="info">
            <p>Found {validUserCount} valid users and {invalidUserCount} invalid rows.</p>
          </Alert>

          {invalidUserCount > 0 && (
            <Alert variant="warning">
              <p>Some rows have validation errors and will not be imported. Review the errors below.</p>
            </Alert>
          )}

          <div className="max-h-96 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <Table
              columns={[
                { key: 'rowIndex', header: 'Row', sortable: false },
                { key: 'name', header: 'Name', sortable: false },
                { key: 'email', header: 'Email', sortable: false },
                { key: 'role', header: 'Role', sortable: false },
                { key: 'status', header: 'Status', sortable: false },
                { key: 'errors', header: 'Status', sortable: false },
              ]}
              data={parsedUsers}
              renderCell={(column, user) => {
                if (column.key === 'rowIndex') {
                  return <span className="text-neutral-500">#{user.rowIndex}</span>;
                }
                if (column.key === 'name') {
                  return <span className="font-medium">{user.name || '-'}</span>;
                }
                if (column.key === 'email') {
                  return <span className="text-sm">{user.email || '-'}</span>;
                }
                if (column.key === 'role') {
                  return (
                    <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'teacher' ? 'warning' : 'default'}>
                      {user.role || 'student'}
                    </Badge>
                  );
                }
                if (column.key === 'status') {
                  return (
                    <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                      {user.status || 'active'}
                    </Badge>
                  );
                }
                if (column.key === 'errors') {
                  if (user.isValid) {
                    return (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckIcon className="w-4 h-4" />
                        Valid
                      </span>
                    );
                  }
                  return (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {user.errors.length} error(s)
                    </span>
                  );
                }
                return null;
              }}
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="secondary"
              onClick={() => setStep('upload')}
              disabled={isClosing}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isClosing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={validUserCount === 0 || isClosing}
              >
                Import {validUserCount} Users
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              Importing Users...
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Please wait while we process the import
            </p>
          </div>

          <ProgressBar
            value={importProgress}
            size="lg"
            className="max-w-md mx-auto"
            aria-label={`Import progress: ${importProgress}%`}
          />

          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            {importProgress}% complete
          </p>
        </div>
      )}

      {step === 'complete' && importResult && (
        <div className="space-y-6">
          <div className="text-center py-4">
            {importResult.failed === 0 ? (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            )}
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Import {importResult.failed === 0 ? 'Successful' : 'Complete'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {importResult.success} of {importResult.total} users imported successfully
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{importResult.success}</p>
              <p className="text-sm text-green-700 dark:text-green-300">Successful</p>
            </div>
            {importResult.failed > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{importResult.failed}</p>
                <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
              </div>
            )}
          </div>

          {importResult.errors.length > 0 && (
            <div className="max-h-64 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                Import Errors
              </h4>
              <div className="space-y-2">
                {importResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm p-2 bg-red-50 dark:bg-red-900/10 rounded"
                  >
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-neutral-900 dark:text-white">
                        Row {error.row}: {error.email}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400 text-xs">
                        {error.error}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="primary"
              onClick={handleClose}
              disabled={isClosing}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UserImport;
