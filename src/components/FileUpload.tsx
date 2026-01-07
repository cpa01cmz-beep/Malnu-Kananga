import React, { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { fileStorageAPI, FileUploadResponse } from '../services/apiService';
import { logger } from '../utils/logger';
import Button from './ui/Button';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null); // eslint-disable-line no-undef

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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
    if (file.size > maxSizeMB * 1024 * 1024) {
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

    const abortController = new AbortController(); // eslint-disable-line no-undef
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

        setFiles((prev) => [...prev, newFile]);
        onFileUploaded?.(response.data);

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
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full ${
          disabled || uploading
            ? 'border-neutral-200 bg-neutral-50 dark:bg-neutral-900/50 cursor-not-allowed'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
        }`}
      >
        {uploading ? (
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploading...
              </span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
              <span>{formatFileSize(uploadedBytes)} / {formatFileSize(uploadedBytes / (uploadProgress / 100) || 0)}</span>
              <span>{formatSpeed(uploadSpeed)}</span>
            </div>
            {uploadSpeed > 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
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
            <CloudArrowUpIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mb-4" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Uploaded Files ({files.length}/{maxFiles})
          </p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.type)}</span>
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
                  size="sm"
                  onClick={() => handleDownload(file.key)}
                  disabled={disabled}
                  iconOnly
                  icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                  aria-label="Download file"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(file)}
                  disabled={disabled}
                  iconOnly
                  icon={<TrashIcon className="w-4 h-4" />}
                  aria-label="Delete file"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
