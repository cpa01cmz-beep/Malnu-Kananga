import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Button from './Button';

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
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-current" />
      ) : (
        <DocumentArrowDownIcon className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
};

export default PDFExportButton;