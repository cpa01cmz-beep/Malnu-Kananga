/**
 * Parent-Teacher Live Chat Service
 * Handles real-time messaging with typing indicators, read receipts, and reactions
 * Milestone 3.0 - Real-Time Collaboration
 */

import { ChatMessage, Conversation, ConversationParticipant, PresenceUpdateEvent, MessageReaction } from '../types/realtime.types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Live Chat Service
 * Manages real-time messaging between users
 */
class LiveChatService {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map(); // conversationId -> messages
  private typingIndicators: Map<string, Set<string>> = new Map(); // conversationId -> userIds
  private subscribers: Map<string, Set<(event: ChatEvent) => void>> = new Map();
  private presence: Map<string, PresenceUpdateEvent> = new Map(); // userId -> presence

  // Configuration
  private readonly config = {
    messageRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
    messageHistoryLimit: 100,
    typingIndicatorTimeout: 3000, // 3 seconds
    presenceUpdateInterval: 30000, // 30 seconds
    offlineThreshold: 60 * 1000, // 1 minute
  };

  // Timers for typing indicators
  private typingTimers: Map<string, Map<string, ReturnType<typeof setTimeout>>> = new Map();

  /**
   * Create a new conversation
   */
  async createConversation(
    type: Conversation['type'],
    participants: ConversationParticipant[],
    metadata?: Record<string, unknown>
  ): Promise<Conversation> {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const conversation: Conversation = {
      id: conversationId,
      type,
      participants,
      unreadCount: 0,
      lastActivity: Date.now(),
      metadata,
    };

    this.conversations.set(conversationId, conversation);
    this.messages.set(conversationId, []);
    this.typingIndicators.set(conversationId, new Set());

    await this.persistConversation(conversationId);

    // Notify participants
    participants.forEach(p => {
      const userId = p.userId;
      this.notifyUser(userId, {
        type: 'conversation_created',
        conversationId,
        timestamp: Date.now(),
        data: conversation,
      });
    });

    logger.info('Conversation created', {
      conversationId,
      type,
      participantCount: participants.length,
    });

    return conversation;
  }

