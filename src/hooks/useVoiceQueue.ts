import { useState, useEffect, useCallback, useRef } from 'react';
import VoiceMessageQueue from '../services/voiceMessageQueue';
import type { ChatMessage } from '../types';
import { logger } from '../utils/logger';

interface UseVoiceQueueOptions {
  onQueueStart?: () => void;
  onQueueEnd?: () => void;
  onMessageStart?: (message: ChatMessage) => void;
  onMessageEnd?: (message: ChatMessage) => void;
  onQueueError?: (error: string) => void;
}

interface UseVoiceQueueReturn {
  isPlaying: boolean;
  isPaused: boolean;
  queueSize: number;
  currentIndex: number;
  currentMessage: ChatMessage | null;
  addMessage: (message: ChatMessage) => void;
  addMessages: (messages: ChatMessage[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;
  previous: () => void;
  clear: () => void;
}

export const useVoiceQueue = (
  speakFunction: (text: string) => void,
  stopFunction: () => void,
  options: UseVoiceQueueOptions = {}
): UseVoiceQueueReturn => {
  const { onQueueStart, onQueueEnd, onMessageStart, onMessageEnd, onQueueError } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<ChatMessage | null>(null);

  const queueRef = useRef<VoiceMessageQueue | null>(null);
  const messagesRef = useRef<Map<string, ChatMessage>>(new Map());

  useEffect(() => {
    const queue = new VoiceMessageQueue(
      speakFunction,
      stopFunction,
      {
        onQueueStart: () => {
          setIsPlaying(true);
          onQueueStart?.();
        },
        onQueueEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentIndex(0);
          setCurrentMessage(null);
          onQueueEnd?.();
        },
        onMessageStart: (item) => {
          const msg = messagesRef.current.get(item.id);
          if (msg) {
            setCurrentMessage(msg);
            onMessageStart?.(msg);
          }
        },
        onMessageEnd: (item) => {
          const msg = messagesRef.current.get(item.id);
          if (msg) {
            onMessageEnd?.(msg);
          }
        },
        onQueueError: (error) => {
          logger.error('Queue error:', error);
          onQueueError?.(error);
        },
      }
    );

    queueRef.current = queue;

    return () => {
      queue?.cleanup();
    };
  }, [speakFunction, stopFunction, onQueueStart, onQueueEnd, onMessageStart, onMessageEnd, onQueueError]);

  useEffect(() => {
    if (queueRef.current) {
      setQueueSize(queueRef.current.getQueueSize());
      setCurrentIndex(queueRef.current.getCurrentIndex());
      setIsPlaying(queueRef.current.isQueuePlaying());
      setIsPaused(queueRef.current.isQueuePaused());
    }
  }, []);

  const updateQueueState = useCallback(() => {
    if (queueRef.current) {
      setQueueSize(queueRef.current.getQueueSize());
      setCurrentIndex(queueRef.current.getCurrentIndex());
      setIsPlaying(queueRef.current.isQueuePlaying());
      setIsPaused(queueRef.current.isQueuePaused());
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    if (!queueRef.current) {
      logger.warn('Queue not initialized');
      return;
    }

    messagesRef.current.set(message.id, message);
    queueRef.current.addMessage(message);
    updateQueueState();
  }, [updateQueueState]);

  const addMessages = useCallback((messages: ChatMessage[]) => {
    if (!queueRef.current) {
      logger.warn('Queue not initialized');
      return;
    }

    messages.forEach((msg) => messagesRef.current.set(msg.id, msg));
    queueRef.current.addMessages(messages);
    updateQueueState();
  }, [updateQueueState]);

  const pause = useCallback(() => {
    queueRef.current?.pause();
    updateQueueState();
  }, [updateQueueState]);

  const resume = useCallback(() => {
    queueRef.current?.resume();
    updateQueueState();
  }, [updateQueueState]);

  const stop = useCallback(() => {
    queueRef.current?.stop();
    messagesRef.current.clear();
    updateQueueState();
  }, [updateQueueState]);

  const skip = useCallback(() => {
    queueRef.current?.skip();
    updateQueueState();
  }, [updateQueueState]);

  const previous = useCallback(() => {
    queueRef.current?.previous();
    updateQueueState();
  }, [updateQueueState]);

  const clear = useCallback(() => {
    queueRef.current?.clear();
    messagesRef.current.clear();
    updateQueueState();
  }, [updateQueueState]);

  return {
    isPlaying,
    isPaused,
    queueSize,
    currentIndex,
    currentMessage,
    addMessage,
    addMessages,
    pause,
    resume,
    stop,
    skip,
    previous,
    clear,
  };
};
