// Import Google AI SDK and content types
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
      yield "Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.";
  }
}

// Handle content editing requests from SiteEditor component
export async function getAIEditorResponse(
    prompt: string,
    currentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }
): Promise<{ featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }> {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an intelligent website content editor. Your task is to modify the provided JSON data based on the user's instruction.
- You must only add, remove, or modify entries in the JSON.
- Do not change the overall JSON structure.
- For image URLs, if the user asks for a new item but does not provide an image, you can use an appropriate placeholder image URL from unsplash.com.
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
        const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
        const newContent = JSON.parse(cleanedJsonText);
        
        return newContent;
    } catch (error) {
        throw new Error("Failed to get a valid response from the AI editor. Please try again.");
    }
}


export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";