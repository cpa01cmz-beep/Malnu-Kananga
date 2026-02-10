import type { USER_ROLES, USER_EXTRA_ROLES } from '../constants';

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserExtraRole = typeof USER_EXTRA_ROLES[keyof typeof USER_EXTRA_ROLES] | null;

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
