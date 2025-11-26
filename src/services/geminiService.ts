// Import Google AI SDK and content types
import { GoogleGenAI } from "@google/genai";
import { MemoryBank } from '../memory';
import { API_KEY, WORKER_URL } from '../utils/envValidation';

// Initialize the Google AI client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const workerUrl = `${WORKER_URL}/api/chat`;

// Initialize memory bank for conversation history
let memoryBank: MemoryBank | null = null;

// Initialize memory bank asynchronously
const initializeMemoryBank = async () => {
  if (!memoryBank) {
    const { schoolMemoryBankConfig } = await import('../memory/config');
    const config = await schoolMemoryBankConfig();
    memoryBank = new MemoryBank(config);
  }
  return memoryBank;
};

// This function implements the RAG pattern:
// 1. Fetches relevant context from our Worker (which queries a vector DB).
// 2. Augments the user's prompt with this context.
// 3. Sends the augmented prompt to the Gemini model for a grounded response.
// 4. Stores conversation in memory bank for future context.
export async function* getAIResponseStream(message: string, history: {role: 'user' | 'model', parts: string}[]): AsyncGenerator<string> {
  // Ensure memory bank is initialized
  await initializeMemoryBank();
  
  let context = "";

  try {
    // 1. Fetch relevant context from our Worker (which queries a vector DB).
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Worker response not ok: ${response.status}`);
    }

    const data = await response.json();
    context = data.context || "";
  } catch (error) {
    console.warn('Failed to fetch context from worker:', error);
    // Continue without context if worker is unavailable
  }

  // 2. Get additional context from memory bank
  let memoryContext = "";
  try {
    if (memoryBank) {
      const relevantMemories = await memoryBank.getRelevantMemories(message, 3);
      if (relevantMemories.length > 0) {
        memoryContext = relevantMemories.map(m => m.content).join('\n---\n');
      }
    }
  } catch (error) {
    console.warn('Failed to get memory context:', error);
  }

  // 3. Augment the user's message with the retrieved context
  let augmentedMessage = message;

  if (context && memoryContext) {
    augmentedMessage = `Berdasarkan konteks dari website sekolah:\n---\n${context}\n---\n\nDan konteks percakapan sebelumnya:\n---\n${memoryContext}\n---\n\nJawab pertanyaan ini: ${message}`;
  } else if (context) {
    augmentedMessage = `Berdasarkan konteks berikut:\n---\n${context}\n---\n\nJawab pertanyaan ini: ${message}`;
  } else if (memoryContext) {
    augmentedMessage = `Berdasarkan konteks percakapan sebelumnya:\n---\n${memoryContext}\n---\n\nJawab pertanyaan ini: ${message}`;
  }

  // System instruction for the model
  const systemInstruction = `Anda adalah 'Asisten MA Malnu Kananga', chatbot AI yang ramah, sopan, dan sangat membantu, berbicara dalam Bahasa Indonesia. Tugas Anda adalah menjawab pertanyaan tentang sekolah MA Malnu Kananga berdasarkan konteks yang diberikan dari website sekolah. Jika konteks tidak cukup untuk menjawab, katakan Anda tidak memiliki informasi tersebut dan sarankan untuk menghubungi pihak sekolah. JANGAN menjawab pertanyaan di luar topik sekolah.`;
  
  // Format history for the Gemini API
  const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
      { role: 'user', parts: [{ text: augmentedMessage }] }
  ];

  let fullResponse = "";

  try {
    // 3. Call the Gemini API with the augmented prompt and history
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction: systemInstruction!,
        }
    });

    for await (const chunk of responseStream) {
      fullResponse += chunk.text || '';
      yield chunk.text || '';
    }

    // 4. Store conversation in memory bank for future context
    try {
      if (memoryBank) {
        await memoryBank.addMemory(
          `Pertanyaan: ${message}\nJawaban: ${fullResponse}`,
          'conversation',
          {
            type: 'user_ai_interaction',
            userMessage: message,
            aiResponse: fullResponse,
            timestamp: new Date().toISOString(),
            contextUsed: !!context,
            memoryContextUsed: !!memoryContext
          }
        );
      }
    } catch (memoryError) {
      console.warn('Failed to store conversation in memory bank:', memoryError);
    }

  } catch (error) {
      yield "Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.";

      // Store failed interaction in memory bank
      try {
        if (memoryBank) {
          await memoryBank.addMemory(
            `Pertanyaan: ${message}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'conversation',
            {
              type: 'failed_interaction',
              userMessage: message,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          );
        }
      } catch (memoryError) {
        console.warn('Failed to store error in memory bank:', memoryError);
      }
    }
  }

// Memory bank utility functions
export async function getConversationHistory(limit = 10) {
  try {
    if (!memoryBank) return [];
    return await memoryBank.searchMemories({
      type: 'conversation',
      limit,
    });
  } catch (error) {
    // Silently handle error in test environment
    if (process.env.NODE_ENV === 'test') {
      return [];
    }
    console.error('Failed to get conversation history:', error);
    return [];
  }
}

export async function clearConversationHistory() {
  try {
    if (!memoryBank) return 0;
    const conversations = await memoryBank.searchMemories({
      type: 'conversation',
    });

    // Handle case where searchMemories returns undefined or null
    if (!conversations || !Array.isArray(conversations)) {
      return 0;
    }

    // Delete each conversation
    for (const conversation of conversations) {
      await memoryBank.deleteMemory(conversation.id);
    }

    return conversations.length;
  } catch (error) {
    // Silently handle error in test environment
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    console.error('Failed to clear conversation history:', error);
    return 0;
  }
}

export async function getMemoryStats() {
  try {
    if (!memoryBank) return null;
    return await memoryBank.getStats();
  } catch (error) {
    // Silently handle error in test environment
    if (process.env.NODE_ENV === 'test') {
      return null;
    }
    console.error('Failed to get memory stats:', error);
    return null;
  }
}

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";