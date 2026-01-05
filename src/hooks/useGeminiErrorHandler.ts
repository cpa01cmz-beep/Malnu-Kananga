// useGeminiErrorHandler.ts - Hook utilities for Gemini error handling

import { useCallback } from 'react';
import { GeminiError, getUserFriendlyMessage } from '../utils/geminiErrorHandler';

export const useGeminiErrorHandler = () => {
  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Gemini Error in ${context}:`, error);
    
    // Log to monitoring
    try {
      fetch('/api/errors/hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          isGeminiError: error instanceof GeminiError,
        }),
      }).catch(() => {
        // Silently fail
      });
    } catch {
      // Ignore monitoring errors
    }
  }, []);

  const getUserMessage = useCallback((error: Error): string => {
    return getUserFriendlyMessage(error);
  }, []);

  return { handleError, getUserMessage };
};