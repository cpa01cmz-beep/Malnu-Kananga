// api/modules/chat.ts - Chat/RAG API

import { HTTP } from '../../../constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const chatAPI = {
  async getContext(message: string): Promise<{ context: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: HTTP.METHODS.POST,
      headers: { 'Content-Type': HTTP.HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({ message }),
    });

    return response.json();
  },
};
