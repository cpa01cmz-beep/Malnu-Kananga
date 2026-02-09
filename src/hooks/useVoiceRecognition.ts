import { useState, useEffect, useCallback, useRef } from 'react';
import SpeechRecognitionService from '../services/speechRecognitionService';
import type { 
  SpeechRecognitionState, 
  SpeechRecognitionError
} from '../types';
import { VoiceLanguage } from '../types';
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
  permissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
  requestPermission: () => Promise<boolean>;
}

export const useVoiceRecognition = (
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn => {
  const { onTranscript, onError, autoStart = false } = options;

  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<SpeechRecognitionState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState<VoiceLanguage>(VoiceLanguage.Indonesian);
  const [continuous, setContinuous] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  const serviceRef = useRef<SpeechRecognitionService | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  // Keep refs up to date
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onError]);

  useEffect(() => {
    serviceRef.current = new SpeechRecognitionService({
      language,
      continuous,
      interimResults: true,
      maxAlternatives: 1,
    });

    const service = serviceRef.current;
    setIsSupported(service.getIsSupported());
    setPermissionState(service.getPermissionState());

    service.onResult((transcriptResult, isFinal) => {
      setTranscript(transcriptResult);
      onTranscriptRef.current?.(transcriptResult, isFinal);
    });

    service.onError((error) => {
      setState('error');
      setPermissionState(service.getPermissionState());
      onErrorRef.current?.(error);
    });

    service.onStart(() => {
      setState('listening');
      setIsListening(true);
      // Update permission state after successful start
      setPermissionState('granted');
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
  }, [language, continuous, autoStart]);

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

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current) {
      return false;
    }

    try {
      const granted = await serviceRef.current.requestPermission();
      setPermissionState(serviceRef.current.getPermissionState());
      return granted;
    } catch (error) {
      logger.error('Permission request failed:', error);
      setPermissionState('denied');
      return false;
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
    permissionState,
    requestPermission,
  };
};
