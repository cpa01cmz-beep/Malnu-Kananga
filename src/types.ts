export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
}

// Featured program data structure
export interface FeaturedProgram {
  title: string;
  description: string;
  imageUrl: string;
}

// Latest news data structure
export interface LatestNews {
  title: string;
  date: string;
  category: string;
  imageUrl: string;
}
