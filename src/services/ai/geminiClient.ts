import { GoogleGenAI } from "@google/genai";
import { createError, ErrorType, classifyError, logError } from "../../utils/errorHandler";
import { logger } from "../../utils/logger";
import { API_CONFIG, AI_MODELS } from "../../constants";

// NOTE: Using API_CONFIG to avoid hardcoded URLs
// See Issue #1323 for circular dependency fix
const DEFAULT_API_BASE_URL = API_CONFIG.DEFAULT_BASE_URL;

// Re-export AI_MODELS from centralized constants for backward compatibility
export { AI_MODELS };

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
