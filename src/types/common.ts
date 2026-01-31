export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export type UserExtraRole = 'staff' | 'osis' | 'wakasek' | 'kepsek' | null;

export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
}

export interface FeaturedProgram {
  title: string;
  description: string;
  imageUrl: string;
}

export interface LatestNews {
  title: string;
  date: string;
  category: string;
  imageUrl: string;
}
