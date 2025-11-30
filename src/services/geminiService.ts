
// FIX: Import `Type` for JSON schema definition.
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import content types for the AI editor function.
import type { FeaturedProgram, LatestNews } from '../types';
import { WORKER_CHAT_ENDPOINT } from '../config';

// Initialize the Google AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Local Context Interface
interface LocalContext {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
}

// This function implements the RAG pattern:
// 1. Fetches relevant context from our Worker (which queries a vector DB).
// 2. Augments the user's prompt with this context.
// 3. Sends the augmented prompt to the Gemini model for a grounded response.
export async function* getAIResponseStream(
    message: string, 
    history: {role: 'user' | 'model', parts: string}[],
    localContext?: LocalContext // NEW: Accept current app state
): AsyncGenerator<string> {
  let context = "";
  try {
    // 1. Fetch context from the Worker
    const contextResponse = await fetch(WORKER_CHAT_ENDPOINT, {
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

  // 2. Prepare Dynamic Context from Local State (Editor Changes)
  let dynamicContextString = "";
  if (localContext) {
      dynamicContextString = `
INFORMASI TERKINI DARI WEBSITE (Prioritas Utama):
Berikut adalah data Program Unggulan dan Berita Terbaru yang SEDANG TAYANG di website saat ini. Gunakan informasi ini sebagai kebenaran mutlak jika bertentangan dengan konteks lain.

[Daftar Program Unggulan]
${localContext.featuredPrograms.map(p => `- ${p.title}: ${p.description}`).join('\n')}

[Berita Terbaru]
${localContext.latestNews.map(n => `- (${n.date}) [${n.category}] ${n.title}`).join('\n')}
`;
  }

  // 3. Augment the user's message with the retrieved context
  const augmentedMessage = `
${dynamicContextString}

KONTEKS TAMBAHAN DARI DATABASE (RAG):
---\n${context}\n---

PERTANYAAN PENGGUNA: 
${message}`;

  // System instruction for the model
  const systemInstruction = `Anda adalah 'Asisten MA Malnu Kananga', chatbot AI yang ramah, sopan, dan sangat membantu, berbicara dalam Bahasa Indonesia. 
  
  ATURAN UTAMA:
  1. Jawab pertanyaan tentang sekolah MA Malnu Kananga.
  2. Prioritaskan "INFORMASI TERKINI DARI WEBSITE" yang diberikan di atas. Itu adalah data real-time.
  3. Gunakan "KONTEKS TAMBAHAN" untuk informasi sejarah atau umum.
  4. Jika informasi tidak ada di keduanya, katakan tidak tahu dan sarankan hubungi sekolah.
  5. Gunakan format Markdown (Bold, List) untuk jawaban yang rapi.`;
  
  // Format history for the Gemini API
  const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
      { role: 'user', parts: [{ text: augmentedMessage }] }
  ];

  try {
    // 4. Call the Gemini API with the augmented prompt and history
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

// FIX: Added getAIEditorResponse function to handle content editing requests from SiteEditor.tsx.
export async function getAIEditorResponse(
    prompt: string,
    currentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }
): Promise<{ featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }> {
    const model = 'gemini-2.5-flash';

    // Improved system instruction to prevent broken images
    const systemInstruction = `You are an intelligent website content editor. Your task is to modify the provided JSON data based on the user's instruction.
- You must only add, remove, or modify entries in the JSON.
- Do not change the overall JSON structure.
- **CRITICAL IMAGE RULE**: 
  - If the user asks for a new item and does NOT provide an image URL, use this placeholder format: "https://placehold.co/600x400?text=Category+Name" (replace 'Category+Name' with the relevant topic, e.g., 'Robotics', 'Sports'). 
  - Do NOT invent or hallucinate 'unsplash.com' URLs, as they often break.
  - If modifying text but not the image, KEEP the existing 'imageUrl' exactly as is.
- Ensure your response is only the modified JSON data, adhering to the provided schema.`;

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
                description: 'List of featured school programs.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'The title of the program.' },
                        description: { type: Type.STRING, description: 'A short description of the program.' },
                        imageUrl: { type: Type.STRING, description: 'URL for the program image.' },
                    },
                },
            },
            latestNews: {
                type: Type.ARRAY,
                description: 'List of latest news articles.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'The headline of the news article.' },
                        date: { type: Type.STRING, description: 'The publication date of the news.' },
                        category: { type: Type.STRING, description: 'The category of the news (e.g., Prestasi, Sekolah).' },
                        imageUrl: { type: Type.STRING, description: 'URL for the news image.' },
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
            },
        });
        
        const jsonText = response.text.trim();
        
        // ROBUST JSON EXTRACTION:
        // Finds the first '{' and the last '}' to extract the JSON object,
        // ignoring any conversational text or markdown formatting before/after.
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        
        let cleanedJsonText = jsonText;
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanedJsonText = jsonText.substring(firstBrace, lastBrace + 1);
        }

        const newContent = JSON.parse(cleanedJsonText);
        
        return newContent;
    } catch (error) {
        console.error("Error calling Gemini API for content editing:", error);
        throw new Error("Gagal memproses respon dari AI. Mohon coba instruksi yang lebih spesifik.");
    }
}


export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";
