import React from 'react';
import { useVoiceInput, type UseVoiceInputOptions } from '../hooks/useVoiceInput';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { MicrophoneOffIcon } from './icons/MicrophoneOffIcon';

interface FieldVoiceInputProps extends Omit<UseVoiceInputOptions, 'onValueChange'> {
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  showFeedback?: boolean;
  compact?: boolean;
}

const FieldVoiceInput: React.FC<FieldVoiceInputProps> = ({
  onValueChange,
  disabled = false,
  className = '',
  showFeedback = true,
  compact = false,
  ...voiceInputOptions
}) => {
  const {
    state,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    abortListening: _abortListening,
    clearError,
    isValid,
  } = useVoiceInput({
    onValueChange,
    ...voiceInputOptions,
  });

  const handleClick = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      stopListening();
    } else {
      clearError();
      startListening();
    }
  };

  const getButtonStyle = () => {
    if (!isSupported) {
      return 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed';
    }

    if (disabled) {
      return 'bg-neutral-400 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed';
    }

    if (error) {
      return 'bg-red-500 hover:bg-red-600 text-white dark:hover:bg-red-700';
    }

    if (isListening) {
      return 'bg-red-500 hover:bg-red-600 text-white dark:hover:bg-red-700 animate-pulse';
    }

    return 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 hover:scale-[1.02] active:scale-95';
  };

  const getAriaLabel = () => {
    if (!isSupported) return 'Fitur suara tidak didukung';
    if (disabled) return 'Input suara dinonaktifkan';

    switch (state) {
      case 'listening':
        return 'Berhenti merekam suara';
      case 'processing':
        return 'Memproses suara';
      default:
        return `Mulai input suara untuk ${voiceInputOptions.fieldLabel}`;
    }
  };

  const getTooltipText = () => {
    if (!isSupported) return 'Browser tidak mendukung fitur suara';
    if (disabled) return 'Input suara dinonaktifkan';

    switch (state) {
      case 'listening':
        return 'Klik untuk berhenti merekam';
      case 'processing':
        return 'Memproses suara...';
      default:
        return `Klik untuk input suara: ${voiceInputOptions.fieldLabel}`;
    }
  };

  const sizeClass = compact ? 'p-2' : 'p-3';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!isSupported || disabled}
        className={`
          ${sizeClass}
          rounded-full
          transition-all
          duration-200
          ease-out
          shadow-sm
          flex-shrink-0
          ${getButtonStyle()}
        `}
        aria-label={getAriaLabel()}
        title={getTooltipText()}
      >
        {isListening ? (
          <MicrophoneIcon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        ) : error ? (
          <MicrophoneOffIcon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        ) : (
          <MicrophoneIcon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        )}
      </button>

      {showFeedback && !compact && error && (
        <span className="mt-1 text-xs text-red-500 max-w-[100px] text-center truncate" title={error}>
          Error
        </span>
      )}

      {showFeedback && !compact && !isValid && !error && isListening && (
        <span className="mt-1 text-xs text-blue-500 animate-pulse">
          Mendengarkan...
        </span>
      )}
    </div>
  );
};

export default FieldVoiceInput;
