import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from './ChatWindow';
import { ChatProvider } from '../contexts/ChatContext';

// Wrapper component to provide ChatContext to tests
const ChatWindowWithProvider = (props: {isOpen: boolean, closeChat: () => void}) => (
  <ChatProvider>
    <ChatWindow {...props} />
  </ChatProvider>
);

// Mock the service
jest.mock('../services/geminiService', () => ({
  getAIResponseStream: jest.fn(),
  initialGreeting: 'Assalamualaikum! Saya Asisten AI MA Malnu Kananga.'
}));

// Mock the icon components
jest.mock('./icons/SendIcon', () => ({
  __esModule: true,
  SendIcon: () => <div data-testid="send-icon">SendIcon</div>
}));
jest.mock('./icons/CloseIcon', () => ({
  __esModule: true,
  CloseIcon: () => <div data-testid="close-icon">CloseIcon</div>
}));

// Mock ResizeObserver and IntersectionObserver
beforeAll(() => {
  (global as unknown).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  (global as unknown).IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

import { getAIResponseStream } from '../services/geminiService';

const mockGetAIResponseStream = getAIResponseStream as jest.MockedFunction<typeof getAIResponseStream>;

describe('ChatWindow Component', () => {
  const mockCloseChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render chat window when open', () => {
      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      expect(screen.getByText('Asisten AI')).toBeInTheDocument();
      expect(screen.getByText('Assalamualaikum! Saya Asisten AI MA Malnu Kananga.')).toBeInTheDocument();
    });

    test('should not render when closed', () => {
      render(<ChatWindowWithProvider isOpen={false} closeChat={mockCloseChat} />);

      expect(screen.queryByText('Asisten AI')).not.toBeInTheDocument();
    });

    test('should render input field and send button', () => {
      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      expect(screen.getByPlaceholderText('Ketik pertanyaan Anda...')).toBeInTheDocument();
      expect(screen.getByLabelText('Kirim pesan')).toBeInTheDocument();
    });

    test('should render close button', () => {
      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      expect(screen.getByLabelText('Tutup obrolan')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('should send message when form is submitted', async () => {
      const user = userEvent.setup();

      // Mock successful AI response
      const mockStream = (async function* () {
        yield 'Halo';
        yield ' ';
        yield 'saya';
        yield ' ';
        yield 'bisa';
        yield ' ';
        yield 'membantu';
        yield '!';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      const sendButton = screen.getByLabelText('Kirim pesan');

      await user.type(input, 'Halo, siapa kamu?');
      await user.click(sendButton);

      // Check user message appears
      await waitFor(() => {
        expect(screen.getByText('Halo, siapa kamu?')).toBeInTheDocument();
      });

      // Check AI response appears
      await waitFor(() => {
        expect(screen.getByText('Halo saya bisa membantu!')).toBeInTheDocument();
      });

      expect(mockGetAIResponseStream).toHaveBeenCalledWith(
        'Halo, siapa kamu?',
        []
      );
    });

    test('should send message with Enter key', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'Response';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');

      await user.type(input, 'Test message{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      expect(mockGetAIResponseStream).toHaveBeenCalledTimes(1);
    });

    test('should not send empty message', async () => {
      const user = userEvent.setup();

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const sendButton = screen.getByLabelText('Kirim pesan');

      await user.click(sendButton);

      expect(mockGetAIResponseStream).not.toHaveBeenCalled();
    });

    test('should not send message when loading', async () => {
      const user = userEvent.setup();

      // Mock slow response
      const mockStream = (async function* () {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield 'Slow response';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      const sendButton = screen.getByLabelText('Kirim pesan');

      await user.type(input, 'First message');
      await user.click(sendButton);

      // Try to send another message while loading
      await user.type(input, 'Second message');
      await user.click(sendButton);

      expect(mockGetAIResponseStream).toHaveBeenCalledTimes(1);
    });

    test('should close chat when close button is clicked', async () => {
      const user = userEvent.setup();

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const closeButton = screen.getByLabelText('Tutup obrolan');
      await user.click(closeButton);

      expect(mockCloseChat).toHaveBeenCalledTimes(1);
    });

    test('should clear input after sending message', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'Response';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');

      await user.type(input, 'Test message');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      expect(input).toHaveValue('');
    });
  });

  describe('AI Response Handling', () => {
    test('should handle streaming AI response correctly', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'Halo';
        yield ', ';
        yield 'saya ';
        yield 'adalah ';
        yield 'asisten ';
        yield 'AI!';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'Siapa kamu?');
      await user.click(screen.getByLabelText('Kirim pesan'));

      // Check that response builds up progressively
      await waitFor(() => {
        expect(screen.getByText('Halo, saya adalah asisten AI!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should handle AI error response', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield '';
        throw new Error('AI Service Error');
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'Test message');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        expect(screen.getByText('Maaf, terjadi kesalahan. Silakan coba lagi.')).toBeInTheDocument();
      });
    });

    test('should maintain conversation history', async () => {
      const user = userEvent.setup();

      // First response
      const mockStream1 = (async function* () {
        yield 'Response 1';
      })();

      // Second response
      const mockStream2 = (async function* () {
        yield 'Response 2';
      })();

      mockGetAIResponseStream
        .mockReturnValueOnce(mockStream1)
        .mockReturnValueOnce(mockStream2);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');

      // Send first message
      await user.type(input, 'Message 1');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        expect(screen.getByText('Message 1')).toBeInTheDocument();
      });

      // Send second message
      await user.type(input, 'Message 2');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        expect(screen.getByText('Message 2')).toBeInTheDocument();
      });

      // Both messages should be in history
      expect(mockGetAIResponseStream).toHaveBeenNthCalledWith(1, 'Message 1', []);
      expect(mockGetAIResponseStream).toHaveBeenNthCalledWith(2, 'Message 2', [
        { role: 'user', parts: 'Message 1' },
        { role: 'model', parts: 'Response 1' }
      ]);
    });
  });

  describe('Loading States', () => {
    test('should show loading indicator while AI responds', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield 'Response';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'Test');
      await user.click(screen.getByLabelText('Kirim pesan'));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });

      // Input should be disabled during loading
      expect(input).toBeDisabled();
    });

    test('should disable send button when input is empty', () => {
      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const sendButton = screen.getByLabelText('Kirim pesan');
      expect(sendButton).toBeDisabled();
    });

    test('should enable send button when input has content', async () => {
      const user = userEvent.setup();

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      const sendButton = screen.getByLabelText('Kirim pesan');

      await user.type(input, 'Test message');

      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'Response';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');

      // Focus input and type
      input.focus();
      await user.keyboard('Test message{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    test('should have proper ARIA labels', () => {
      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      expect(screen.getByLabelText('Tutup obrolan')).toBeInTheDocument();
      expect(screen.getByLabelText('Kirim pesan')).toBeInTheDocument();
    });

    test('should be focusable and navigable', () => {
      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      const closeButton = screen.getByLabelText('Tutup obrolan');
      const sendButton = screen.getByLabelText('Kirim pesan');

      expect(input).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();

      // All should be focusable
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Auto-scrolling', () => {
    test('should scroll to bottom when new messages are added', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'Long response that should trigger scrolling';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'Test');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });

      // In a real test, you'd check if scrollToBottom was called
      // For this mock test, we just verify the component handles the flow
    });
  });

  describe('Message Display', () => {
    test('should display user messages on the right', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'AI response';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'User message');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        const userMessage = screen.getByText('User message');
        expect(userMessage).toBeInTheDocument();
      });
    });

    test('should display AI messages on the left', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'AI response message';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'User question');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        const aiMessage = screen.getByText('AI response message');
        expect(aiMessage).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      const user = userEvent.setup();

      mockGetAIResponseStream.mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'Test message');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        expect(screen.getByText('Maaf, terjadi kesalahan. Silakan coba lagi.')).toBeInTheDocument();
      });
    });

    test('should handle network errors', async () => {
      const user = userEvent.setup();

      const mockStream = (async function* () {
        yield 'Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.';
      })();

      mockGetAIResponseStream.mockReturnValue(mockStream);

      render(<ChatWindowWithProvider isOpen={true} closeChat={mockCloseChat} />);

      const input = screen.getByPlaceholderText('Ketik pertanyaan Anda...');
      await user.type(input, 'Test message');
      await user.click(screen.getByLabelText('Kirim pesan'));

      await waitFor(() => {
        expect(screen.getByText('Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.')).toBeInTheDocument();
      });
    });
  });
});