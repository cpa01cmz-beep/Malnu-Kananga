// api/modules/chat.ts - Chat/RAG API

import { API_ENDPOINTS } from '../../../constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const chatAPI = {
  async getContext(message: string): Promise<{ context: string }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AI.CHAT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    return response.json();
  },
};
