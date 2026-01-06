
import { GoogleGenAI, Type } from "@google/genai";
import type { FeaturedProgram, LatestNews } from '../types';
import { WORKER_CHAT_ENDPOINT } from '../config';
import {
  classifyError,
  logError,
  getUserFriendlyMessage,
  withCircuitBreaker
} from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { validateAICommand, validateAIResponse } from '../utils/aiEditorValidator';

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

    for await (const chunk of responseStream) {
      yield chunk.text || '';
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
        return response.text || "Gagal melakukan analisis.";
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
    
const commandValidation = validateAICommand(prompt);
    if (!commandValidation.isValid) {
        throw new Error(commandValidation.error);
    }

    const sanitizedPrompt = commandValidation.sanitizedPrompt || prompt;

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
        
        const responseValidation = validateAIResponse(jsonText);
        if (!responseValidation.isValid) {
            throw new Error(responseValidation.error);
        }

        return responseValidation.sanitizedContent!;
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

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";
