import type { FeaturedProgram, LatestNews } from '../../types';
import { getAIInstance, DEFAULT_API_BASE_URL, AI_MODELS } from './geminiClient';
import { chatCache } from '../aiCacheService';
import { withCircuitBreaker } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { AI_CONFIG, APP_CONFIG, HTTP } from '../../constants';
import {
  getAIErrorMessage,
  AIOperationType,
  handleAIError
} from '../../utils/aiErrorHandler';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_API_BASE_URL;
const WORKER_CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

// Local Context Interface
export interface LocalContext {
  featuredPrograms: FeaturedProgram[];
  latestNews: LatestNews[];
}

// Initial greeting for AI chat
export const initialGreeting = `Assalamualaikum! Saya Asisten AI ${APP_CONFIG.SCHOOL_NAME}. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?`;

/**
 * This function implements RAG pattern with optional Thinking Mode
 * Streams AI responses for chat with local context and knowledge base
 */
export async function* getAIResponseStream(
  message: string,
  history: {role: 'user' | 'model', parts: string}[],
  localContext?: LocalContext,
  useThinkingMode: boolean = false // Toggle for Gemini 3 Pro with Thinking
): AsyncGenerator<string> {
  // Check cache first for identical requests
  const contextString = localContext ?
    `${localContext.featuredPrograms.map(p => p.title).join(', ')}|${localContext.latestNews.map(n => n.title).join(', ')}` : '';

  const cacheKey = {
    operation: 'chat',
    input: message,
    context: contextString,
    thinkingMode: useThinkingMode
  };

  const cachedResponse = chatCache.get<string>(cacheKey);
  if (cachedResponse) {
    logger.debug('Returning cached chat response');
    yield* [cachedResponse];
    return;
  }

  let ragContext = "";

  // 1. Fetch RAG context from Worker
  try {
    const contextResponse = await fetch(WORKER_CHAT_ENDPOINT, {
      method: HTTP.METHODS.POST,
      headers: { 'Content-Type': HTTP.HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({ message }),
    });
    if (contextResponse.ok) {
      const data = await contextResponse.json();
      ragContext = data.context || "";
    }
  } catch(e) {
    logger.warn("RAG fetch failed, proceeding with local context only:", e);
  }

  // 2. Prepare Dynamic Context from Local State
  let localContextString = "";
  if (localContext) {
    localContextString = `
[INFORMASI AKTUAL WEBSITE]
Data berikut adalah konten yang sedang ditampilkan di website saat ini:
- **Program Unggulan**: ${localContext.featuredPrograms.map(p => p.title).join(', ')}.
- **Berita Terbaru**: ${localContext.latestNews.map(n => n.title).join(', ')}.
`;
  }

  // 3. Construct Augmented Prompt
  const augmentedMessage = `
${localContextString}

[DATABASE PENGETAHUAN SEKOLAH]
${ragContext ? ragContext : "Tidak ada data tambahan dari database."}

[PERTANYAAN USER]
${message}
`;

  // System instruction
  const baseInstruction = `Anda adalah 'Asisten ${APP_CONFIG.SCHOOL_NAME}'.
PANDUAN MENJAWAB:
1. Jawablah berdasarkan data [INFORMASI AKTUAL WEBSITE] dan [DATABASE PENGETAHUAN SEKOLAH].
2. Gunakan Bahasa Indonesia yang sopan.
3. Jika mode berpikir aktif, jelaskan penalaran Anda jika diminta.`;

  const contents = [
    ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
    { role: 'user', parts: [{ text: augmentedMessage }] }
  ];

  const model = useThinkingMode ? AI_MODELS.PRO_THINKING : AI_MODELS.FLASH;

  // Config: Enable Thinking Budget only if using Pro model for complex queries
  const config: { systemInstruction: string; thinkingConfig?: { thinkingBudget: number } } = {
    systemInstruction: baseInstruction,
  };

  if (useThinkingMode) {
    config.thinkingConfig = { thinkingBudget: AI_CONFIG.THINKING_BUDGET }; // Max budget for Gemini 3 Pro
    // Note: Do not set maxOutputTokens when thinkingBudget is set, per guidelines
  }

  try {
    const responseStream = await withCircuitBreaker(async () => {
      return await (await getAIInstance()).models.generateContentStream({
        model,
        contents,
        config
      });
    });

    let accumulatedResponse = "";
    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      accumulatedResponse += text;
      yield text;
    }

    // Cache complete response
    if (accumulatedResponse) {
      chatCache.set(cacheKey, accumulatedResponse);
    }
  } catch (error) {
    const classifiedError = handleAIError(error, AIOperationType.CHAT, AI_MODELS.FLASH);
    const message = getAIErrorMessage(classifiedError, AIOperationType.CHAT);
    yield message;
  }
}
