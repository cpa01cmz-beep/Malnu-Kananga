import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageInput } from '../MessageInput';
import { STORAGE_KEYS } from '../../constants';

describe('MessageInput', () => {
  const mockOnSendMessage = vi.fn();
  const defaultProps = {
    onSendMessage: mockOnSendMessage,
  };

  beforeEach(() => {
    localStorage.clear();
    mockOnSendMessage.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders input field and send button', () => {
    render(<MessageInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Ketik pesan...')).toBeInTheDocument();
    expect(screen.getByLabelText(/kirim pesan/i)).toBeInTheDocument();
  });

  it('sends message on button click', async () => {
    render(<MessageInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');
    const sendButton = screen.getByLabelText(/kirim pesan/i);

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', undefined);
    });
  });

  it('sends message on Enter key press', async () => {
    render(<MessageInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', undefined);
    });
  });

  it('does not send empty message', () => {
    render(<MessageInput {...defaultProps} />);
    const sendButton = screen.getByLabelText(/kirim pesan/i);

    fireEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('sends message on Shift+Enter as new line', () => {
    render(<MessageInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
    expect(input).toHaveValue('Test message');
  });

  it('shows file upload button', () => {
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/lampirkan/i);
    expect(uploadButton).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/lampirkan/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    const input = uploadButton.nextElementSibling as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/test\.pdf/)).toBeInTheDocument();
  });

  it('removes selected file', () => {
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/lampirkan/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    const input = uploadButton.nextElementSibling as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const removeButton = screen.getByLabelText(/hapus file/i);
    fireEvent.click(removeButton);

    expect(screen.queryByText(/test\.pdf/)).not.toBeInTheDocument();
  });

  it('sends message with file', async () => {
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/lampirkan/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    const input = uploadButton.nextElementSibling as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const sendButton = screen.getByLabelText(/kirim pesan/i);
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('', expect.any(File));
    });
  });

  it('saves draft to localStorage', () => {
    render(<MessageInput {...defaultProps} replyTo={{ id: 'test-msg-id', content: 'Test', senderName: 'John' }} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    fireEvent.change(input, { target: { value: 'Draft message' } });

    const drafts = localStorage.getItem(STORAGE_KEYS.MESSAGE_DRAFTS('test-msg-id'));
    expect(drafts).toBeDefined();
    const parsedDrafts = JSON.parse(drafts!);
    expect(parsedDrafts['test-msg-id']).toBe('Draft message');
  });

  it('loads draft from localStorage', () => {
    localStorage.setItem(
      STORAGE_KEYS.MESSAGE_DRAFTS('test-msg-id'),
      JSON.stringify({ 'test-msg-id': 'Saved draft' })
    );

    render(<MessageInput {...defaultProps} replyTo={{ id: 'test-msg-id', content: 'Test', senderName: 'John' }} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    expect(input).toHaveValue('Saved draft');
  });

  it('disables input when disabled prop is true', () => {
    render(<MessageInput {...defaultProps} disabled />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    expect(input).toBeDisabled();
  });

  it('shows loading state while sending', () => {
    mockOnSendMessage.mockImplementation(() => new Promise(() => {}));
    render(<MessageInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    fireEvent.change(input, { target: { value: 'Test' } });
    const sendButton = screen.getByLabelText(/kirim pesan/i);
    fireEvent.click(sendButton);

    expect(screen.getByLabelText(/mengirim/i)).toBeDisabled();
  });

  it('clears input after sending', async () => {
    mockOnSendMessage.mockResolvedValue(undefined);
    render(<MessageInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    fireEvent.change(input, { target: { value: 'Test' } });
    const sendButton = screen.getByLabelText(/kirim pesan/i);
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('uses custom placeholder', () => {
    render(<MessageInput {...defaultProps} placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('shows reply preview when replyTo prop is provided', () => {
    render(
      <MessageInput
        {...defaultProps}
        replyTo={{ id: 'test-msg-id', content: 'Original message', senderName: 'John' }}
        onCancelReply={vi.fn()}
      />
    );

    expect(screen.getByText(/Membalas:/)).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Original message')).toBeInTheDocument();
  });

  it('cancels reply when cancel button is clicked', () => {
    const mockCancelReply = vi.fn();
    render(
      <MessageInput
        {...defaultProps}
        replyTo={{ id: 'test-msg-id', content: 'Original message', senderName: 'John' }}
        onCancelReply={mockCancelReply}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(cancelButton);

    expect(mockCancelReply).toHaveBeenCalled();
  });

  it('calls onCancelReply when sending message with reply', async () => {
    const mockCancelReply = vi.fn();
    render(
      <MessageInput
        {...defaultProps}
        replyTo={{ id: 'test-msg-id', content: 'Original message', senderName: 'John' }}
        onCancelReply={mockCancelReply}
      />
    );

    const input = screen.getByPlaceholderText('Ketik pesan...');
    fireEvent.change(input, { target: { value: 'Reply message' } });
    const sendButton = screen.getByLabelText(/kirim pesan/i);
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockCancelReply).toHaveBeenCalled();
    });
  });

  it('clears reply draft after sending', async () => {
    const mockCancelReply = vi.fn();
    render(
      <MessageInput
        {...defaultProps}
        replyTo={{ id: 'test-msg-id', content: 'Original message', senderName: 'John' }}
        onCancelReply={mockCancelReply}
      />
    );

    const input = screen.getByPlaceholderText('Ketik pesan...');
    fireEvent.change(input, { target: { value: 'Reply' } });
    const sendButton = screen.getByLabelText(/kirim pesan/i);
    fireEvent.click(sendButton);

    await waitFor(() => {
      const drafts = localStorage.getItem(STORAGE_KEYS.MESSAGE_DRAFTS('test-msg-id'));
      expect(drafts).toBeDefined();
      const parsedDrafts = JSON.parse(drafts!);
      expect(parsedDrafts['test-msg-id']).toBe('');
    });
  });
});

describe('MessageInput Clear Functionality', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('shows clear button when textarea has content', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });

    const clearButton = screen.getByLabelText(/bersihkan/i);
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveAttribute('aria-label', 'Bersihkan pesan (Tekan Escape)');
  });

  it('does not show clear button when textarea is empty', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const clearButton = screen.queryByLabelText(/bersihkan/i);
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clears textarea when clear button is clicked', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });
    const clearButton = screen.getByLabelText(/bersihkan/i);

    fireEvent.click(clearButton);

    expect(input.value).toBe('');
  });

  it('maintains focus on textarea after clearing with button', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });
    const clearButton = screen.getByLabelText(/bersihkan/i);

    fireEvent.click(clearButton);

    expect(document.activeElement).toBe(input);
  });

  it('clears textarea when Escape key is pressed', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('');
  });

  it('maintains focus on textarea after clearing with Escape key', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(document.activeElement).toBe(input);
  });

  it('does not clear on Escape when textarea is empty', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('');
  });

  it('does not show clear button when disabled', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} disabled />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });

    const clearButton = screen.queryByLabelText(/bersihkan/i);
    expect(clearButton).not.toBeInTheDocument();
  });

  it('does not show clear button when sending', () => {
    mockOnSendMessage.mockImplementation(() => new Promise(() => {}));
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });
    const sendButton = screen.getByRole('button', { name: /kirim/i });
    fireEvent.click(sendButton);

    const clearButton = screen.queryByLabelText(/bersihkan/i);
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clear button has proper aria-describedby when tooltip is shown', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });
    const clearButton = screen.getByLabelText(/bersihkan/i);

    fireEvent.focus(clearButton);

    expect(clearButton).toHaveAttribute('aria-describedby', 'clear-tooltip-message');
  });

  it('clear button has aria-describedby for tooltip', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    const input = screen.getByPlaceholderText('Ketik pesan...') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });
    const clearButton = screen.getByLabelText(/bersihkan/i);

    fireEvent.focus(clearButton);

    expect(clearButton).toHaveAttribute('aria-describedby', 'clear-tooltip-message');
  });
});
