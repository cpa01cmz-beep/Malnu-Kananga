import { useState, useEffect, useCallback } from 'react';
import VoiceCommandParser from '../services/voiceCommandParser';
import type { VoiceCommand } from '../types';
import { VoiceLanguage } from '../types';
import { logger } from '../utils/logger';

interface UseVoiceCommandsOptions {
  onCommand?: (command: VoiceCommand) => void;
  language?: VoiceLanguage;
}

interface UseVoiceCommandsReturn {
  isSupported: boolean;
  parseCommand: (transcript: string) => VoiceCommand | null;
  isCommand: (transcript: string) => boolean;
  setLanguage: (language: VoiceLanguage) => void;
  commands: string[];
}

export const useVoiceCommands = (
  options: UseVoiceCommandsOptions = {}
): UseVoiceCommandsReturn => {
  const { onCommand, language: propLanguage = VoiceLanguage.Indonesian } = options;

  const [isSupported, setIsSupported] = useState(true);
  const [commands, setCommands] = useState<string[]>([]);

  const parserRef = useRef<VoiceCommandParser | null>(null);

  useEffect(() => {
    parserRef.current = new VoiceCommandParser();
    setIsSupported(true);

    const parser = parserRef.current;
    setCommands(parser.getCommands().map((cmd) => cmd.action));

    if (propLanguage) {
      parser.setLanguage(propLanguage);
    }

    return () => {
      parser?.cleanup();
    };
  }, [propLanguage]);

  const parseCommand = useCallback((transcript: string): VoiceCommand | null => {
    if (!parserRef.current || !isSupported) {
      logger.warn('Voice command parser not supported or not initialized');
      return null;
    }

    const command = parserRef.current.parse(transcript);

    if (command) {
      logger.debug('Command recognized:', command);
      onCommand?.(command);
    }

    return command;
  }, [isSupported, onCommand]);

  const isCommand = useCallback((transcript: string): boolean => {
    if (!parserRef.current || !isSupported) {
      return false;
    }

    return parserRef.current.isCommand(transcript);
  }, [isSupported]);

  const setLanguage = useCallback((language: VoiceLanguage) => {
    if (parserRef.current) {
      parserRef.current.setLanguage(language);
      logger.debug('Voice command language set to:', language);
    }
  }, []);

  return {
    isSupported,
    parseCommand,
    isCommand,
    setLanguage,
    commands,
  };
};

import { useRef } from 'react';
