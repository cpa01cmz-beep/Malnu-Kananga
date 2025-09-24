export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
}

// FIX: Added FeaturedProgram interface to resolve import error.
export interface FeaturedProgram {
  title: string;
  description: string;
  imageUrl: string;
}

// FIX: Added LatestNews interface to resolve import error.
export interface LatestNews {
  title: string;
  date: string;
  category: string;
  imageUrl: string;
}
