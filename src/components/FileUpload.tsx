import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import { fileStorageAPI, FileUploadResponse } from '../services/apiService';
import { logger } from '../utils/logger';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

    try {
      const response = await fileStorageAPI.upload(selectedFile, uploadPath);

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
      setError('Failed to upload file. Please try again.');
      logger.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
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

      <div
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10'
        }`}
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </>
        ) : (
          <>
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {acceptedFileTypes} (Max {maxSizeMB}MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files ({files.length}/{maxFiles})
          </p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(file.key)}
                  disabled={disabled}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  disabled={disabled}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
