import { logger } from '../utils/logger';
import {
  classifyError,
  logError,
  withCircuitBreaker
} from '../utils/errorHandler';
import { ocrCache } from './aiCacheService';

// Initialize the Google AI client
const ai = new (await import("@google/genai")).GoogleGenAI({ 
  apiKey: (import.meta.env.VITE_GEMINI_API_KEY as string) || '' 
});

// Models
const FLASH_MODEL = 'gemini-2.5-flash';

// Generate summary for OCR text
export async function generateTextSummary(
  text: string,
  maxLength: number = 150
): Promise<string> {
  if (!text || text.trim().length === 0) {
    return 'Tidak ada teks untuk dianalisis.';
  }

  try {
    const prompt = `
    Buat ringkasan singkat dan jelas dari teks berikut dalam Bahasa Indonesia.
    
    Ringkasan harus:
    - Maksimal ${maxLength} kata
    - Menangkap poin-poin utama
    - Mudah dipahami
    - Menggunakan bahasa formal yang sopan
    
    Teks:
    ${text}
    
    Ringkasan:
    `;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    
    const responseStream = await withCircuitBreaker(async () => {
      return await ai.models.generateContentStream({
        model: FLASH_MODEL,
        contents,
        config: { systemInstruction: 'Anda adalah asisten yang membuat ringkasan.' }
      });
    });

    let summary = '';
    for await (const chunk of responseStream) {
      summary += chunk.text || '';
    }

    const trimmedSummary = summary.trim();
    
    // Cache the result
    if (trimmedSummary) {
      ocrCache.set({
        operation: 'summary',
        input: text.substring(0, 500),
        context: `maxLength:${maxLength}`,
        thinkingMode: false
      }, trimmedSummary);
    }

    return trimmedSummary || 'Gagal membuat ringkasan.';
  } catch (error) {
    logger.error('Error generating text summary:', error);
    const classifiedError = classifyError(error, {
      operation: 'generateTextSummary',
      timestamp: Date.now()
    });
    logError(classifiedError);
    return 'Terjadi kesalahan saat membuat ringkasan teks.';
  }
}

// Compare texts for plagiarism detection
export async function compareTextsForSimilarity(
  text1: string,
  text2: string,
  threshold: number = 0.8
): Promise<{
  similarity: number;
  isPlagiarized: boolean;
  details: string;
}> {
  if (!text1 || !text2) {
    return { similarity: 0, isPlagiarized: false, details: 'Teks tidak lengkap' };
  }

  try {
    const prompt = `
    Analisis kemiripan dua teks berikut dalam Bahasa Indonesia.
    
    Berikan output dalam format JSON:
    {
      "similarity": 0.0-1.0,
      "isPlagiarized": boolean,
      "details": "penjelasan singkat"
    }
    
    Teks 1:
    ${text1}
    
    Teks 2:
    ${text2}
    
    Analisis:
    `;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    
    const responseStream = await withCircuitBreaker(async () => {
      return await ai.models.generateContentStream({
        model: FLASH_MODEL,
        contents,
        config: { systemInstruction: 'Anda adalah analis kemiripan teks.' }
      });
    });

    let analysis = '';
    for await (const chunk of responseStream) {
      analysis += chunk.text || '';
    }

    try {
      const parsed = JSON.parse(analysis);
      const result = {
        similarity: Math.min(1, Math.max(0, parsed.similarity || 0)),
        isPlagiarized: (parsed.similarity || 0) >= threshold,
        details: parsed.details || 'Tidak ada detail'
      };
      
      // Cache the result
      ocrCache.set({
        operation: 'similarity',
        input: `${text1.substring(0, 200)}|${text2.substring(0, 200)}`,
        context: `threshold:${threshold}`,
        thinkingMode: false
      }, result);
      
      return result;
    } catch {
      // Fallback if JSON parsing fails
      return {
        similarity: 0.3,
        isPlagiarized: false,
        details: 'Gagal menganalisis kemiripan'
      };
    }
  } catch (error) {
    logger.error('Error comparing texts for similarity:', error);
    const classifiedError = classifyError(error, {
      operation: 'compareTextsForSimilarity',
      timestamp: Date.now()
    });
    logError(classifiedError);
    return { similarity: 0, isPlagiarized: false, details: 'Terjadi kesalahan analisis' };
  }
}