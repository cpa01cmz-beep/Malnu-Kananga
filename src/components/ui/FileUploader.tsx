import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { fileStorageAPI, FileUploadResponse } from '../../services/apiService';
import { logger } from '../../utils/logger';
import { mbToBytes } from '../../constants';
import Button from './Button';
import ProgressBar from './ProgressBar';

export interface UploadedFile {
  id: string;
  key: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  preview?: string;
}

interface FileUploaderProps {
  onFileUploaded?: (file: FileUploadResponse) => void;
  onFileDeleted?: (key: string) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  uploadPath?: string;
  existingFiles?: UploadedFile[];
  maxFiles?: number;
  disabled?: boolean;
  showPreview?: boolean;
  allowMultiple?: boolean;
  dragAndDrop?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  allowedTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUploaded,
  onFileDeleted,
  acceptedFileTypes = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4',
  maxSizeMB = 50,
  uploadPath,
  existingFiles = [],
  maxFiles = 10,
  disabled = false,
  showPreview = true,
  allowMultiple = true,
  dragAndDrop = true,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [error, setError] = useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const uploadStartTimeRef = useRef<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);  

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

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
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
  }, [maxSizeMB, acceptedFileTypes]);

  const createPreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }
      
      // eslint-disable-next-line no-undef
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => { // eslint-disable-line no-undef
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    if (filesArray.length > maxFiles && !allowMultiple) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of filesArray) {
      if (files.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validation = validateFile(file);
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
      uploadStartTimeRef.current = Date.now();

      const abortController = new AbortController();  
      abortControllerRef.current = abortController;

      try {
        const preview = await createPreview(file);
        
        const response = await fileStorageAPI.upload(file, uploadPath, {
          onProgress: (progress) => {
            setUploadProgress(progress.percentage);
            setUploadedBytes(progress.loaded);

            const elapsedTime = (Date.now() - uploadStartTimeRef.current) / 1000;
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
            preview,
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
    }
  }, [files, maxFiles, allowMultiple, uploadPath, onFileUploaded, validateFile, createPreview]);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (dragAndDrop && !disabled && !uploading) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [dragAndDrop, disabled, uploading, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragAndDrop) {
      setDragActive(true);
    }
  }, [dragAndDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-8 text-base',
    lg: 'p-12 text-lg',
  };

  const getUploadArea = () => {
    if (uploading) {
      return (
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
      );
    }

    return (
      <>
        <CloudArrowUpIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mb-4" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {`${acceptedFileTypes} (Max ${maxSizeMB}MB)${allowMultiple ? ` • Up to ${maxFiles} files` : ''}`}
        </p>
      </>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        multiple={allowMultiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled || uploading}
        className="hidden"
      />

      {variant !== 'minimal' && (
        <button
          type="button"
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          disabled={disabled || uploading}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          aria-label={uploading ? `Uploading file, ${uploadProgress}% complete` : 'Click to upload or drag and drop files'}
          aria-describedby="upload-instructions"
          aria-dropeffect={dragActive ? "copy" : "none"}
          className={`border-2 border-dashed rounded-xl ${sizeClasses[size]} flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${
            disabled || uploading
              ? 'border-neutral-200 bg-neutral-50 dark:bg-neutral-900/50 cursor-not-allowed'
              : dragActive
              ? 'border-primary-500 bg-primary-100/50 dark:bg-primary-900/20 ring-2 ring-primary-500/30'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
          }`}
        >
          {getUploadArea()}
        </button>
      )}

      <span id="upload-instructions" className="sr-only">
        Supported file types: {acceptedFileTypes}. Maximum file size: {maxSizeMB}MB.
        {allowMultiple ? ` You can upload up to ${maxFiles} files.` : ''}
        {dragActive ? ' Files detected. Release to drop.' : ''}
      </span>

      {variant === 'minimal' && (
        <Button
          variant="secondary"
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          disabled={disabled || uploading}
          icon={<CloudArrowUpIcon />}
        >
          Upload File
        </Button>
      )}

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
                {showPreview && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                    width={40}
                    height={40}
                  />
                ) : (
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                )}
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

export default FileUploader;