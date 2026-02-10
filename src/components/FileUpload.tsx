import React, { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { fileStorageAPI, FileUploadResponse } from '../services/apiService';
import { logger } from '../utils/logger';
import { mbToBytes } from '../constants';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

interface UploadedFile {
  id: string;
  key: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
}

interface FileUploadProps {
  onFileUploaded?: (file: FileUploadResponse) => void;
  onFileDeleted?: (key: string) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  uploadPath?: string;
  existingFiles?: UploadedFile[];
  maxFiles?: number;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileDeleted,
  acceptedFileTypes = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4',
  maxSizeMB = 50,
  uploadPath,
  existingFiles = [],
  maxFiles = 10,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [error, setError] = useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const [uploadStartTime, setUploadStartTime] = useState<number>(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [recentlyUploadedFileId, setRecentlyUploadedFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);  
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (!isFinite(seconds) || seconds <= 0) return 'Calculating...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > mbToBytes(maxSizeMB)) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const acceptedTypes = acceptedFileTypes.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(extension)) {
      return {
        valid: false,
        error: `File type not accepted. Allowed: ${acceptedFileTypes}`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (files.length >= maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadSpeed(0);
    setEstimatedTimeRemaining(0);
    setUploadedBytes(0);
    setUploadStartTime(Date.now());

    const abortController = new AbortController();  
    abortControllerRef.current = abortController;

    try {
      const response = await fileStorageAPI.upload(selectedFile, uploadPath, {
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
          setUploadedBytes(progress.loaded);

          const elapsedTime = (Date.now() - uploadStartTime) / 1000;
          if (elapsedTime > 0) {
            const speed = progress.loaded / elapsedTime;
            setUploadSpeed(speed);

            const remainingBytes = progress.total - progress.loaded;
            const eta = speed > 0 ? remainingBytes / speed : 0;
            setEstimatedTimeRemaining(eta);
          }
        },
        abortController,
      });

      if (response.success && response.data) {
        const newFile: UploadedFile = {
          id: Date.now().toString(),
          key: response.data.key,
          name: response.data.name,
          size: response.data.size,
          type: response.data.type,
          uploadDate: new Date().toISOString(),
        };

        // Trigger success animation
        setShowSuccessAnimation(true);
        setRecentlyUploadedFileId(newFile.id);

        setFiles((prev) => [...prev, newFile]);
        onFileUploaded?.(response.data);

        // Clear animation states after delay
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => {
          setShowSuccessAnimation(false);
          setRecentlyUploadedFileId(null);
        }, 2000);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err) {
      if ((err as Error).message === 'Upload cancelled') {
        setError('Upload cancelled by user');
      } else {
        setError('Failed to upload file. Please try again.');
        logger.error('Upload error:', err);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadSpeed(0);
      setEstimatedTimeRemaining(0);
      setUploadedBytes(0);
      abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    try {
      const response = await fileStorageAPI.delete(file.key);
      if (response.success) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        onFileDeleted?.(file.key);
      } else {
        setError(response.message || 'Delete failed');
      }
    } catch (err) {
      setError('Failed to delete file. Please try again.');
      logger.error('Delete error:', err);
    }
  };

  const handleDownload = (key: string) => {
    const url = fileStorageAPI.getDownloadUrl(key);
    window.open(url, '_blank');
  };

  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    if (type.includes('ppt')) return '📊';
    if (type.includes('video')) return '🎬';
    if (type.includes('image')) return '🖼️';
    return '📁';
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        disabled={disabled || uploading}
        aria-label={uploading ? `Uploading file, ${uploadProgress}% complete` : 'Click to upload or drag and drop'}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 w-full min-h-[120px] sm:min-h-[140px] ${
          disabled || uploading
            ? 'border-neutral-200 bg-neutral-50 dark:bg-neutral-900/50 cursor-not-allowed'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 hover:shadow-md hover:-translate-y-1 active:scale-[0.98] touch-manipulation'
        }`}
      >
        {showSuccessAnimation ? (
          <div className="flex flex-col items-center justify-center animate-fade-in">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping" />
              <div className="relative w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-scale-in">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400 animate-checkmark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    className="animate-draw-check"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400 animate-fade-in-up">
              Upload successful!
            </p>
            <p className="sr-only" role="status" aria-live="polite">
              File has been uploaded successfully
            </p>
          </div>
        ) : uploading ? (
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Uploading...
              </span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {uploadProgress}%
              </span>
            </div>
            <ProgressBar
              value={uploadProgress}
              size="lg"
              color="success"
              className="mb-3"
              aria-label="Upload progress"
            />
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              <span>{formatFileSize(uploadedBytes)} / {formatFileSize(uploadedBytes / (uploadProgress / 100) || 0)}</span>
              <span>{formatSpeed(uploadSpeed)}</span>
            </div>
            {uploadSpeed > 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Estimated time remaining: {formatTimeRemaining(estimatedTimeRemaining)}
                </span>
              </div>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                handleCancelUpload();
              }}
              icon={<CloseIcon />}
            >
              Cancel Upload
            </Button>
          </div>
        ) : (
          <>
            <CloudArrowUpIcon className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 dark:text-neutral-500 mb-3 sm:mb-4 transition-transform group-hover:scale-110" />
            <p className="text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {acceptedFileTypes} (Max {maxSizeMB}MB)
            </p>
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2" role="region" aria-label="Uploaded files">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Uploaded Files ({files.length}/{maxFiles})
          </p>
          <p className="sr-only">
            Tip: Press Delete key on a focused file to quickly remove it
          </p>
          <div role="list" className="space-y-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              tabIndex={0}
              role="listitem"
              aria-label={`File: ${file.name}, ${formatFileSize(file.size)}`}
              onKeyDown={(e) => {
                if (e.key === 'Delete' && !disabled) {
                  e.preventDefault();
                  handleDelete(file);
                }
              }}
              className={`flex items-center justify-between p-3 sm:p-4 bg-white/95 dark:bg-neutral-800/95 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 backdrop-blur-sm touch-manipulation active:scale-[0.98] ${
                recentlyUploadedFileId === file.id
                  ? 'animate-slide-in-right ring-2 ring-green-400/60 dark:ring-green-500/60 ring-offset-2 dark:ring-offset-neutral-900 bg-green-50/30 dark:bg-green-900/20'
                  : ''
              } ${index < files.length - 1 ? 'animate-fade-in' : ''}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl" aria-hidden="true">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button
                   variant="success"
                   size="icon"
                   onClick={() => handleDownload(file.key)}
                   disabled={disabled}
                   iconOnly
                   icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                   aria-label={`Download ${file.name}`}
                   title="Download file"
                   className="mobile-touch-target"
                 />
                 <Button
                   variant="danger"
                   size="icon"
                   onClick={() => handleDelete(file)}
                   disabled={disabled}
                   iconOnly
                   icon={<TrashIcon className="w-4 h-4" />}
                   aria-label={`Delete ${file.name}`}
                   title={`Delete file (Press Delete key)`}
                   className="mobile-touch-target"
                 />
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
