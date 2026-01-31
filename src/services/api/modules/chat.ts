// api/modules/chat.ts - Chat/RAG API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const chatAPI = {
  async getContext(message: string): Promise<{ context: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    return response.json();
  },
};
