
import { GoogleGenAI, Type } from "@google/genai";
import type { FeaturedProgram, LatestNews } from '../types';

// Initialize the Google AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const workerUrl = 'https://malnu-api.sulhi-cmz.workers.dev/api/chat';

// This function implements the RAG pattern:
// 1. Fetches relevant context from our Worker (which queries a vector DB).
// 2. Augments the user's prompt with this context.
// 3. Sends the augmented prompt to the Gemini model for a grounded response.
export async function* getAIResponseStream(message: string, history: {role: 'user' | 'model', parts: string}[]): AsyncGenerator<string> {
  let context = "";
  try {
    // 1. Fetch context from the Worker
    const contextResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (contextResponse.ok) {
        const data = await contextResponse.json();
        context = data.context;
    }
  } catch(e) {
      console.error("Failed to fetch context from worker:", e);
      // We can still proceed without context, Gemini will do its best.
  }

  // 2. Augment the user's message with the retrieved context
  const augmentedMessage = context 
    ? `Berdasarkan konteks berikut:\n---\n${context}\n---\n\nJawab pertanyaan ini: ${message}`
    : message;

  // System instruction for the model
  const systemInstruction = `Anda adalah 'Asisten MA Malnu Kananga', chatbot AI yang ramah, sopan, dan sangat membantu, berbicara dalam Bahasa Indonesia. Tugas Anda adalah menjawab pertanyaan tentang sekolah MA Malnu Kananga berdasarkan konteks yang diberikan dari website sekolah. Jika konteks tidak cukup untuk menjawab, katakan Anda tidak memiliki informasi tersebut dan sarankan untuk menghubungi pihak sekolah. JANGAN menjawab pertanyaan di luar topik sekolah.`;
  
  // Format history for the Gemini API
  const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
      { role: 'user', parts: [{ text: augmentedMessage }] }
  ];

  try {
    // 3. Call the Gemini API with the augmented prompt and history
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction,
        }
    });

    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
      console.error("Error calling Gemini API:", error);
      yield "Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.";
  }
}

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";


// New function for the AI Site Editor
export async function getAIEditorResponse(prompt: string, currentContent: { featuredPrograms: FeaturedProgram[], latestNews: LatestNews[] }): Promise<any> {
    const systemInstruction = `You are a helpful website content editor. The user will provide a request to modify the website's content. You must analyze the request and return the FULL updated content structure as a valid JSON object. Do not add any commentary or markdown formatting. Only output the JSON. The user request might be in Indonesian.`;
    
    const fullPrompt = `Here is the current website content:\n${JSON.stringify(currentContent, null, 2)}\n\nUser request: "${prompt}"\n\nPlease provide the complete and updated JSON object based on this request.`;
    
    const contentSchema = {
        type: Type.OBJECT,
        properties: {
            featuredPrograms: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        imageUrl: { type: Type.STRING }
                    },
                    required: ["title", "description", "imageUrl"]
                }
            },
            latestNews: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        date: { type: Type.STRING },
                        category: { type: Type.STRING },
                        imageUrl: { type: Type.STRING }
                    },
                    required: ["title", "date", "category", "imageUrl"]
                }
            }
        },
        required: ["featuredPrograms", "latestNews"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: contentSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting AI editor response:", error);
        throw new Error("Gagal mendapatkan respons dari AI editor. Silakan coba lagi.");
    }
}
