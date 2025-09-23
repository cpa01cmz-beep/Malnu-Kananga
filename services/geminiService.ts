// This service now connects to a REAL Cloudflare Worker AI endpoint.

// This function calls our Worker backend that implements RAG
// with Vectorize and a Large Language Model.
export async function* getAIResponseStream(message: string, history: {role: 'user' | 'model', parts: string}[]): AsyncGenerator<string> {
  const workerUrl = 'https://malnu-api.sulhi-cmz.workers.dev/api/chat';

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history
    }),
  });

  if (!response.body) {
    throw new Error('ReadableStream not available');
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    yield decoder.decode(value);
  }
}

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";