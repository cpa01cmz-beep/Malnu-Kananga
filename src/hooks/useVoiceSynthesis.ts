import { useState, useEffect, useCallback, useRef } from 'react';
import SpeechSynthesisService from '../services/speechSynthesisService';
import type { 
  SpeechSynthesisConfig,
  SpeechSynthesisError,
  SpeechSynthesisVoice 
} from '../types';
import { logger } from '../utils/logger';

interface UseVoiceSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisError) => void;
  autoRead?: boolean;
}

interface UseVoiceSynthesisReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  config: SpeechSynthesisConfig;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

export const useVoiceSynthesis = (
  options: UseVoiceSynthesisOptions = {}
): UseVoiceSynthesisReturn => {
  const { onStart, onEnd, onError } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [config, setConfig] = useState<SpeechSynthesisConfig>({
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });
  
  const serviceRef = useRef<SpeechSynthesisService | null>(null);

  useEffect(() => {
    serviceRef.current = new SpeechSynthesisService({
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
    });

    const service = serviceRef.current;
    setIsSupported(service.getIsSupported());

    service.onStart(() => {
      setIsSpeaking(true);
      setIsPaused(false);
      setConfig(service.getConfig());
      onStart?.();
    });

    service.onEnd(() => {
      setIsSpeaking(false);
      setIsPaused(false);
      setConfig(service.getConfig());
      onEnd?.();
    });

    service.onError((error) => {
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.(error);
    });

    service.onPause(() => {
      setIsPaused(true);
    });

    service.onResume(() => {
      setIsPaused(false);
    });

    service.onBoundary(() => {
      setConfig(service.getConfig());
    });

    setVoices(service.getAvailableVoices());
    setConfig(service.getConfig());

    return () => {
      service?.cleanup();
    };
  }, [onStart, onEnd, onError]);

  const speak = useCallback((text: string) => {
    if (serviceRef.current && isSupported) {
      serviceRef.current.speak(text);
    } else {
      logger.warn('Speech synthesis not supported or service not initialized');
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.resume();
    }
  }, []);

  const stop = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop();
    }
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    if (serviceRef.current) {
      serviceRef.current.setVoice(voice);
      setConfig(serviceRef.current.getConfig());
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    if (serviceRef.current) {
      serviceRef.current.setRate(rate);
      setConfig(serviceRef.current.getConfig());
    }
  }, []);

  const setPitch = useCallback((pitch: number) => {
    if (serviceRef.current) {
      serviceRef.current.setPitch(pitch);
      setConfig(serviceRef.current.getConfig());
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (serviceRef.current) {
      serviceRef.current.setVolume(volume);
      setConfig(serviceRef.current.getConfig());
    }
  }, []);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    config,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  };
};
