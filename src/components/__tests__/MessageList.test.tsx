import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageList } from '../MessageList';
import * as apiService from '../../services/apiService';
import { STORAGE_KEYS } from '../../constants';
import type { Conversation, User } from '../../types';

vi.mock('../../services/apiService');
const mockedApiService = apiService as { messages: typeof apiService.messages };

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
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
      {
        userId: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'student',
        joinedAt: '2024-01-01T00:00:00Z',
        isOnline: false,
        lastSeen: '2024-01-01T10:00:00Z',
      },
    ],
    lastMessage: {
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
      createdAt: '2024-01-01T09:00:00Z',
      updatedAt: '2024-01-01T09:00:00Z',
    },
    unreadCount: 0,
    lastMessageAt: '2024-01-01T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
    createdBy: 'user-1',
  },
  {
    id: 'conv-2',
    type: 'direct',
    participantIds: ['user-1', 'user-3'],
    participants: [
      {
        userId: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'teacher',
        joinedAt: '2024-01-01T00:00:00Z',
        isOnline: true,
      },
      {
        userId: 'user-3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'student',
        joinedAt: '2024-01-01T00:00:00Z',
        isOnline: false,
      },
    ],
    lastMessage: {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: 'user-3',
      senderName: 'Bob Johnson',
      senderRole: 'student',
      recipientId: 'user-1',
      recipientName: 'John Doe',
      recipientRole: 'teacher',
      messageType: 'text',
      content: 'Hi John!',
      status: 'delivered',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
    },
    unreadCount: 2,
    lastMessageAt: '2024-01-01T08:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
    createdBy: 'user-3',
  },
];

const mockCurrentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'teacher',
  status: 'active',
};

describe('MessageList', () => {
  const mockOnConversationSelect = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockCurrentUser));
    mockOnConversationSelect.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders conversation list', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockedApiService.messages.getConversations.mockImplementation(() => new Promise(() => {}));
    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    mockedApiService.messages.getConversations.mockRejectedValue(new Error('API Error'));
    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat percakapan')).toBeInTheDocument();
    });
  });

  it('shows empty state when no conversations', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [],
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText(/Belum ada percakapan/i)).toBeInTheDocument();
    });
  });

  it('calls onConversationSelect when conversation is clicked', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });
    mockedApiService.messages.markConversationAsRead.mockResolvedValue({
      success: true,
      message: 'Success',
      data: { success: true, unreadCount: 0 },
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      const conversationButton = screen.getByText('Jane Smith').closest('button');
      fireEvent.click(conversationButton!);
    });

    await waitFor(() => {
      expect(mockOnConversationSelect).toHaveBeenCalledWith('conv-1', 'user-2');
      expect(mockedApiService.messages.markConversationAsRead).toHaveBeenCalledWith('conversations');
    });
  });

  it('marks conversation as selected', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} selectedConversationId="conv-1" />);

    await waitFor(() => {
      const selectedConversation = screen.getByText('Jane Smith').closest('button');
      expect(selectedConversation).toHaveClass('bg-blue-50');
    });
  });

  it('shows unread count badge', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('shows last message content', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Hello Jane!')).toBeInTheDocument();
      expect(screen.getByText('Hi John!')).toBeInTheDocument();
    });
  });

  it('shows file attachment icon for file messages', async () => {
    const conversationsWithFile: Conversation[] = [
      {
        ...mockConversations[0],
        lastMessage: {
          ...mockConversations[0].lastMessage!,
          messageType: 'file',
          content: '',
          fileName: 'document.pdf',
        },
      },
    ];

    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: conversationsWithFile,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText(/📎/)).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  it('filters conversations by search', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Cari percakapan...');
      fireEvent.change(searchInput, { target: { value: 'Jane' } });

      expect(mockedApiService.messages.getConversations).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Jane' })
      );
    });
  });

  it('filters conversations by type', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      const directButton = screen.getByText('Pribadi');
      fireEvent.click(directButton);

      expect(mockedApiService.messages.getConversations).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'direct' })
      );
    });
  });

  it('filters unread conversations', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      const unreadButton = screen.getByText('Belum Dibaca');
      fireEvent.click(unreadButton);

      expect(mockedApiService.messages.getConversations).toHaveBeenCalledWith(
        expect.objectContaining({ unreadOnly: true })
      );
    });
  });

  it('shows participant avatar as initials when no avatar URL', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });

  it('formats time correctly for recent messages', async () => {
    const recentTime = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const recentConversation: Conversation = {
      ...mockConversations[0],
      lastMessageAt: recentTime,
    };

    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [recentConversation],
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText(/30 mnt lalu/i)).toBeInTheDocument();
    });
  });

  it('updates conversation list on WebSocket message', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversations,
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    window.dispatchEvent(
      new CustomEvent('realtime-update', {
        detail: {
          type: 'message_created',
          entity: 'message',
          data: mockConversations[0].lastMessage,
        },
      })
    );

    expect(mockedApiService.messages.getConversations).toHaveBeenCalled();
  });

  it('shows empty state for filtered results', async () => {
    mockedApiService.messages.getConversations.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [],
    });

    render(<MessageList onConversationSelect={mockOnConversationSelect} />);

    const searchInput = screen.getByPlaceholderText('Cari percakapan...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/Tidak ada percakapan yang sesuai/i)).toBeInTheDocument();
    });
  });
});
