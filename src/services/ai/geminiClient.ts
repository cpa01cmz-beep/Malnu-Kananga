import { GoogleGenAI } from "@google/genai";
import { createError, ErrorType, classifyError, logError } from "../../utils/errorHandler";
import { logger } from "../../utils/logger";

// NOTE: Inline DEFAULT_API_BASE_URL definition to avoid circular dependency with config.ts
// See Issue #1323 for circular dependency fix
const DEFAULT_API_BASE_URL = 'https://malnu-kananga-worker-prod.cpa01cmz.workers.dev';

// Model Constants
export const AI_MODELS = {
  FLASH: 'gemini-2.5-flash' as const,
  PRO_THINKING: 'gemini-3-pro-preview' as const
} as const;

// Lazy initialization of AI client with error handling
let aiInstance: GoogleGenAI | null = null;
let aiInitializationError: Error | null = null;

export async function getAIInstance(): Promise<GoogleGenAI> {
  if (aiInitializationError) {
    throw aiInitializationError;
  }

  if (aiInstance) {
    return aiInstance;
  }

  try {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

    if (!apiKey) {
      const error = createError(
        ErrorType.API_KEY_ERROR,
        'geminiClient.init',
        'API Key Gemini tidak ditemukan. Silakan hubungi administrator.',
        false
      );
      logError(error);
      aiInitializationError = error;
      throw error;
    }

    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (error) {
    const classifiedError = classifyError(error, {
      operation: 'geminiClient.init',
      timestamp: Date.now()
    });
    logError(classifiedError);
    aiInitializationError = classifiedError;
    throw classifiedError;
  }
}

/**
 * Cleanup gemini service - clear AI instance state and reset error state
 * Call this on logout or when service needs to be reset
 */
export function cleanupGeminiService(): void {
  aiInstance = null;
  aiInitializationError = null;
  logger.info('Gemini service cleaned up - AI instance cleared');
}

export { DEFAULT_API_BASE_URL };
