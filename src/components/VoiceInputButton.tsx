import React, { useEffect, useState, useRef } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { MicrophoneOffIcon } from './icons/MicrophoneOffIcon';
import { STORAGE_KEYS } from '../constants';
import type { VoiceCommand } from '../types';
import { logger } from '../utils/logger';
import MicrophonePermissionHandler from './MicrophonePermissionHandler';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  onCommand?: (command: VoiceCommand) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onError,
  onCommand,
  disabled = false,
  className = '',
}) => {
const { transcript, state, isListening, isSupported, startRecording, stopRecording, continuous, setContinuous, permissionState, requestPermission } =
    useVoiceRecognition({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          logger.debug('Final transcript:', text);
        }
      },
      onError: (error) => {
        logger.error('Voice recognition error:', error);
        setLastError(error.message);
        if (error.error === 'not-allowed' || error.message.includes('mikrofon') || error.message.includes('izin')) {
          setShowPermissionHandler(true);
        }
      },
    });

  const { isCommand } = useVoiceCommands({
    onCommand: (command) => {
      onCommand?.(command);
    },
  });

  const [pulseAnimation, setPulseAnimation] = useState(false);
const [showPermissionHandler, setShowPermissionHandler] = useState(false);
  const [_lastError, setLastError] = useState<string>('');
  const [transcriptBuffer, setTranscriptBuffer] = useState('');
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptBufferRef = useRef(transcriptBuffer);
  const lastActivityTimeRef = useRef(lastActivityTime);

  useEffect(() => {
    const loadContinuousMode = () => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.VOICE_STORAGE_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setContinuous(parsedSettings.recognition?.continuous || false);
        }
      } catch (error) {
        logger.error('Failed to load continuous mode setting:', error);
      }
    };

    loadContinuousMode();
  }, [setContinuous]);

  useEffect(() => {
    setPulseAnimation(isListening);
  }, [isListening]);

  useEffect(() => {
    if (!isSupported) {
      setScreenReaderAnnouncement('Fitur suara tidak didukung browser ini');
      return;
    }

    if (permissionState === 'denied') {
      setScreenReaderAnnouncement('Izin mikrofon ditolak. Klik tombol untuk mengatur ulang.');
      return;
    }

    switch (state) {
      case 'listening':
        if (continuous) {
          setScreenReaderAnnouncement('Mode berkelanjutan aktif. Merekam suara. Klik tombol untuk berhenti dan mengirim.');
        } else {
          setScreenReaderAnnouncement('Merekam suara. Klik tombol untuk berhenti.');
        }
        break;
      case 'processing':
        setScreenReaderAnnouncement('Memproses suara...');
        break;
      case 'error':
        setScreenReaderAnnouncement('Terjadi kesalahan pada fitur suara. Klik tombol untuk mencoba lagi.');
        break;
      case 'idle':
      default:
        if (transcriptBuffer && continuous) {
          const preview = transcriptBuffer.substring(0, 50);
          setScreenReaderAnnouncement(`Suara berhasil diproses. Teks: "${preview}${transcriptBuffer.length > 50 ? '...' : ''}"`);
        } else {
          setScreenReaderAnnouncement('Input suara siap. Klik tombol untuk mulai merekam.');
        }
        break;
    }
  }, [state, isSupported, permissionState, continuous, transcriptBuffer]);

  useEffect(() => {
    if (state === 'idle' && transcript) {
      const isCmd = isCommand(transcript);
      
      if (!isCmd) {
        onTranscript(transcript);
      }

      if (!continuous) {
        setTranscriptBuffer('');
      }
    }
  }, [state, transcript, onTranscript, isCommand, continuous]);

  useEffect(() => {
    if (continuous && isListening && state === 'processing' && transcript) {
      setTranscriptBuffer(prev => {
        const currentBuffer = prev ? prev + ' ' + transcript : transcript;
        return currentBuffer.trim();
      });
      setLastActivityTime(Date.now());
    }
  }, [transcript, state, isListening, continuous]);

  // Keep refs in sync with state
  useEffect(() => {
    transcriptBufferRef.current = transcriptBuffer;
  }, [transcriptBuffer]);

  useEffect(() => {
    lastActivityTimeRef.current = lastActivityTime;
  }, [lastActivityTime]);

  useEffect(() => {
    if (continuous && isListening) {
      timeoutRef.current = setTimeout(() => {
        const currentBuffer = transcriptBufferRef.current;
        const currentLastActivity = lastActivityTimeRef.current;
        if (Date.now() - currentLastActivity > 10000 && currentBuffer) {
          const isCmd = isCommand(currentBuffer);
          
          if (!isCmd) {
            onTranscript(currentBuffer);
          }
          
          setTranscriptBuffer('');
          setLastActivityTime(Date.now());
        }
      }, 10000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [continuous, isListening, onTranscript, isCommand]);

  const handleClick = () => {
    if (!isSupported) {
      onError?.('Browser Anda tidak mendukung fitur suara. Silakan gunakan Chrome, Edge, atau Safari terbaru.');
      return;
    }

    if (isListening) {
      if (transcriptBuffer) {
        const isCmd = isCommand(transcriptBuffer);
        
        if (!isCmd) {
          onTranscript(transcriptBuffer);
        }
        
        setTranscriptBuffer('');
      }
      stopRecording();
    } else {
setTranscriptBuffer('');
      startRecording().catch((error) => {
        logger.error('Failed to start recording:', error);
        if (error.message && (error.message.includes('mikrofon') || error.message.includes('izin'))) {
          setShowPermissionHandler(true);
        }
      });
    }
  };

  const getButtonStyle = () => {
    if (!isSupported) {
      return 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed';
    }

    if (permissionState === 'denied') {
      return 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md';
    }

    switch (state) {
      case 'listening':
        return continuous ? 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg' : 'bg-red-500 hover:bg-red-600 text-white hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg';
      case 'processing':
        return 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg';
      default:
        return 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md';
    }
  };

  const getTooltipText = () => {
    if (!isSupported) return 'Browser tidak mendukung fitur suara';
    if (permissionState === 'denied') return 'Izin mikrofon ditolak, klik untuk mengatur ulang';
    
    if (continuous && isListening && transcriptBuffer) {
      return `Mode berkelanjutan: "${transcriptBuffer.substring(0, 30)}${transcriptBuffer.length > 30 ? '...' : ''}"`;
    }
    
    switch (state) {
      case 'listening':
        return continuous ? 'Mode berkelanjutan aktif. Klik untuk berhenti dan kirim' : 'Klik untuk berhenti merekam';
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
    if (permissionState === 'denied') return 'Izin mikrofon ditolak';
    
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
      <>
        <button
          disabled
          className={`p-3 mb-1 bg-neutral-300 dark:bg-neutral-600 text-neutral-400 rounded-full cursor-not-allowed transition-colors ${className}`}
          aria-label="Input suara dinonaktifkan"
          title="Input suara dinonaktifkan"
        >
          <MicrophoneIcon className="w-5 h-5" />
        </button>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {screenReaderAnnouncement}
        </div>
      </>
    );
  }

  if (showPermissionHandler) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowPermissionHandler(true)}
          className={`
            p-3 mb-1 rounded-full transition-all duration-200 ease-out shadow-sm flex-shrink-0
            ${getButtonStyle()}
            ${className}
          `}
          aria-label="Perlu izin mikrofon"
          title="Perlu izin mikrofon"
        >
          <MicrophoneOffIcon className="w-5 h-5" />
        </button>
        
        <MicrophonePermissionHandler
          onPermissionGranted={() => {
            setShowPermissionHandler(false);
            setLastError('');
            requestPermission().then((granted) => {
              if (granted) {
                startRecording();
              }
            });
          }}
          onFallbackToText={() => {
            setShowPermissionHandler(false);
            onError?.('Fitur suara tidak tersedia. Gunakan input teks.');
          }}
          className="absolute bottom-full right-0 mb-2 w-80 z-50"
        />
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {screenReaderAnnouncement}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!isSupported || disabled}
         className={`
           p-3 mb-1 rounded-full transition-all duration-200 ease-out shadow-sm flex-shrink-0
           ${getButtonStyle()}
           ${pulseAnimation ? 'animate-pulse scale-110' : 'hover:scale-[1.02]'}
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
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {screenReaderAnnouncement}
      </div>
    </>
  );
};

export default VoiceInputButton;
