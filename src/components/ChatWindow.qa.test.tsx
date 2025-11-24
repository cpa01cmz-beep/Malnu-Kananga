import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatWindow from './ChatWindow';

// Mock dependencies
jest.mock('../hooks/useChatLogic', () => ({
  useChatLogic: jest.fn(() => ({
    messages: [
      { id: '1', text: 'Hello!', sender: 'user' as const },
      { id: '2', text: 'Hi there!', sender: 'ai' as const }
    ],
    input: '',
    setInput: jest.fn(),
    isLoading: false,
    handleSend: jest.fn()
  }))
}));

jest.mock('../hooks/useTouchGestures', () => ({
  useTouchGestures: jest.fn(() => ({
    elementRef: { current: null }
  }))
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ChatWindow Component', () => {
  const mockCloseChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    renderWithQueryClient(
      <ChatWindow isOpen={false} closeChat={mockCloseChat} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render chat interface when isOpen is true', () => {
    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim/i })).toBeInTheDocument();
  });

  it('should display messages correctly', () => {
    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('should call closeChat when close button is clicked', () => {
    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    const closeButton = screen.getByRole('button', { name: /tutup/i });
    fireEvent.click(closeButton);

    expect(mockCloseChat).toHaveBeenCalledTimes(1);
  });

  it('should handle input changes', () => {
    const mockSetInput = jest.fn();
    jest.doMock('../hooks/useChatLogic', () => ({
      useChatLogic: jest.fn(() => ({
        messages: [],
        input: '',
        setInput: mockSetInput,
        isLoading: false,
        handleSend: jest.fn()
      }))
    }));

    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test message' } });

    expect(mockSetInput).toHaveBeenCalledWith('Test message');
  });

  it('should handle send message', () => {
    const mockHandleSend = jest.fn();
    jest.doMock('../hooks/useChatLogic', () => ({
      useChatLogic: jest.fn(() => ({
        messages: [],
        input: 'Test message',
        setInput: jest.fn(),
        isLoading: false,
        handleSend: mockHandleSend
      }))
    }));

    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    const sendButton = screen.getByRole('button', { name: /kirim/i });
    fireEvent.click(sendButton);

    expect(mockHandleSend).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    jest.doMock('../hooks/useChatLogic', () => ({
      useChatLogic: jest.fn(() => ({
        messages: [],
        input: '',
        setInput: jest.fn(),
        isLoading: true,
        handleSend: jest.fn()
      }))
    }));

    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    expect(screen.getByText(/mengetik/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim/i })).toBeDisabled();
  });

  it('should handle keyboard events', () => {
    const mockHandleSend = jest.fn();
    jest.doMock('../hooks/useChatLogic', () => ({
      useChatLogic: jest.fn(() => ({
        messages: [],
        input: 'Test message',
        setInput: jest.fn(),
        isLoading: false,
        handleSend: mockHandleSend
      }))
    }));

    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockHandleSend).toHaveBeenCalledTimes(1);
  });

  it('should be accessible', () => {
    renderWithQueryClient(
      <ChatWindow isOpen={true} closeChat={mockCloseChat} />
    );

    // Check for proper ARIA attributes
    const chatWindow = screen.getByRole('dialog');
    expect(chatWindow).toHaveAttribute('aria-modal', 'true');
    
    // Check for proper focus management
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });
});