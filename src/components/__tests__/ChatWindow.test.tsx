import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '../ChatWindow';

const mockMessages = [
  { id: '1', text: 'Hello', sender: 'user', timestamp: new Date() },
  { id: '2', text: 'Hi there!', sender: 'bot', timestamp: new Date() },
];

describe('ChatWindow Component', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnClearHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat interface', () => {
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    expect(screen.getByPlaceholderText(/ketik pesan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim/i })).toBeInTheDocument();
  });

  test('displays messages correctly', () => {
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/ketik pesan/i);
    const sendButton = screen.getByRole('button', { name: /kirim/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    expect(input).toHaveValue('');
  });

  test('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/ketik pesan/i);

    await user.type(input, 'Test message{enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  test('does not send empty messages', async () => {
    const user = userEvent.setup();
    
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    const sendButton = screen.getByRole('button', { name: /kirim/i });
    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  test('shows loading state', () => {
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={true}
      />
    );

    expect(screen.getByText(/mengetik/i)).toBeInTheDocument();
  });

  test('clears chat history', async () => {
    const user = userEvent.setup();
    
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    const clearButton = screen.getByRole('button', { name: /hapus riwayat/i });
    await user.click(clearButton);

    expect(mockOnClearHistory).toHaveBeenCalled();
  });

  test('auto-scrolls to bottom when new message is added', async () => {
    const user = userEvent.setup();
    
    render(
      <ChatWindow
        messages={[]}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/ketik pesan/i);
    await user.type(input, 'New message{enter}');

    await waitFor(() => {
      const chatContainer = screen.getByTestId('chat-messages');
      expect(chatContainer.scrollTop).toBe(chatContainer.scrollHeight);
    });
  });

  test('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    await user.keyboard('{Control>}{k}{/Control}');

    expect(mockOnClearHistory).toHaveBeenCalled();
  });

  test('displays typing indicator when bot is responding', () => {
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  test('formats message timestamps correctly', () => {
    const messageWithTimestamp = {
      id: '1',
      text: 'Hello',
      sender: 'user' as const,
      timestamp: new Date('2023-01-01T10:00:00'),
    };

    render(
      <ChatWindow
        messages={[messageWithTimestamp]}
        onSendMessage={mockOnSendMessage}
        onClearHistory={mockOnClearHistory}
        isLoading={false}
      />
    );

    expect(screen.getByText('10:00')).toBeInTheDocument();
  });
});