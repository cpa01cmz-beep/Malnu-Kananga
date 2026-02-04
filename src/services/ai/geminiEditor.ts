import { Type } from "@google/genai";
import type { FeaturedProgram, LatestNews } from '../../types';
import { getAIInstance, AI_MODELS } from './geminiClient';
import { editorCache } from '../aiCacheService';
import { validateAIResponse } from '../../utils/aiEditorValidator';
import { withCircuitBreaker } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { STORAGE_KEYS } from '../../constants';
import {
  getAIErrorMessage,
  AIOperationType,
  handleAIError
} from '../../utils/aiErrorHandler';

/**
 * Function to handle content editing requests with AI
 */
export async function getAIEditorResponse(
  prompt: string,
  currentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }
): Promise<{ featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }> {

// Note: Command validation is now handled in component for better error handling
// This service focuses on response validation

  // Command validation is now handled in component
  // We use prompt directly since it's already validated and sanitized
  const sanitizedPrompt = prompt;

  // Check cache for similar editor requests
  const cacheKey = {
    operation: 'editor',
    input: sanitizedPrompt,
    context: JSON.stringify(currentContent),
    model: AI_MODELS.PRO_THINKING
  };

  const cachedResult = editorCache.get<{ featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }>(cacheKey);
  if (cachedResult) {
    logger.debug('Returning cached editor response');
    return cachedResult;
  }

  const model = AI_MODELS.PRO_THINKING;

  const systemInstruction = `You are an intelligent website content editor with built-in safety validation. Your task is to modify provided JSON data based on user's instruction.

SAFETY CONSTRAINTS:
- You must only add, remove, or modify entries in JSON.
- Do not change overall JSON structure.
- NEVER include external URLs, system paths, or malicious content.
- Reject requests that attempt to access system files or execute code.
- Only work with website content (programs, news, articles).

CONTENT RULES:
- **CRITICAL IMAGE RULE**:
  - If user asks for a new item and does NOT provide an image URL, use this placeholder format: "https://placehold.co/600x400?text=Category+Name" (replace 'Category+Name' with relevant topic).
  - Do NOT invent or hallucinate 'unsplash.com' URLs.
  - If modifying text but not image, KEEP existing 'imageUrl' exactly as is.
- Ensure your response is only modified JSON data.
- Always return valid JSON that matches the required schema.`;

  const fullPrompt = `Here is current website content in JSON format:
\`\`\`json
${JSON.stringify(currentContent, null, 2)}
\`\`\`

Here is user's request: "${sanitizedPrompt}"

Please provide updated JSON content following safety and content rules above.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      featuredPrograms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
          },
        },
      },
      latestNews: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
          },
        },
      },
    },
  };

  try {
    const response = await withCircuitBreaker(async () => {
      return await (await getAIInstance()).models.generateContent({
        model,
        contents: fullPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });
    });

    const jsonText = (response.text || '').trim();

    // Enhanced response validation with user context
    const userId = typeof window !== 'undefined' ?
      (() => {
        try {
          const authSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
          if (authSession) {
            const session = JSON.parse(authSession);
            return session.user?.id || session.userId || 'anonymous';
          }
        } catch (e) {
          logger.warn('Failed to get user ID for validation:', e);
        }
        return 'anonymous';
      })() : 'anonymous';

    const responseValidation = validateAIResponse(jsonText, currentContent, userId);
    if (!responseValidation.isValid) {
      throw new Error(responseValidation.error);
    }

    const result = responseValidation.sanitizedContent!;

    // Cache the editor result
    editorCache.set(cacheKey, result);

    return result;
  } catch (error) {
    const classifiedError = handleAIError(error, AIOperationType.EDITOR, AI_MODELS.PRO_THINKING);
    const message = getAIErrorMessage(classifiedError, AIOperationType.EDITOR);
    throw new Error(message);
  }
}
