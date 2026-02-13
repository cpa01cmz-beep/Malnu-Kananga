import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { fileStorageAPI, FileUploadResponse } from '../../services/apiService';
import { logger } from '../../utils/logger';
import { mbToBytes, COMPONENT_TIMEOUTS, CONVERSION, UI_DELAYS } from '../../constants';
import Button from './Button';
import ProgressBar from './ProgressBar';
import ConfirmationDialog from './ConfirmationDialog';

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
  const [announcement, setAnnouncement] = useState<string>('');
  const uploadStartTimeRef = useRef<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const [isPasteSupported, setIsPasteSupported] = useState(false);
  const [showPasteHint, setShowPasteHint] = useState(false);
  const [isPastedImage, setIsPastedImage] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    file: UploadedFile | null;
  }>({ isOpen: false, file: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pasteHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), COMPONENT_TIMEOUTS.SCREEN_READER_ANNOUNCEMENT_CLEAR);
  }, []);

  useEffect(() => {
    const hasClipboardAPI = typeof navigator !== 'undefined' && 'clipboard' in navigator;
    const supportsPasteEvent = 'onpaste' in document;
    setIsPasteSupported(hasClipboardAPI || supportsPasteEvent);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pasteHintTimeoutRef.current) {
        clearTimeout(pasteHintTimeoutRef.current);
      }
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(CONVERSION.BYTES_PER_KB));
    return Math.round((bytes / Math.pow(CONVERSION.BYTES_PER_KB, i)) * 100) / 100 + ' ' + sizes[i];
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

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, []);

  // eslint-disable-next-line no-undef
  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
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
      announceToScreenReader(`Starting upload of ${file.name}`);

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

            if (progress.percentage % 25 === 0 && progress.percentage > 0) {
              announceToScreenReader(`Upload ${progress.percentage}% complete`);
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
          announceToScreenReader(`Upload complete. ${file.name} has been uploaded successfully.`);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setError(response.message || 'Upload failed');
          announceToScreenReader(`Upload failed. ${response.message || 'Please try again.'}`);
        }
      } catch (err) {
        if ((err as Error).message === 'Upload cancelled') {
          setError('Upload cancelled by user');
          announceToScreenReader('Upload cancelled');
        } else {
          setError('Failed to upload file. Please try again.');
          announceToScreenReader('Upload failed. Please try again.');
          logger.error('Upload error:', err);
        }
      } finally {
        setUploading(false);
        setUploadProgress(0);
        setUploadSpeed(0);
        setEstimatedTimeRemaining(0);
        setUploadedBytes(0);
        abortControllerRef.current = null;
        setIsPastedImage(false);
      }
    }
  }, [files, maxFiles, allowMultiple, uploadPath, onFileUploaded, validateFile, createPreview, announceToScreenReader]);

  const handlePaste = useCallback((e: Event) => {
    if (disabled || uploading || !isPasteSupported) return;

    // eslint-disable-next-line no-undef
    const clipboardEvent = e as ClipboardEvent;
    const activeElement = document.activeElement;
    const isFocusedInContainer = containerRef.current?.contains(activeElement);
    const isFileInputFocused = activeElement === fileInputRef.current;

    if (!isFocusedInContainer && !isFileInputFocused) return;

    const items = clipboardEvent.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();

      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }

      setIsPastedImage(true);

      // eslint-disable-next-line no-undef
      const dataTransfer = new DataTransfer();
      imageFiles.forEach(file => dataTransfer.items.add(file));

      announceToScreenReader(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} pasted from clipboard`);
      handleFileSelect(dataTransfer.files);
    }
  }, [disabled, uploading, isPasteSupported, handleFileSelect, announceToScreenReader]);

  useEffect(() => {
    if (!isPasteSupported) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('paste', handlePaste, true);

    return () => {
      container.removeEventListener('paste', handlePaste, true);
    };
  }, [isPasteSupported, handlePaste]);

  const handleContainerFocus = () => {
    if (isPasteSupported && !disabled && !uploading) {
      pasteHintTimeoutRef.current = setTimeout(() => {
        setShowPasteHint(true);
      }, UI_DELAYS.PASTE_HINT_DELAY)
    }
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    // eslint-disable-next-line no-undef
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setShowPasteHint(false);
      if (pasteHintTimeoutRef.current) {
        clearTimeout(pasteHintTimeoutRef.current);
      }
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    setConfirmDialog({
      isOpen: true,
      file,
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.file) return;
    const file = confirmDialog.file;
    setConfirmDialog({ isOpen: false, file: null });
    try {
      const response = await fileStorageAPI.delete(file.key);
      if (response.success) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        onFileDeleted?.(file.key);
        announceToScreenReader(`${file.name} has been deleted successfully.`);
      } else {
        setError(response.message || 'Delete failed');
        announceToScreenReader(`Delete failed. ${response.message || 'Please try again.'}`);
      }
    } catch (err) {
      setError('Failed to delete file. Please try again.');
      announceToScreenReader('Delete failed. Please try again.');
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
              {isPastedImage ? 'Uploading pasted image...' : 'Uploading...'}
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
        <CloudArrowUpIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mb-4" aria-hidden="true" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {`${acceptedFileTypes} (Max ${maxSizeMB}MB)${allowMultiple ? ` • Up to ${maxFiles} files` : ''}`}
        </p>
        {isPasteSupported && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
            You can also paste images (Ctrl+V)
          </p>
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`space-y-4 ${className}`}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
      tabIndex={-1}
    >
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
          aria-label={uploading ? `Uploading file, ${uploadProgress}% complete` : `Click to upload or drag and drop files. ${isPasteSupported ? 'You can also paste images using Ctrl+V.' : ''} Supported types: ${acceptedFileTypes}. Max size: ${maxSizeMB}MB`}
          aria-describedby="upload-instructions"
          aria-dropeffect={dragActive ? "copy" : "none"}
          className={`border-2 border-dashed rounded-xl ${sizeClasses[size]} flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ease-out w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 relative overflow-hidden ${
            disabled || uploading
              ? 'border-neutral-200 bg-neutral-50 dark:bg-neutral-900/50 cursor-not-allowed'
              : dragActive
              ? 'border-primary-500 bg-primary-100/50 dark:bg-primary-900/20 ring-2 ring-primary-500/30 scale-[1.02] shadow-lg'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 hover:shadow-md'
          }`}
        >
          {getUploadArea()}

          {showPasteHint && isPasteSupported && !disabled && !uploading && (
            <div
              className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-neutral-900 dark:bg-neutral-700 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-10 animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-sm border border-neutral-700 dark:border-neutral-600"
              role="tooltip"
              aria-hidden={!showPasteHint}
            >
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-neutral-700 dark:bg-neutral-600 rounded text-[10px] font-mono font-bold border border-neutral-500 shadow-sm">
                  Ctrl+V
                </kbd>
                <span>tempel gambar</span>
              </span>
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-700" aria-hidden="true" />
            </div>
          )}
        </button>
      )}

      <span id="upload-instructions" className="sr-only">
        Supported file types: {acceptedFileTypes}. Maximum file size: {maxSizeMB}MB.
        {allowMultiple ? ` You can upload up to ${maxFiles} files.` : ''}
        {dragActive ? ' Files detected. Release to drop.' : ''}
        {isPasteSupported ? ' You can paste images from clipboard using Ctrl+V.' : ''}
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

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>

      {error && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300"
          role="alert"
          aria-live="assertive"
        >
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
                    loading="lazy"
                    decoding="async"
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

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Hapus File"
        message={confirmDialog.file ? `Apakah Anda yakin ingin menghapus file "${confirmDialog.file.name}"? Tindakan ini tidak dapat dibatalkan.` : ''}
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, file: null })}
      />
    </div>
  );
};

export default FileUploader;
