import ChevronLeftIcon from '../icons/ChevronLeftIcon';

export type BackButtonVariant = 'primary' | 'green' | 'custom';

interface BackButtonProps {
  label?: string;
  onClick: () => void;
  variant?: BackButtonVariant;
  className?: string;
  ariaLabel?: string;
}

const variantClasses: Record<BackButtonVariant, string> = {
  primary: 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
  green: 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300',
  custom: ''
};

const BackButton: React.FC<BackButtonProps> = ({
  label = 'Kembali',
  onClick,
  variant = 'primary',
  className = '',
  ariaLabel
}) => {
  const ariaAttr = ariaLabel || `Navigasi kembali ke ${label}`;

  return (
    <button
      onClick={onClick}
      aria-label={ariaAttr}
      className={`hover:underline font-medium flex items-center gap-2 transition-all duration-200 hover:translate-x-[-4px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded ${variantClasses[variant]} ${className}`.replace(/\s+/g, ' ').trim()}
    >
      <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
