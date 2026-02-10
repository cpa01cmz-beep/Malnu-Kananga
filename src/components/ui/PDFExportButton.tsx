import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface PDFExportButtonProps {
  onExport: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  onExport,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'sm',
  label = 'Export PDF',
  className = ''
}) => {
  return (
    <Button
      onClick={onExport}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <LoadingSpinner size="sm" variant="ring" />
      ) : (
        <DocumentArrowDownIcon className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
};

export default PDFExportButton;