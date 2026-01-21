import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MessageThread } from '../MessageThread';
import * as apiService from '../../services/apiService';
import { STORAGE_KEYS } from '../../constants';
import type { DirectMessage, Participant, User } from '../../types';

vi.mock('../../services/apiService', () => ({
  messagesAPI: {
    getMessages: vi.fn(),
  },
}));

const mockCurrentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'teacher',
  status: 'active',
};

const mockParticipant: Participant = {
  userId: 'user-2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'student',
  joinedAt: '2024-01-01T00:00:00Z',
  isOnline: true,
};

const mockMessages: DirectMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    senderName: 'John Doe',
    senderRole: 'teacher',
    recipientId: 'user-2',
    recipientName: 'Jane Smith',
    recipientRole: 'student',
    messageType: 'text',
    content: 'Hello Jane!',
    status: 'read',
    readAt: '2024-01-01T09:00:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-2',
    senderName: 'Jane Smith',
    senderRole: 'student',
    recipientId: 'user-1',
    recipientName: 'John Doe',
    recipientRole: 'teacher',
    messageType: 'text',
    content: 'Hi John!',
    status: 'delivered',
    createdAt: '2024-01-01T08:30:00Z',
    updatedAt: '2024-01-01T08:30:00Z',
  },
];

const mockConversation = {
  id: 'conv-1',
  type: 'direct' as const,
  participantIds: ['user-1', 'user-2'],
  participants: [
    {
      userId: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'teacher',
      joinedAt: '2024-01-01T00:00:00Z',
      isOnline: true,
    },
    mockParticipant,
  ],
  unreadCount: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T08:30:00Z',
  createdBy: 'user-1',
};

describe('MessageThread', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockCurrentUser));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify([mockConversation]));
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders message thread', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockMessages,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Hello Jane!')).toBeInTheDocument();
      expect(screen.getByText('Hi John!')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockImplementation(() => new Promise(() => {}));

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no messages', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [],
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Belum ada pesan/i)).toBeInTheDocument();
    });
  });

  it('distinguishes own messages from others', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockMessages,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      const ownMessage = screen.getByText('Hello Jane!');
      const otherMessage = screen.getByText('Hi John!');

      const ownMessageContainer = ownMessage.closest('div');
      const otherMessageContainer = otherMessage.closest('div');

      expect(ownMessageContainer).toHaveClass('justify-end');
      expect(otherMessageContainer).toHaveClass('justify-start');
    });
  });

  it('shows sender name for non-own messages', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockMessages,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows reply preview when message has reply', async () => {
    const messageWithReply: DirectMessage[] = [
      {
        ...mockMessages[0],
        replyTo: 'msg-0',
      },
    ];

    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: messageWithReply,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Membalas:/)).toBeInTheDocument();
    });
  });

  it('shows file attachment for file messages', async () => {
    const fileMessage: DirectMessage[] = [
      {
        ...mockMessages[0],
        messageType: 'file',
        fileUrl: 'https://example.com/file.pdf',
        fileName: 'document.pdf',
        content: '',
      },
    ];

    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: fileMessage,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  it('formats message time correctly', async () => {
    const recentMessage: DirectMessage[] = [
      {
        ...mockMessages[0],
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];

    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: recentMessage,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/30 mnt lalu/i)).toBeInTheDocument();
    });
  });

  it('shows read receipt for read messages', async () => {
    const readMessage: DirectMessage[] = [
      {
        ...mockMessages[0],
        status: 'read',
      },
    ];

    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: readMessage,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      const messageElement = screen.getByText('Hello Jane!');
      expect(messageElement.closest('div')?.innerHTML).toContain('read');
    });
  });

  it('shows participant online status', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [],
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText(/Terakhir dilihat/i)).not.toBeInTheDocument();
    });
  });

  it('shows participant last seen when offline', async () => {
    const offlineParticipant: Participant = {
      ...mockParticipant,
      isOnline: false,
      lastSeen: '2024-01-01T10:00:00Z',
    };

    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [],
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={offlineParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Terakhir dilihat/i)).toBeInTheDocument();
      expect(screen.getByText('Online')).not.toBeInTheDocument();
    });
  });

  it('adds new message from WebSocket', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockMessages,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });
    vi.mocked(apiService.messagesAPI).markMessageAsRead.mockResolvedValue({
      success: true,
      message: 'Success',
      data: {
        messageId: 'msg-3',
        userId: 'user-1',
        readAt: '2024-01-01T10:00:00Z',
      },
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Hello Jane!')).toBeInTheDocument();
    });

    const newMessage: DirectMessage = {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Jane Smith',
      senderRole: 'student',
      recipientId: 'user-1',
      recipientName: 'John Doe',
      recipientRole: 'teacher',
      messageType: 'text',
      content: 'New message!',
      status: 'delivered',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    };

    window.dispatchEvent(
      new CustomEvent('realtime-update', {
        detail: {
          type: 'message_created',
          entity: 'message',
          data: newMessage,
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('New message!')).toBeInTheDocument();
      expect(vi.mocked(apiService.messagesAPI).markMessageAsRead).toHaveBeenCalledWith('msg-3');
    });
  });

  it('scrolls to bottom on new message', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockMessages,
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Hello Jane!')).toBeInTheDocument();
    });

    const newMessage: DirectMessage = {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Jane Smith',
      senderRole: 'student',
      recipientId: 'user-1',
      recipientName: 'John Doe',
      recipientRole: 'teacher',
      messageType: 'text',
      content: 'New message!',
      status: 'delivered',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    };

    window.dispatchEvent(
      new CustomEvent('realtime-update', {
        detail: {
          type: 'message_created',
          entity: 'message',
          data: newMessage,
        },
      })
    );

    const container = screen.getByText('Hello Jane!').closest('div');
    expect(container?.scrollIntoView).toHaveBeenCalled();
  });

  it('uses custom placeholder', async () => {
    vi.mocked(apiService.messagesAPI).getMessages.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [],
    });
    vi.mocked(apiService.messagesAPI).getConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        currentUser={mockCurrentUser}
        participant={mockParticipant}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Kirim pesan ke/i)).toBeInTheDocument();
    });
  });
});
