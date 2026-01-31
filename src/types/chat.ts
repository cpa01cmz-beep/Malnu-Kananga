export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export type ConversationType = 'direct' | 'group';

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  recipientAvatar?: string;
  messageType: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  status: MessageStatus;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participantIds: string[];
  participants: Participant[];
  lastMessage?: DirectMessage;
  unreadCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  avatar?: string;
  description?: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export interface Participant {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedAt: string;
  lastSeen?: string;
  isOnline: boolean;
  isAdmin?: boolean;
}

export interface ConversationFilter {
  type?: ConversationType;
  search?: string;
  unreadOnly?: boolean;
  archived?: boolean;
}

export interface MessageSendRequest {
  conversationId: string;
  messageType: MessageType;
  content: string;
  file?: File;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationCreateRequest {
  type: ConversationType;
  participantIds: string[];
  name?: string;
  description?: string;
  avatar?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}
