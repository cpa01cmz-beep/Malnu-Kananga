
// FIX: Import `Type` for JSON schema definition.
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import content types for the AI editor function.
import type { FeaturedProgram, LatestNews } from '../types';
import { WORKER_CHAT_ENDPOINT } from '../config';
import { geminiErrorHandler, GeminiError } from '../utils/geminiErrorHandler';

// Initialize the Google AI client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

// Models
const FLASH_MODEL = 'gemini-2.5-flash';
const PRO_THINKING_MODEL = 'gemini-3-pro-preview';

// Local Context Interface
interface LocalContext {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
}

// This function implements the RAG pattern with optional Thinking Mode with enhanced error recovery
export async function* getAIResponseStream(
    message: string, 
    history: {role: 'user' | 'model', parts: string}[],
    localContext?: LocalContext,
    useThinkingMode: boolean = false // Toggle for Gemini 3 Pro with Thinking
): AsyncGenerator<string> {
  let ragContext = "";
  
  // 1. Fetch RAG context from the Worker with retry
  try {
    const contextResponse = await geminiErrorHandler.executeWithRetry(
      () => fetch(WORKER_CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }),
      { operation: 'rag_context_fetch' }
    );
    
    if (contextResponse.ok) {
      const data = await contextResponse.json();
      ragContext = data.context || "";
    }
  } catch (error) {
    console.warn("RAG fetch failed, proceeding with local context only:", error);
    // Continue without RAG context - this is not a fatal error
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
    const responseStream = await geminiErrorHandler.executeWithRetry(
      () => ai.models.generateContentStream({
        model: model,
        contents,
        config
      }),
      { model, useThinkingMode, operation: 'chat_stream' }
    );

    for await (const chunk of responseStream) {
      yield chunk.text || '';
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    if (error instanceof GeminiError) {
      yield error.errorInfo.userMessage;
    } else {
      yield "Maaf, sistem AI sedang sibuk atau mengalami gangguan. Silakan coba sesaat lagi.";
    }
  }
}

// Function to analyze Teacher Grading Data (Uses Gemini 3 Pro) with enhanced error recovery
export async function analyzeClassPerformance(grades: { studentName: string; subject: string; grade: string; semester: string }[]): Promise<string> {
    const prompt = `
    Analyze the following student grade data for a specific class subject. 
    Provide a pedagogical analysis including:
    1. Overall class performance summary.
    2. Identification of students who need remedial help (Grade C or D).
    3. Specific suggestions for the teacher to improve learning outcomes for this group.
    
    Data: ${JSON.stringify(grades)}
    `;

    const executeAnalysis = async (model: string) => {
        return await geminiErrorHandler.executeWithRetry(
            () => ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            }),
            { model, useThinkingMode: true, operation: 'grade_analysis' }
        );
    };

    try {
        let currentModel = PRO_THINKING_MODEL;
        let lastError: Error | null = null;

        // Try with fallback models if needed
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await executeAnalysis(currentModel);
                return response.text || "Gagal melakukan analisis.";
            } catch (error) {
                lastError = error as Error;
                
                if (error instanceof GeminiError && error.errorInfo.retryable) {
                    currentModel = geminiErrorHandler.getFallbackModel(currentModel);
                    console.warn(`Retrying grade analysis with fallback model: ${currentModel}`);
                    continue;
                }
                
                throw error;
            }
        }

        throw lastError || new Error("Analysis failed after all retries");
    } catch (error) {
        console.error("Analysis failed", error);
        
        if (error instanceof GeminiError) {
            return error.errorInfo.userMessage;
        }
        
        return "Maaf, gagal menganalisis data saat ini.";
    }
}

// Function to handle content editing requests
export async function getAIEditorResponse(
    prompt: string,
    currentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }
): Promise<{ featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }> {
    
    // Upgraded to Gemini 3 Pro for better JSON adherence and logic
    const model = PRO_THINKING_MODEL; 

    const systemInstruction = `You are an intelligent website content editor. Your task is to modify the provided JSON data based on the user's instruction.
- You must only add, remove, or modify entries in the JSON.
- Do not change the overall JSON structure.
- **CRITICAL IMAGE RULE**: 
  - If the user asks for a new item and does NOT provide an image URL, use this placeholder format: "https://placehold.co/600x400?text=Category+Name" (replace 'Category+Name' with the relevant topic). 
  - Do NOT invent or hallucinate 'unsplash.com' URLs.
  - If modifying text but not the image, KEEP the existing 'imageUrl' exactly as is.
- Ensure your response is only the modified JSON data.`;

    const fullPrompt = `Here is the current website content in JSON format:
\`\`\`json
${JSON.stringify(currentContent, null, 2)}
\`\`\`

Here is the user's request: "${prompt}"

Please provide the updated JSON content.`;

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
        const executeEdit = async (model: string) => {
            return await geminiErrorHandler.executeWithRetry(
                () => ai.models.generateContent({
                    model,
                    contents: fullPrompt,
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        thinkingConfig: { thinkingBudget: 32768 } // Use thinking for precise JSON editing
                    },
                }),
                { model, useThinkingMode: true, operation: 'content_editing' }
            );
        };

        let currentModel = model;
        let lastError: Error | null = null;

        // Try with fallback models if needed
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await executeEdit(currentModel);
                
                const jsonText = (response.text || '').trim();
                // Basic cleanup just in case
                const firstBrace = jsonText.indexOf('{');
                const lastBrace = jsonText.lastIndexOf('}');
                let cleanedJsonText = jsonText;
                if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanedJsonText = jsonText.substring(firstBrace, lastBrace + 1);
                }

                return JSON.parse(cleanedJsonText);
            } catch (error) {
                lastError = error as Error;
                
                if (error instanceof GeminiError && error.errorInfo.retryable) {
                    currentModel = geminiErrorHandler.getFallbackModel(currentModel);
                    console.warn(`Retrying content editing with fallback model: ${currentModel}`);
                    continue;
                }
                
                throw error;
            }
        }

        throw lastError || new Error("Content editing failed after all retries");
    } catch (error) {
        console.error("Error calling Gemini API for content editing:", error);
        
        if (error instanceof GeminiError) {
            throw new Error(error.errorInfo.userMessage);
        }
        
        throw new Error("Gagal memproses respon dari AI. Mohon coba instruksi yang lebih spesifik.");
    }
}

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";

// Health check function for Gemini API
export async function checkGeminiHealth() {
    return await geminiErrorHandler.healthCheck();
}

// Export error handler for use in components
export { geminiErrorHandler, GeminiError, getUserFriendlyMessage } from '../utils/geminiErrorHandler';
