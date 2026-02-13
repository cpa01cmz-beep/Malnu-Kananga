// api/modules/messaging.ts - Parents and Messages APIs

import type { ParentChild, Grade, Attendance, Schedule, ParentMeeting, ParentTeacher, ParentMessage, ParentPayment, Conversation, ConversationFilter, ConversationCreateRequest, MessageSendRequest, DirectMessage, MessageReadReceipt, TypingIndicator } from '../../../types';
import { request } from '../client';
import { API_ENDPOINTS, PAGINATION_DEFAULTS } from '../../../constants';

// ============================================
// PARENTS API
// ============================================

export const parentsAPI = {
  async getChildren(): Promise<{ success: boolean; message: string; data?: ParentChild[]; error?: string }> {
    return request<ParentChild[]>(API_ENDPOINTS.MESSAGING.PARENT_CHILDREN);
  },

  async getChildGrades(studentId: string): Promise<{ success: boolean; message: string; data?: Grade[]; error?: string }> {
    return request<Grade[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/grades?student_id=${studentId}`);
  },

  async getChildAttendance(studentId: string): Promise<{ success: boolean; message: string; data?: Attendance[]; error?: string }> {
    return request<Attendance[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/attendance?student_id=${studentId}`);
  },

  async getChildSchedule(studentId: string): Promise<{ success: boolean; message: string; data?: Schedule[]; error?: string }> {
    return request<Schedule[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/schedule?student_id=${studentId}`);
  },

  async getMeetings(studentId: string): Promise<{ success: boolean; message: string; data?: ParentMeeting[]; error?: string }> {
    return request<ParentMeeting[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/meetings?student_id=${studentId}`);
  },

  async getAvailableTeachersForMeetings(studentId: string): Promise<{ success: boolean; message: string; data?: ParentTeacher[]; error?: string }> {
    return request<ParentTeacher[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/meetings/teachers?student_id=${studentId}`);
  },

  async scheduleMeeting(meetingData: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>): Promise<{ success: boolean; message: string; data?: ParentMeeting; error?: string }> {
    return request<ParentMeeting>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/meetings`, {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  async getMessages(studentId: string): Promise<{ success: boolean; message: string; data?: ParentMessage[]; error?: string }> {
    return request<ParentMessage[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/messages?student_id=${studentId}`);
  },

  async getAvailableTeachers(studentId: string): Promise<{ success: boolean; message: string; data?: ParentTeacher[]; error?: string }> {
    return request<ParentTeacher[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/messages/teachers?student_id=${studentId}`);
  },

  async sendMessage(messageData: Omit<ParentMessage, 'id' | 'timestamp' | 'status'>): Promise<{ success: boolean; message: string; data?: ParentMessage; error?: string }> {
    return request<ParentMessage>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  async getPaymentHistory(studentId: string): Promise<{ success: boolean; message: string; data?: ParentPayment[]; error?: string }> {
    return request<ParentPayment[]>(`${API_ENDPOINTS.MESSAGING.PARENT_CHILDREN}/payments?student_id=${studentId}`);
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
    return request<Conversation[]>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}${query ? `?${query}` : ''}`);
  },

  async getConversation(conversationId: string): Promise<{ success: boolean; message: string; data?: Conversation; error?: string }> {
    return request<Conversation>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}`);
  },

  async createConversation(data: ConversationCreateRequest): Promise<{ success: boolean; message: string; data?: Conversation; error?: string }> {
    return request<Conversation>(API_ENDPOINTS.MESSAGING.CONVERSATIONS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<{ success: boolean; message: string; data?: Conversation; error?: string }> {
    return request<Conversation>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string; data?: { success: boolean }; error?: string }> {
    return request<{ success: boolean }>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}`, {
      method: 'DELETE',
    });
  },

  async getMessages(conversationId: string, limit: number = PAGINATION_DEFAULTS.MESSAGES, offset = 0): Promise<{ success: boolean; message: string; data?: DirectMessage[]; error?: string }> {
    return request<DirectMessage[]>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  },

  async sendMessage(data: MessageSendRequest): Promise<{ success: boolean; message: string; data?: DirectMessage; error?: string }> {
    if (data.file) {
      const formData = new FormData();
      formData.append('conversationId', data.conversationId);
      formData.append('messageType', data.messageType);
      formData.append('content', data.content);
      formData.append('file', data.file);
      if (data.replyTo) formData.append('replyTo', data.replyTo);

      return request<DirectMessage>(API_ENDPOINTS.MESSAGING.MESSAGES, {
        method: 'POST',
        body: formData,
      });
    }

    return request<DirectMessage>(API_ENDPOINTS.MESSAGING.MESSAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateMessage(messageId: string, updates: Partial<DirectMessage>): Promise<{ success: boolean; message: string; data?: DirectMessage; error?: string }> {
    return request<DirectMessage>(`${API_ENDPOINTS.MESSAGING.MESSAGES}/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string; data?: { success: boolean }; error?: string }> {
    return request<{ success: boolean }>(`${API_ENDPOINTS.MESSAGING.MESSAGES}/${messageId}`, {
      method: 'DELETE',
    });
  },

  async markMessageAsRead(messageId: string): Promise<{ success: boolean; message: string; data?: MessageReadReceipt; error?: string }> {
    return request<MessageReadReceipt>(`${API_ENDPOINTS.MESSAGING.MESSAGES}/${messageId}/read`, {
      method: 'POST',
    });
  },

  async markConversationAsRead(conversationId: string): Promise<{ success: boolean; message: string; data?: { success: boolean; unreadCount: number }; error?: string }> {
    return request<{ success: boolean; unreadCount: number }>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/read`, {
      method: 'POST',
    });
  },

  async getTypingIndicators(conversationId: string): Promise<{ success: boolean; message: string; data?: TypingIndicator[]; error?: string }> {
    return request<TypingIndicator[]>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/typing`);
  },

  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<{ success: boolean; message: string; data?: { success: boolean }; error?: string }> {
    return request<{ success: boolean }>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTyping }),
    });
  },

  async getUnreadCount(): Promise<{ success: boolean; message: string; data?: { total: number; conversations: Array<{ conversationId: string; count: number }> }; error?: string }> {
    return request<{ total: number; conversations: Array<{ conversationId: string; count: number }> }>(`${API_ENDPOINTS.MESSAGING.MESSAGES}/unread-count`);
  },
};
