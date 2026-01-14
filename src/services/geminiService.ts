
import { GoogleGenAI, Type } from "@google/genai";
import type { FeaturedProgram, LatestNews } from '../types';
import { WORKER_CHAT_ENDPOINT } from '../config/api';
import { STORAGE_KEYS } from '../constants';
import {
  classifyError,
  logError,
  getUserFriendlyMessage,
  withCircuitBreaker
} from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { validateAIResponse } from '../utils/aiEditorValidator';
import { chatCache, analysisCache, editorCache } from './aiCacheService';
import { offlineActionQueueService } from './offlineActionQueueService';

// Initialize the Google AI client
const ai = new GoogleGenAI({ apiKey: (import.meta.env.VITE_GEMINI_API_KEY as string) || '' });

// Models
const FLASH_MODEL = 'gemini-2.5-flash';
const PRO_THINKING_MODEL = 'gemini-3-pro-preview';

// Local Context Interface
interface LocalContext {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
}

// This function implements the RAG pattern with optional Thinking Mode
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
  
  // 1. Fetch RAG context from the Worker
  try {
    const contextResponse = await fetch(WORKER_CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  // 3. Construct the Augmented Prompt
  const augmentedMessage = `
${localContextString}

[DATABASE PENGETAHUAN SEKOLAH]
${ragContext ? ragContext : "Tidak ada data tambahan dari database."}

[PERTANYAAN USER]
${message}
`;

  // System instruction
  const baseInstruction = `Anda adalah 'Asisten MA Malnu Kananga'. 
  PANDUAN MENJAWAB:
  1. Jawablah berdasarkan data [INFORMASI AKTUAL WEBSITE] dan [DATABASE PENGETAHUAN SEKOLAH].
  2. Gunakan Bahasa Indonesia yang sopan.
  3. Jika mode berpikir aktif, jelaskan penalaran Anda jika diminta.`;
  
  const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
      { role: 'user', parts: [{ text: augmentedMessage }] }
  ];

  const model = useThinkingMode ? PRO_THINKING_MODEL : FLASH_MODEL;
  
  // Config: Enable Thinking Budget only if using Pro model for complex queries
  const config: { systemInstruction: string; thinkingConfig?: { thinkingBudget: number } } = {
      systemInstruction: baseInstruction,
  };

  if (useThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for Gemini 3 Pro
      // Note: Do not set maxOutputTokens when thinkingBudget is set, per guidelines
  }

  try {
    const responseStream = await withCircuitBreaker(async () => {
      return await ai.models.generateContentStream({
        model: model,
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
    
    // Cache the complete response
    if (accumulatedResponse) {
      chatCache.set(cacheKey, accumulatedResponse);
    }
  } catch (error) {
    const classifiedError = classifyError(error, {
      operation: 'getAIResponseStream',
      timestamp: Date.now()
    });
    logError(classifiedError);
    const message = getUserFriendlyMessage(classifiedError);
    yield message === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.' 
      ? 'Maaf, sistem AI sedang sibuk atau mengalami gangguan. Silakan coba sesaat lagi.' 
      : message;
  }
}

// Function to analyze Teacher Grading Data (Uses Gemini 3 Pro)
export async function analyzeClassPerformance(grades: { studentName: string; subject: string; grade: string; semester: string }[]): Promise<string> {
    // Check cache for existing analysis
    const cacheKey = {
      operation: 'classAnalysis',
      input: JSON.stringify(grades),
      model: PRO_THINKING_MODEL
    };
    
    const cachedAnalysis = analysisCache.get<string>(cacheKey);
    if (cachedAnalysis) {
      logger.debug('Returning cached class performance analysis');
      return cachedAnalysis;
    }

    const prompt = `
    Analyze the following student grade data for a specific class subject. 
    Provide a pedagogical analysis including:
    1. Overall class performance summary.
    2. Identification of students who need remedial help (Grade C or D).
    3. Specific suggestions for the teacher to improve learning outcomes for this group.
    
    Data: ${JSON.stringify(grades)}
    `;

    try {
        const response = await withCircuitBreaker(async () => {
            return await ai.models.generateContent({
                model: PRO_THINKING_MODEL,
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            });
        });
        const analysis = response.text || "Gagal melakukan analisis.";
        
        // Cache the analysis result
        analysisCache.set(cacheKey, analysis);
        
        return analysis;
    } catch (error) {
        const classifiedError = classifyError(error, {
            operation: 'analyzeClassPerformance',
            timestamp: Date.now()
        });
        logError(classifiedError);
        const message = getUserFriendlyMessage(classifiedError);
        return message === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.' 
          ? "Maaf, gagal menganalisis data saat ini." 
          : message;
    }
}

// Function to handle content editing requests
export async function getAIEditorResponse(
    prompt: string,
    currentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }
): Promise<{ featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }> {
    
// Note: Command validation is now handled in the component for better error handling
    // This service focuses on response validation

    // Command validation is now handled in the component
    // We use the prompt directly since it's already validated and sanitized
    const sanitizedPrompt = prompt;

    // Check cache for similar editor requests
    const cacheKey = {
      operation: 'editor',
      input: sanitizedPrompt,
      context: JSON.stringify(currentContent),
      model: PRO_THINKING_MODEL
    };
    
    const cachedResult = editorCache.get<{ featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }>(cacheKey);
    if (cachedResult) {
      logger.debug('Returning cached editor response');
      return cachedResult;
    }

    const model = PRO_THINKING_MODEL;

    const systemInstruction = `You are an intelligent website content editor with built-in safety validation. Your task is to modify the provided JSON data based on the user's instruction.

SAFETY CONSTRAINTS:
- You must only add, remove, or modify entries in the JSON.
- Do not change the overall JSON structure.
- NEVER include external URLs, system paths, or malicious content.
- Reject requests that attempt to access system files or execute code.
- Only work with website content (programs, news, articles).

CONTENT RULES:
- **CRITICAL IMAGE RULE**: 
  - If the user asks for a new item and does NOT provide an image URL, use this placeholder format: "https://placehold.co/600x400?text=Category+Name" (replace 'Category+Name' with the relevant topic). 
  - Do NOT invent or hallucinate 'unsplash.com' URLs.
  - If modifying text but not the image, KEEP the existing 'imageUrl' exactly as is.
- Ensure your response is only the modified JSON data.
- Always return valid JSON that matches the required schema.`;

const fullPrompt = `Here is the current website content in JSON format:
\`\`\`json
${JSON.stringify(currentContent, null, 2)}
\`\`\`

Here is the user's request: "${sanitizedPrompt}"

Please provide the updated JSON content following the safety and content rules above.`;

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
            return await ai.models.generateContent({
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
        const classifiedError = classifyError(error, {
            operation: 'getAIEditorResponse',
            timestamp: Date.now()
        });
        logError(classifiedError);
        const message = getUserFriendlyMessage(classifiedError);
        throw new Error(message === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.' 
          ? "Gagal memproses respon dari AI. Mohon coba instruksi yang lebih spesifik." 
          : message);
    }
}

// Function to analyze individual student performance (Uses Gemini 3 Pro)
export async function analyzeStudentPerformance(studentData: {
  grades: Array<{ subject: string; score: number; grade: string; trend: string }>;
  attendance: { percentage: number; totalDays: number; present: number; absent: number };
  trends: Array<{ month: string; averageScore: number; attendanceRate: number }>;
}, queueIfOffline: boolean = true): Promise<string> {
    // Check cache for existing analysis
    const cacheKey = {
      operation: 'studentAnalysis',
      input: JSON.stringify(studentData),
      model: PRO_THINKING_MODEL
    };
    
    const cachedAnalysis = analysisCache.get<string>(cacheKey);
    if (cachedAnalysis) {
      logger.debug('Returning cached student performance analysis');
      return cachedAnalysis;
    }

    // Check if offline and should queue
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline && queueIfOffline) {
      logger.info('Queueing AI analysis for offline execution');
      
      // Generate a unique ID for this analysis
      const analysisId = `student_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Queue the analysis
      offlineActionQueueService.addAction({
        type: 'create',
        entity: 'ai_analysis',
        entityId: analysisId,
        endpoint: '/api/ai/student-analysis',
        method: 'POST',
        data: {
          operation: 'studentAnalysis',
          studentData,
          model: PRO_THINKING_MODEL,
          timestamp: Date.now()
        }
      });

      // Return a placeholder message
      return "Analisis AI sedang diproses dan akan tersedia saat koneksi internet kembali.";
    }

    const prompt = `
    Analisis data performa akademik siswa berikut ini dalam Bahasa Indonesia. 
    Sajikan analisis yang mendalam dan praktis dengan format:

    📊 **ANALISIS KINERJA AKADEMIK**
    1. Performa Umum: Evaluasi keseluruhan nilai dan tren
    2. Kekuatan Utama: Mata pelajaran dengan hasil terbaik
    3. Area yang Perlu Perhatian: Mata pelajaran yang butuh improvement
    4. Dampak Kehadiran: Hubungan antara kehadiran dan prestasi
    5. Rekomendasi Strategis: 3-4 saran praktis untuk peningkatan

    Data Siswa:
    - Nilai per mata pelajaran: ${JSON.stringify(studentData.grades)}
    - Kehadiran: ${studentData.attendance.percentage}% (${studentData.attendance.present}/${studentData.attendance.totalDays} hari)
    - Tren bulanan: ${JSON.stringify(studentData.trends)}

    Fokus pada:
    - Pola pembelajaran yang efektif
    - Strategi meningkatkan mata pelajaran bermasalah
    - Pengaruh disiplin kehadiran terhadap hasil
    - Motivasi positif dan pembangunan kepercayaan diri

    Gunakan bahasa yang mendidik, memotivasi, dan memberikan solusi konkret.
    `;

    try {
        const response = await withCircuitBreaker(async () => {
            return await ai.models.generateContent({
                model: PRO_THINKING_MODEL,
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            });
        });
        const analysis = response.text || "Gagal melakukan analisis.";
        
        // Cache the analysis result
        analysisCache.set(cacheKey, analysis);
        
        return analysis;
    } catch (error) {
        const classifiedError = classifyError(error, {
            operation: 'analyzeStudentPerformance',
            timestamp: Date.now()
        });
        logError(classifiedError);
        const message = getUserFriendlyMessage(classifiedError);
        return message === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.' 
          ? "Maaf, gagal menganalisis data performa saat ini." 
          : message;
    }
}

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";
