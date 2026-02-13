// Main AI service orchestrator - re-exports all AI functions for backward compatibility
// This file maintains the same export structure as the original geminiService.ts

// Client exports
export { getAIInstance, cleanupGeminiService, AI_MODELS, DEFAULT_API_BASE_URL } from './geminiClient';

// Chat exports
export { getAIResponseStream, initialGreeting } from './geminiChat';
export type { LocalContext } from './geminiChat';

// Analysis exports
export {
  analyzeClassPerformance,
  analyzeStudentPerformance,
  generateAssignmentFeedback,
  generateMaterialRecommendations
} from './geminiAnalysis';

// Editor exports
export { getAIEditorResponse } from './geminiEditor';

// Quiz exports
export { generateQuiz } from './geminiQuiz';

// Study plan exports
export { generateStudyPlan } from './geminiStudy';

// Re-export types that might be used by external code
export type { FeaturedProgram, LatestNews, StudyPlan } from '../../types';
export type { AIFeedback } from '../../types';
