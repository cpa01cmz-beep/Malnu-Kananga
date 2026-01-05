import React, { useEffect, useState } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { MicrophoneOffIcon } from './icons/MicrophoneOffIcon';
import { logger } from '../utils/logger';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onError,
  disabled = false,
  className = '',
}) => {
  const { transcript, state, isListening, isSupported, startRecording, stopRecording } =
    useVoiceRecognition({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          logger.debug('Final transcript:', text);
        }
      },
      onError: (error) => {
        logger.error('Voice recognition error:', error);
        onError?.(error.message);
      },
    });

  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    setPulseAnimation(isListening);
  }, [isListening]);

  useEffect(() => {
    if (state === 'idle' && transcript) {
      onTranscript(transcript);
    }
  }, [state, transcript, onTranscript]);

  const handleClick = () => {
    if (!isSupported) {
      onError?.('Browser Anda tidak mendukung fitur suara. Silakan gunakan Chrome, Edge, atau Safari terbaru.');
      return;
    }

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getButtonStyle = () => {
    if (!isSupported) {
      return 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed';
    }

    switch (state) {
      case 'listening':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'processing':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700';
    }
  };

  const getTooltipText = () => {
    if (!isSupported) return 'Browser tidak mendukung fitur suara';
    
    switch (state) {
      case 'listening':
        return 'Klik untuk berhenti merekam';
      case 'processing':
        return 'Memproses suara...';
      case 'error':
        return 'Terjadi kesalahan, klik untuk coba lagi';
      default:
        return 'Klik untuk mulai merekam';
    }
  };

  const getAriaLabel = () => {
    if (!isSupported) return 'Fitur suara tidak didukung';
    
    switch (state) {
      case 'listening':
        return 'Berhenti merekam suara';
      case 'processing':
        return 'Memproses suara';
      case 'error':
        return 'Terjadi kesalahan pada fitur suara';
      default:
        return 'Mulai merekam suara';
    }
  };

  if (disabled) {
    return (
      <button
        disabled
        className={`p-3 mb-1 bg-gray-300 dark:bg-gray-600 text-gray-400 rounded-full cursor-not-allowed transition-colors ${className}`}
        aria-label="Input suara dinonaktifkan"
        title="Input suara dinonaktifkan"
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isSupported || disabled}
      className={`
        p-3 mb-1 rounded-full transition-all duration-300 shadow-sm flex-shrink-0
        ${getButtonStyle()}
        ${pulseAnimation ? 'animate-pulse scale-110' : 'hover:scale-105'}
        ${className}
      `}
      aria-label={getAriaLabel()}
      aria-pressed={isListening}
      title={getTooltipText()}
    >
      {isListening ? (
        <MicrophoneIcon className="w-5 h-5" />
      ) : state === 'error' ? (
        <MicrophoneOffIcon className="w-5 h-5" />
      ) : (
        <MicrophoneIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default VoiceInputButton;
