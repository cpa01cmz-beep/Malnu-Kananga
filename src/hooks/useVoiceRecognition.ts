import { useState, useEffect, useCallback, useRef } from 'react';
import SpeechRecognitionService from '../services/speechRecognitionService';
import type { 
  SpeechRecognitionState, 
  SpeechRecognitionError,
  VoiceLanguage 
} from '../types';
import { logger } from '../utils/logger';

interface UseVoiceRecognitionOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: SpeechRecognitionError) => void;
  autoStart?: boolean;
}

interface UseVoiceRecognitionReturn {
  transcript: string;
  state: SpeechRecognitionState;
  isListening: boolean;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  abortRecording: () => void;
  setLanguage: (language: VoiceLanguage) => void;
  setContinuous: (continuous: boolean) => void;
  language: VoiceLanguage;
  continuous: boolean;
}

export const useVoiceRecognition = (
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn => {
  const { onTranscript, onError, autoStart = false } = options;
  
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<SpeechRecognitionState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState<VoiceLanguage>('id-ID');
  const [continuous, setContinuous] = useState(false);
  
  const serviceRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    serviceRef.current = new SpeechRecognitionService({
      language,
      continuous,
      interimResults: true,
      maxAlternatives: 1,
    });

    const service = serviceRef.current;
    setIsSupported(service.getIsSupported());

    service.onResult((transcriptResult, isFinal) => {
      setTranscript(transcriptResult);
      onTranscript?.(transcriptResult, isFinal);
    });

    service.onError((error) => {
      setState('error');
      onError?.(error);
    });

    service.onStart(() => {
      setState('listening');
      setIsListening(true);
    });

    service.onEnd(() => {
      setState('idle');
      setIsListening(false);
    });

    service.onSpeechStart(() => {
      setState('listening');
    });

    service.onSpeechEnd(() => {
      setState('processing');
    });

    if (autoStart) {
      service.startRecording().catch((error) => {
        logger.error('Auto-start failed:', error);
      });
    }

    return () => {
      service?.cleanup();
    };
  }, [language, continuous, onTranscript, onError, autoStart]);

  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.setLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.setContinuous(continuous);
    }
  }, [continuous]);

  const startRecording = useCallback(async () => {
    if (!serviceRef.current || !isSupported) {
      logger.warn('Speech recognition not supported or service not initialized');
      return;
    }

    setTranscript('');
    await serviceRef.current.startRecording();
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stopRecording();
    }
  }, []);

  const abortRecording = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.abortRecording();
      setTranscript('');
      setState('idle');
      setIsListening(false);
    }
  }, []);

  return {
    transcript,
    state,
    isListening,
    isSupported,
    startRecording,
    stopRecording,
    abortRecording,
    setLanguage,
    setContinuous,
    language,
    continuous,
  };
};
