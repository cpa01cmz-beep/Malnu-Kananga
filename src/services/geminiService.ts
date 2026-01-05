
// FIX: Import `Type` for JSON schema definition.
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import content types for the AI editor function.
import type { FeaturedProgram, LatestNews } from '../types';
import { WORKER_CHAT_ENDPOINT } from '../config';

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
      console.warn("RAG fetch failed, proceeding with local context only:", e);
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
    const responseStream = await ai.models.generateContentStream({
        model: model,
        contents,
        config
    });

    for await (const chunk of responseStream) {
      yield chunk.text || '';
    }
  } catch (error) {
      console.error("Error calling Gemini API:", error);
      yield "Maaf, sistem AI sedang sibuk atau mengalami gangguan. Silakan coba sesaat lagi.";
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
        const response = await ai.models.generateContent({
            model: PRO_THINKING_MODEL,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text || "Gagal melakukan analisis.";
    } catch (e) {
        console.error("Analysis failed", e);
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
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                thinkingConfig: { thinkingBudget: 32768 } // Use thinking for precise JSON editing
            },
        });
        
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
        console.error("Error calling Gemini API for content editing:", error);
        throw new Error("Gagal memproses respon dari AI. Mohon coba instruksi yang lebih spesifik.");
    }
}

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";

interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
}

export async function generateFlashCardsAI(topic: string, subject: string, count: number = 10): Promise<FlashCard[]> {
  const prompt = `
Buat ${count} flash cards edukatif untuk topik "${topic}" dalam mata pelajaran ${subject}.
Format response harus JSON array dengan struktur berikut:
[
  {
    "id": "string",
    "front": "string (pertanyaan/konsep singkat)",
    "back": "string (jawaban/penjelasan detail)",
    "category": "string",
    "difficulty": "easy" | "medium" | "hard"
  }
]

PENTING:
- Gunakan Bahasa Indonesia
- Pastikan front adalah pertanyaan yang jelas dan ringkas
- Pastikan back memberikan penjelasan yang komprehensif
- Sesuaikan tingkat kesulitan dengan level siswa SMA
- Beri variasi difficulty (sekitar 30% easy, 50% medium, 20% hard)
`;

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah ahli pendidikan yang membuat flash cards edukatif untuk siswa SMA.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
          },
        },
      },
    });

    const jsonText = (response.text || '').trim();
    const firstBracket = jsonText.indexOf('[');
    const lastBracket = jsonText.lastIndexOf(']');
    let cleanedJsonText = jsonText;
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanedJsonText = jsonText.substring(firstBracket, lastBracket + 1);
    }

    return JSON.parse(cleanedJsonText);
  } catch (error) {
    console.error("Error generating flash cards:", error);
    throw new Error("Gagal membuat flash cards. Silakan coba lagi.");
  }
}

export async function generateQuizAI(
  topic: string,
  subject: string,
  questionCount: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<QuizData> {
  const prompt = `
Buat kuis pilihan ganda untuk topik "${topic}" dalam mata pelajaran ${subject} dengan ${questionCount} soal tingkat ${difficulty}.

Format response harus JSON dengan struktur:
{
  "id": "string",
  "title": "string (judul kuis yang menarik)",
  "subject": "string",
  "topic": "string",
  "difficulty": "easy" | "medium" | "hard",
  "questions": [
    {
      "id": "string",
      "question": "string (soal yang jelas)",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": number (0-3, index jawaban benar),
      "explanation": "string (penjelasan mengapa jawaban tersebut benar)"
    }
  ]
}

PENTING:
- Gunakan Bahasa Indonesia
- Pastikan opsi jawaban jelas dan tidak ambigu
- Berikan penjelasan yang edukatif
- Sesuaikan tingkat kesulitan sesuai parameter
- Pastikan correctAnswer adalah index (0-3) dari array options
`;

  try {
    const response = await ai.models.generateContent({
      model: PRO_THINKING_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah ahli pendidikan yang membuat kuis edukatif berkualitas untuk siswa SMA.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const jsonText = (response.text || '').trim();
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    let cleanedJsonText = jsonText;
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedJsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanedJsonText);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Gagal membuat kuis. Silakan coba lagi.");
  }
}

export async function explainConceptAI(topic: string, concept: string, context?: string): Promise<string> {
  const prompt = `
Jelaskan konsep "${concept}" dalam topik ${topic} untuk siswa SMA dengan cara yang mudah dipahami.

${context ? `Konteks tambahan: ${context}` : ''}

Berikan penjelasan dengan format:
1. Definisi singkat
2. Penjelasan detail dengan contoh konkret
3. Pentingnya dalam kehidupan nyata
4. Tips untuk mengingat konsep ini

Gunakan Bahasa Indonesia yang sopan dan edukatif.
`;

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah tutor AI yang sabar dan dapat menjelaskan konsep kompleks dengan cara sederhana.",
      },
    });

    return response.text || "Maaf, gagal menjelaskan konsep saat ini.";
  } catch (error) {
    console.error("Error explaining concept:", error);
    throw new Error("Gagal menjelaskan konsep. Silakan coba lagi.");
  }
}