  /**
   * Get a conversation by ID
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Get all conversations for a user
   */
  getUserConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.participants.some(p => p.userId === userId))
      .sort((a, b) => b.lastActivity - a.lastActivity);
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    fromUserId: string,
    content: string,
    type: ChatMessage['type'] = 'text',
    attachments?: ChatMessage['attachments']
  ): Promise<ChatMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Verify sender is a participant
    const sender = conversation.participants.find(p => p.userId === fromUserId);
    if (!sender) {
      throw new Error(`User ${fromUserId} is not a participant in conversation ${conversationId}`);
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      fromUserId,
      content,
      type,
      attachments,
      timestamp: Date.now(),
      isRead: false,
      readBy: [fromUserId], // Sender has read their own message
      reactions: [],
      isEdited: false,
    };

    // Add to messages
    const messages = this.messages.get(conversationId) || [];
    messages.push(message);

    // Prune old messages
    this.pruneMessages(messages);

    // Update conversation
    conversation.lastMessage = message;
    conversation.lastActivity = Date.now();

    // Update unread count for other participants
    conversation.participants.forEach(p => {
      if (p.userId !== fromUserId) {
        conversation.unreadCount += 1;
      }
    });

    // Persist
    await this.persistConversation(conversationId);
    await this.persistMessages(conversationId);

    // Notify all participants
    conversation.participants.forEach(p => {
      const unread = p.userId === fromUserId ? 0 : conversation.unreadCount;
      this.notifyUser(p.userId, {
        type: 'message_received',
        conversationId,
        timestamp: Date.now(),
        data: message,
        unread,
      });
    });

    logger.info('Message sent', {
      messageId: message.id,
      conversationId,
      fromUserId,
      type,
    });

    return message;
  }

  /**
   * Edit a message
   */
  async editMessage(conversationId: string, messageId: string, newContent: string, userId: string): Promise<ChatMessage> {
    const messages = this.messages.get(conversationId);
    if (!messages) {
      throw new Error(`Messages not found for conversation: ${conversationId}`);
    }

    const message = messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error(`Message not found: ${messageId}`);
    }

    // Verify ownership
    if (message.fromUserId !== userId) {
      throw new Error(`User ${userId} is not the author of message ${messageId}`);
    }

    // Update message
    message.content = newContent;
    message.isEdited = true;
    message.editedAt = Date.now();

    // Persist
    await this.persistMessages(conversationId);

    // Notify all participants
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.participants.forEach(p => {
        this.notifyUser(p.userId, {
          type: 'message_edited',
          conversationId,
          timestamp: Date.now(),
          data: message,
        });
      });
    }

    logger.info('Message edited', { messageId, conversationId, userId });

    return message;
  }

  /**
   * Delete a message
   */
  async deleteMessage(conversationId: string, messageId: string, userId: string): Promise<void> {
    const messages = this.messages.get(conversationId);
    if (!messages) {
      throw new Error(`Messages not found for conversation: ${conversationId}`);
    }

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      throw new Error(`Message not found: ${messageId}`);
    }

    const message = messages[messageIndex];

    // Verify ownership
    if (message.fromUserId !== userId) {
      throw new Error(`User ${userId} is not the author of message ${messageId}`);
    }

    // Remove message
    messages.splice(messageIndex, 1);

    // Persist
    await this.persistMessages(conversationId);

    // Notify all participants
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.participants.forEach(p => {
        this.notifyUser(p.userId, {
          type: 'message_deleted',
          conversationId,
          timestamp: Date.now(),
          data: { messageId },
        });
      });
    }

    logger.info('Message deleted', { messageId, conversationId, userId });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return;
    }

    const messages = this.messages.get(conversationId) || [];
    const unreadMessages = messages.filter(m => !m.isRead && m.fromUserId !== userId);

    // Mark messages as read
    unreadMessages.forEach(m => {
      m.isRead = true;
      m.readBy = [...(m.readBy || []), userId];
    });

    // Reset unread count for this user
    const participant = conversation.participants.find(p => p.userId === userId);
    if (participant) {
      participant.lastRead = Date.now();
    }

    // Persist
    await this.persistMessages(conversationId);
    await this.persistConversation(conversationId);

    // Notify the sender(s) of messages that were read
    unreadMessages.forEach(m => {
      this.notifyUser(m.fromUserId, {
        type: 'message_read',
        conversationId,
        timestamp: Date.now(),
        data: { messageId: m.id, readBy: userId },
      });
    });

    logger.info('Messages marked as read', { conversationId, userId, count: unreadMessages.length });
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string, limit?: number, before?: string): ChatMessage[] {
    let messages = this.messages.get(conversationId) || [];

    // Filter by timestamp if before provided
    if (before) {
      const beforeMessage = messages.find(m => m.id === before);
      if (beforeMessage) {
        messages = messages.filter(m => m.timestamp < beforeMessage.timestamp);
      }
    }

    // Sort by timestamp (newest last)
    messages = messages.sort((a, b) => a.timestamp - b.timestamp);

    // Apply limit
    if (limit && limit > 0) {
      messages = messages.slice(-limit);
    }

    return messages;
  }

  /**
   * Add reaction to a message
   */
  async addReaction(conversationId: string, messageId: string, emoji: string, userId: string): Promise<MessageReaction> {
    const messages = this.messages.get(conversationId);
    if (!messages) {
      throw new Error(`Messages not found for conversation: ${conversationId}`);
    }

    const message = messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error(`Message not found: ${messageId}`);
    }

    // Remove existing reaction from same user (if any)
    message.reactions = (message.reactions || []).filter(r => r.userId !== userId);

    // Add new reaction
    const reaction: MessageReaction = {
      emoji,
      userId,
      timestamp: Date.now(),
    };
    message.reactions.push(reaction);

    // Persist
    await this.persistMessages(conversationId);

    // Notify all participants
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.participants.forEach(p => {
        this.notifyUser(p.userId, {
          type: 'reaction_added',
          conversationId,
          timestamp: Date.now(),
          data: { messageId, reaction },
        });
      });
    }

    logger.info('Reaction added', { messageId, emoji, userId });

    return reaction;
  }

  /**
   * Remove reaction from a message
   */
  async removeReaction(conversationId: string, messageId: string, userId: string): Promise<void> {
    const messages = this.messages.get(conversationId);
    if (!messages) {
      return;
    }

    const message = messages.find(m => m.id === messageId);
    if (!message) {
      return;
    }

    // Remove reaction
    message.reactions = (message.reactions || []).filter(r => r.userId !== userId);

    // Persist
    await this.persistMessages(conversationId);

    // Notify all participants
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.participants.forEach(p => {
        this.notifyUser(p.userId, {
          type: 'reaction_removed',
          conversationId,
          timestamp: Date.now(),
          data: { messageId, userId },
        });
      });
    }

    logger.info('Reaction removed', { messageId, userId });
  }

  /**
   * Set typing indicator
   */
  setTyping(conversationId: string, userId: string, isTyping: boolean): void {
    const typingSet = this.typingIndicators.get(conversationId);
    if (!typingSet) {
      return;
    }

    if (isTyping) {
      typingSet.add(userId);

      // Clear existing timer for this user
      const userTimers = this.typingTimers.get(conversationId);
      if (userTimers?.has(userId)) {
        clearTimeout(userTimers.get(userId)!);
      }

      // Set new timer
      if (!this.typingTimers.has(conversationId)) {
        this.typingTimers.set(conversationId, new Map());
      }

      const timer = setTimeout(() => {
        this.setTyping(conversationId, userId, false);
      }, this.config.typingIndicatorTimeout);

      this.typingTimers.get(conversationId)!.set(userId, timer);
    } else {
      typingSet.delete(userId);
    }

    // Notify other participants
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.participants.forEach(p => {
        if (p.userId !== userId) {
          this.notifyUser(p.userId, {
            type: 'typing_indicator',
            conversationId,
            timestamp: Date.now(),
            data: { userId, isTyping },
          });
        }
      });
    }
  }

  /**
   * Get typing users for a conversation
   */
  getTypingUsers(conversationId: string): string[] {
    return Array.from(this.typingIndicators.get(conversationId) || []);
  }

  /**
   * Update presence
   */
  async updatePresence(userId: string, presence: PresenceUpdateEvent['presence'], status?: string): Promise<void> {
    const event: PresenceUpdateEvent = {
      userId,
      presence,
      status,
      lastActivity: Date.now(),
    };

    this.presence.set(userId, event);

    // Persist
    const key = `${STORAGE_KEYS.CHAT_PRESENCE}_${userId}`;
    localStorage.setItem(key, JSON.stringify(event));

    // Notify (in real implementation, this would broadcast via WebSocket)
    logger.debug('Presence updated', { userId, presence, status });
  }

  /**
   * Get presence for a user
   */
  getPresence(userId: string): PresenceUpdateEvent | undefined {
    return this.presence.get(userId);
  }

  /**
   * Get online users
   */
  getOnlineUsers(): string[] {
    const now = Date.now();
    return Array.from(this.presence.entries())
      .filter(([_, event]) => event.presence === 'online' && now - event.lastActivity < this.config.offlineThreshold)
      .map(([userId]) => userId);
  }

  /**
   * Add participant to a conversation
   */
  async addParticipant(conversationId: string, participant: ConversationParticipant): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Check if already a participant
    if (conversation.participants.find(p => p.userId === participant.userId)) {
      return;
    }

    conversation.participants.push(participant);

    await this.persistConversation(conversationId);

    // Notify all participants
    conversation.participants.forEach(p => {
      this.notifyUser(p.userId, {
        type: 'participant_added',
        conversationId,
        timestamp: Date.now(),
        data: participant,
      });
    });

    logger.info('Participant added to conversation', { conversationId, userId: participant.userId });
  }

  /**
   * Remove participant from a conversation
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const index = conversation.participants.findIndex(p => p.userId === userId);
    if (index === -1) {
      return;
    }

    conversation.participants.splice(index, 1);

    await this.persistConversation(conversationId);

    // Notify all participants
    conversation.participants.forEach(p => {
      this.notifyUser(p.userId, {
        type: 'participant_removed',
        conversationId,
        timestamp: Date.now(),
        data: { userId },
      });
    });

    logger.info('Participant removed from conversation', { conversationId, userId });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
    this.messages.delete(conversationId);
    this.typingIndicators.delete(conversationId);
    this.subscribers.delete(conversationId);

    // Clear typing timers
    const timers = this.typingTimers.get(conversationId);
    if (timers) {
      timers.forEach(timer => clearTimeout(timer));
      this.typingTimers.delete(conversationId);
    }

    // Clear storage
    await this.persistConversation(conversationId);
    await this.persistMessages(conversationId);

    logger.info('Conversation deleted', { conversationId });
  }

  /**
   * Subscribe to chat events for a user
   */
  subscribeUser(userId: string, callback: (event: ChatEvent) => void): () => void {
    const key = `${userId}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key)!.add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  /**
   * Notify a user of an event
   */
  private notifyUser(userId: string, event: ChatEvent): void {
    const subscribers = this.subscribers.get(userId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error notifying user', { userId, error });
        }
      });
    }
  }

  /**
   * Prune old messages
   */
  private pruneMessages(messages: ChatMessage[]): void {
    const cutoff = Date.now() - this.config.messageRetention;

    // Remove old messages beyond retention period
    while (messages.length > 0 && messages[0].timestamp < cutoff) {
      messages.shift();
    }

    // Keep only recent messages if over limit
    if (messages.length > this.config.messageHistoryLimit) {
      const toRemove = messages.length - this.config.messageHistoryLimit;
      messages.splice(0, toRemove);
    }
  }

  /**
   * Persist conversation to localStorage
   */
  private async persistConversation(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return;
    }

    const key = `${STORAGE_KEYS.CONVERSATIONS}_${conversationId}`;
    localStorage.setItem(key, JSON.stringify(conversation));
  }

  /**
   * Persist messages to localStorage
   */
  private async persistMessages(conversationId: string): Promise<void> {
    const messages = this.messages.get(conversationId);
    if (!messages) {
      return;
    }

    const key = `${STORAGE_KEYS.CHAT_MESSAGES}_${conversationId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }

  /**
   * Load conversation from localStorage
   */
  async loadConversation(conversationId: string): Promise<Conversation | null> {
    const key = `${STORAGE_KEYS.CONVERSATIONS}_${conversationId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const conversation = JSON.parse(stored) as Conversation;
        this.conversations.set(conversationId, conversation);

        // Initialize typing indicators
        if (!this.typingIndicators.has(conversationId)) {
          this.typingIndicators.set(conversationId, new Set());
        }

        return conversation;
      } catch (error) {
        logger.error('Error loading conversation from storage', { conversationId, error });
      }
    }

    return null;
  }

  /**
   * Load messages from localStorage
   */
  async loadMessages(conversationId: string): Promise<void> {
    const key = `${STORAGE_KEYS.CHAT_MESSAGES}_${conversationId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const messages = JSON.parse(stored) as ChatMessage[];
        this.messages.set(conversationId, messages);
      } catch (error) {
        logger.error('Error loading messages from storage', { conversationId, error });
      }
    }
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(conversationId: string): {
    messageCount: number;
    unreadCount: number;
    participantCount: number;
    lastActivity?: number;
  } | undefined {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return undefined;
    }

    const messages = this.messages.get(conversationId) || [];

    return {
      messageCount: messages.length,
      unreadCount: conversation.unreadCount,
      participantCount: conversation.participants.length,
      lastActivity: conversation.lastActivity,
    };
  }

  /**
   * Clear all conversations and messages (for testing)
   */
  async clearAll(): Promise<void> {
    this.conversations.clear();
    this.messages.clear();
    this.typingIndicators.clear();
    this.subscribers.clear();
    this.presence.clear();

    // Clear typing timers
    this.typingTimers.forEach(timers => {
      timers.forEach(timer => clearTimeout(timer));
    });
    this.typingTimers.clear();

    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.CONVERSATIONS) || key.startsWith(STORAGE_KEYS.CHAT_MESSAGES) || key.startsWith(STORAGE_KEYS.CHAT_PRESENCE)) {
        localStorage.removeItem(key);
      }
    });

    logger.info('All chat data cleared');
  }
}

/**
 * Chat Event Types
 */
export type ChatEvent =
  | { type: 'conversation_created'; conversationId: string; timestamp: number; data: Conversation }
  | { type: 'message_received'; conversationId: string; timestamp: number; data: ChatMessage; unread?: number }
  | { type: 'message_edited'; conversationId: string; timestamp: number; data: ChatMessage }
  | { type: 'message_deleted'; conversationId: string; timestamp: number; data: { messageId: string } }
  | { type: 'message_read'; conversationId: string; timestamp: number; data: { messageId: string; readBy: string } }
  | { type: 'reaction_added'; conversationId: string; timestamp: number; data: { messageId: string; reaction: MessageReaction } }
  | { type: 'reaction_removed'; conversationId: string; timestamp: number; data: { messageId: string; userId: string } }
  | { type: 'typing_indicator'; conversationId: string; timestamp: number; data: { userId: string; isTyping: boolean } }
  | { type: 'participant_added'; conversationId: string; timestamp: number; data: ConversationParticipant }
  | { type: 'participant_removed'; conversationId: string; timestamp: number; data: { userId: string } };

// Export singleton instance
export const liveChatService = new LiveChatService();

// Export class for testing
export { LiveChatService };
