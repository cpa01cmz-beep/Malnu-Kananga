/**
 * Centralized error handling utility for AI services
 * Provides consistent error formatting and user-friendly messages for AI operations
 */

import { ErrorType, classifyError, logError, AppError, getUserFriendlyMessage } from './errorHandler';
import { logger } from './logger';

export interface AIErrorContext {
  operation: string;
  aiModel?: string;
  timestamp: number;
  attempt?: number;
  maxAttempts?: number;
}

export enum AIOperationType {
  CHAT = 'chat',
  ANALYSIS = 'analysis',
  EDITOR = 'editor',
  QUIZ = 'quiz',
  STUDY_PLAN = 'study_plan',
  FEEDBACK = 'feedback'
}

const AI_OPERATION_MESSAGES: Record<AIOperationType, {
  operation: string;
  genericError: string;
  retryMessage: string;
  fallbackMessage: string;
}> = {
  [AIOperationType.CHAT]: {
    operation: 'getAIResponseStream',
    genericError: 'Maaf, sistem AI sedang sibuk atau mengalami gangguan. Silakan coba sesaat lagi.',
    retryMessage: 'Chat AI sedang tidak tersedia. Silakan coba lagi.',
    fallbackMessage: 'Chat AI sedang tidak merespons. Coba lagi nanti.'
  },
  [AIOperationType.ANALYSIS]: {
    operation: 'analyzeClassPerformance',
    genericError: 'Maaf, gagal menganalisis data saat ini.',
    retryMessage: 'Analisis AI gagal. Silakan coba lagi.',
    fallbackMessage: 'Analisis tidak tersedia saat ini.'
  },
  [AIOperationType.EDITOR]: {
    operation: 'getAIEditorResponse',
    genericError: 'Gagal memproses respon dari AI. Mohon coba instruksi yang lebih spesifik.',
    retryMessage: 'Editor AI gagal. Silakan coba dengan instruksi yang lebih jelas.',
    fallbackMessage: 'Editor AI sedang tidak tersedia.'
  },
  [AIOperationType.QUIZ]: {
    operation: 'generateQuiz',
    genericError: 'Gagal membuat kuis dengan AI. Silakan coba lagi atau kurangi jumlah pertanyaan.',
    retryMessage: 'Pembuatan kuis AI gagal. Silakan coba lagi.',
    fallbackMessage: 'Pembuatan kuis AI tidak tersedia saat ini.'
  },
  [AIOperationType.STUDY_PLAN]: {
    operation: 'generateStudyPlan',
    genericError: 'Gagal membuat rencana belajar dengan AI. Silakan coba lagi.',
    retryMessage: 'Pembuatan rencana belajar AI gagal. Silakan coba lagi.',
    fallbackMessage: 'Pembuatan rencana belajar AI tidak tersedia saat ini.'
  },
  [AIOperationType.FEEDBACK]: {
    operation: 'generateAssignmentFeedback',
    genericError: 'Gagal membuat feedback AI. Silakan coba lagi.',
    retryMessage: 'Pembuatan feedback AI gagal. Silakan coba lagi.',
    fallbackMessage: 'Pembuatan feedback AI tidak tersedia saat ini.'
  }
};

export function handleAIError(
  error: unknown,
  operationType: AIOperationType,
  aiModel?: string
): AppError {
  const context: AIErrorContext = {
    operation: AI_OPERATION_MESSAGES[operationType].operation,
    aiModel,
    timestamp: Date.now()
  };

  const classifiedError = classifyError(error, context);
  
  // Log the error with AI-specific context
  logError(classifiedError);

  return classifiedError;
}

export function getAIErrorMessage(
  error: AppError,
  operationType: AIOperationType,
  useGeneric: boolean = false
): string {
  const operationInfo = AI_OPERATION_MESSAGES[operationType];
  
  if (useGeneric) {
    return operationInfo.genericError;
  }

  const standardMessage = getUserFriendlyMessage(error);
  
  // If it's a generic unknown error, use the AI-specific generic message
  if (standardMessage === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.') {
    return operationInfo.genericError;
  }

  return standardMessage;
}

export function shouldRetryAIError(error: AppError): boolean {
  // Non-retryable AI errors
  const nonRetryableTypes: ErrorType[] = [
    ErrorType.API_KEY_ERROR,
    ErrorType.VALIDATION_ERROR,
    ErrorType.CONTENT_FILTER_ERROR,
    ErrorType.QUOTA_EXCEEDED_ERROR,
    ErrorType.PERMISSION_ERROR
  ];

  if (nonRetryableTypes.includes(error.type)) {
    return false;
  }

  return error.isRetryable;
}

export function logAIOperationStart(
  operationType: AIOperationType,
  context: { [key: string]: string | number | boolean }
): void {
  logger.debug(`[AI: ${operationType}] Starting operation`, context);
}

export function logAIOperationSuccess(
  operationType: AIOperationType,
  context: { [key: string]: string | number | boolean }
): void {
  logger.debug(`[AI: ${operationType}] Operation completed successfully`, context);
}

export function logAIOperationError(
  operationType: AIOperationType,
  error: AppError,
  context: { [key: string]: string | number | boolean }
): void {
  logger.error(`[AI: ${operationType}] Operation failed`, {
    errorType: error.type,
    errorMessage: error.message,
    ...context
  });
}

export function getCircuitBreakerStateMessage(
  state: 'closed' | 'open' | 'half-open',
  failureCount: number
): string {
  switch (state) {
    case 'open':
      return `Sistem AI sedang sibuk (${failureCount} kegagalan tercatat). Silakan tunggu beberapa saat dan coba lagi.`;
    case 'half-open':
      return `Mencoba memulihkan layanan AI (${failureCount} kegagalan tercatat).`;
    case 'closed':
      return 'Layanan AI beroperasi normal.';
    default:
      return 'Status layanan AI tidak diketahui.';
  }
}

export function createAIError(
  type: ErrorType,
  operationType: AIOperationType,
  userMessage?: string,
  originalError?: unknown
): AppError {
  const message = userMessage || AI_OPERATION_MESSAGES[operationType].genericError;
  
  return {
    name: 'AppError',
    message,
    type,
    context: {
      operation: AI_OPERATION_MESSAGES[operationType].operation,
      timestamp: Date.now()
    },
    isRetryable: shouldRetryAIError({ type, isRetryable: true } as AppError),
    originalError
  } as AppError;
}
