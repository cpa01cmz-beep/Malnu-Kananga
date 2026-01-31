// api/modules/messaging.ts - Parents and Messages APIs

import type { ParentChild, Grade, Attendance, Schedule, ParentMeeting, ParentTeacher, ParentMessage, ParentPayment, Conversation, ConversationFilter, ConversationCreateRequest, MessageSendRequest, DirectMessage, MessageReadReceipt, TypingIndicator } from '../../../types';
import { request } from '../client';

// ============================================
// PARENTS API
// ============================================

export const parentsAPI = {
  async getChildren(): Promise<{ success: boolean; message: string; data?: ParentChild[]; error?: string }> {
    return request<ParentChild[]>('/api/parent/children');
  },

  async getChildGrades(studentId: string): Promise<{ success: boolean; message: string; data?: Grade[]; error?: string }> {
    return request<Grade[]>(`/api/parent/grades?student_id=${studentId}`);
  },

  async getChildAttendance(studentId: string): Promise<{ success: boolean; message: string; data?: Attendance[]; error?: string }> {
    return request<Attendance[]>(`/api/parent/attendance?student_id=${studentId}`);
  },

  async getChildSchedule(studentId: string): Promise<{ success: boolean; message: string; data?: Schedule[]; error?: string }> {
    return request<Schedule[]>(`/api/parent/schedule?student_id=${studentId}`);
  },

  async getMeetings(studentId: string): Promise<{ success: boolean; message: string; data?: ParentMeeting[]; error?: string }> {
    return request<ParentMeeting[]>(`/api/parent/meetings?student_id=${studentId}`);
  },

  async getAvailableTeachersForMeetings(studentId: string): Promise<{ success: boolean; message: string; data?: ParentTeacher[]; error?: string }> {
    return request<ParentTeacher[]>(`/api/parent/meetings/teachers?student_id=${studentId}`);
  },

  async scheduleMeeting(meetingData: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>): Promise<{ success: boolean; message: string; data?: ParentMeeting; error?: string }> {
    return request<ParentMeeting>('/api/parent/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  async getMessages(studentId: string): Promise<{ success: boolean; message: string; data?: ParentMessage[]; error?: string }> {
    return request<ParentMessage[]>(`/api/parent/messages?student_id=${studentId}`);
  },

  async getAvailableTeachers(studentId: string): Promise<{ success: boolean; message: string; data?: ParentTeacher[]; error?: string }> {
    return request<ParentTeacher[]>(`/api/parent/messages/teachers?student_id=${studentId}`);
  },

  async sendMessage(messageData: Omit<ParentMessage, 'id' | 'timestamp' | 'status'>): Promise<{ success: boolean; message: string; data?: ParentMessage; error?: string }> {
    return request<ParentMessage>('/api/parent/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  async getPaymentHistory(studentId: string): Promise<{ success: boolean; message: string; data?: ParentPayment[]; error?: string }> {
    return request<ParentPayment[]>(`/api/parent/payments?student_id=${studentId}`);
  },
};

// ============================================
// MESSAGING API
// ============================================

export const messagesAPI = {
  async getConversations(filter?: ConversationFilter): Promise<{ success: boolean; message: string; data?: Conversation[]; error?: string }> {
    const params = new window.URLSearchParams();
    if (filter?.type) params.append('type', filter.type);
    if (filter?.search) params.append('search', filter.search);
    if (filter?.unreadOnly) params.append('unread_only', 'true');
    if (filter?.archived !== undefined) params.append('archived', String(filter.archived));

    const query = params.toString();
    return request<Conversation[]>(`/api/messages/conversations${query ? `?${query}` : ''}`);
  },

  async getConversation(conversationId: string): Promise<{ success: boolean; message: string; data?: Conversation; error?: string }> {
    return request<Conversation>(`/api/messages/conversations/${conversationId}`);
  },

  async createConversation(data: ConversationCreateRequest): Promise<{ success: boolean; message: string; data?: Conversation; error?: string }> {
    return request<Conversation>('/api/messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<{ success: boolean; message: string; data?: Conversation; error?: string }> {
    return request<Conversation>(`/api/messages/conversations/${conversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string; data?: { success: boolean }; error?: string }> {
    return request<{ success: boolean }>(`/api/messages/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<{ success: boolean; message: string; data?: DirectMessage[]; error?: string }> {
    return request<DirectMessage[]>(`/api/messages/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  },

  async sendMessage(data: MessageSendRequest): Promise<{ success: boolean; message: string; data?: DirectMessage; error?: string }> {
    if (data.file) {
      const formData = new FormData();
      formData.append('conversationId', data.conversationId);
      formData.append('messageType', data.messageType);
      formData.append('content', data.content);
      formData.append('file', data.file);
      if (data.replyTo) formData.append('replyTo', data.replyTo);

      return request<DirectMessage>('/api/messages', {
        method: 'POST',
        body: formData,
      });
    }

    return request<DirectMessage>('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateMessage(messageId: string, updates: Partial<DirectMessage>): Promise<{ success: boolean; message: string; data?: DirectMessage; error?: string }> {
    return request<DirectMessage>(`/api/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string; data?: { success: boolean }; error?: string }> {
    return request<{ success: boolean }>(`/api/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  async markMessageAsRead(messageId: string): Promise<{ success: boolean; message: string; data?: MessageReadReceipt; error?: string }> {
    return request<MessageReadReceipt>(`/api/messages/${messageId}/read`, {
      method: 'POST',
    });
  },

  async markConversationAsRead(conversationId: string): Promise<{ success: boolean; message: string; data?: { success: boolean; unreadCount: number }; error?: string }> {
    return request<{ success: boolean; unreadCount: number }>(`/api/messages/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },

  async getTypingIndicators(conversationId: string): Promise<{ success: boolean; message: string; data?: TypingIndicator[]; error?: string }> {
    return request<TypingIndicator[]>(`/api/messages/conversations/${conversationId}/typing`);
  },

  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<{ success: boolean; message: string; data?: { success: boolean }; error?: string }> {
    return request<{ success: boolean }>(`/api/messages/conversations/${conversationId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTyping }),
    });
  },

  async getUnreadCount(): Promise<{ success: boolean; message: string; data?: { total: number; conversations: Array<{ conversationId: string; count: number }> }; error?: string }> {
    return request<{ total: number; conversations: Array<{ conversationId: string; count: number }> }>('/api/messages/unread-count');
  },
};
