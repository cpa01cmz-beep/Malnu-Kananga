import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DirectMessage } from '../DirectMessage';
import * as apiService from '../../services/apiService';
import { STORAGE_KEYS } from '../../constants';
import type { User, Conversation, Participant } from '../../types';

vi.mock('../../services/apiService', () => ({
  messagesAPI: {
    getConversations: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
  },
  usersAPI: {
    getById: vi.fn(),
    list: vi.fn(),
  },
}));

const mockCurrentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'teacher',
  status: 'active',
};

const mockOtherUsers: User[] = [
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'student',
    status: 'active',
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'student',
    status: 'active',
  },
];

const mockParticipant: Participant = {
  userId: 'user-2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'student',
  joinedAt: '2024-01-01T00:00:00Z',
  isOnline: true,
};

const mockConversation: Conversation = {
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
    mockParticipant,
  ],
  unreadCount: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'user-1',
};

describe('DirectMessage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockCurrentUser));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify([mockConversation]));
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders welcome screen when no conversation selected', () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    expect(screen.getByText(/Selamat Datang di Pesan/i)).toBeInTheDocument();
    expect(screen.getByText(/Pilih percakapan untuk memulai/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Percakapan Baru/i })).toBeInTheDocument();
  });

  it('loads available users', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      expect(vi.mocked(apiService.usersAPI).getAll).toHaveBeenCalled();
    });
  });

  it('shows new chat modal when clicking Percakapan Baru button', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    expect(screen.getByText('Percakapan Baru')).toBeInTheDocument();
  });

  it('shows user list in new chat modal', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith (jane@example.com)')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson (bob@example.com)')).toBeInTheDocument();
    });
  });

  it('creates conversation when user is selected and confirmed', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });
    vi.mocked(apiService.messagesAPI).createConversation.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockConversation,
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    await waitFor(() => {
      const selectElement = screen.getByLabelText(/Pilih Pengguna/i);
      fireEvent.change(selectElement, { target: { value: 'user-2' } });
    });

    const createButton = await screen.findByRole('button', { name: /Buat Percakapan/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(vi.mocked(apiService.messagesAPI).createConversation).toHaveBeenCalledWith({
        type: 'direct',
        participantIds: ['user-2'],
      });
    });
  });

  it('closes new chat modal when clicking Batal button', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /Batal/i });
      fireEvent.click(cancelButton);
    });

    expect(screen.queryByText('Percakapan Baru')).not.toBeInTheDocument();
  });

  it('shows error message when conversation creation fails', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });
    vi.mocked(apiService.messagesAPI).createConversation.mockRejectedValue(new Error('API Error'));

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    await waitFor(() => {
      const selectElement = screen.getByLabelText(/Pilih Pengguna/i);
      fireEvent.change(selectElement, { target: { value: 'user-2' } });
    });

    const createButton = await screen.findByRole('button', { name: /Buat Percakapan/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Gagal membuat percakapan baru');
    });

    alertSpy.mockRestore();
  });

  it('disables create button when no user is selected', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    const createButton = await screen.findByRole('button', { name: /Buat Percakapan/i });
    expect(createButton).toBeDisabled();
  });

  it('excludes current user from available users', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: [mockCurrentUser, ...mockOtherUsers],
    });

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('John Doe (john@example.com)')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith (jane@example.com)')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching users', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockImplementation(() => new Promise(() => {}));

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows loading state while creating conversation', async () => {
    vi.mocked(apiService.usersAPI).getAll.mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockOtherUsers,
    });
    vi.mocked(apiService.messagesAPI).createConversation.mockImplementation(() => new Promise(() => {}));

    render(<DirectMessage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /Percakapan Baru/i });
      fireEvent.click(newChatButton);
    });

    const selectElement = await screen.findByLabelText(/Pilih Pengguna/i);
    fireEvent.change(selectElement, { target: { value: 'user-2' } });

    const createButton = await screen.findByRole('button', { name: /Buat Percakapan/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Membuat\.\.\./i)).toBeInTheDocument();
    });
  });
});
