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
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('sends message on button click', async () => {
    render(<MessageInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');
    const sendButton = screen.getByRole('button');

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
    const sendButton = screen.getByRole('button');

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
    const uploadButton = screen.getByLabelText(/upload/i);
    expect(uploadButton).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/upload/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    const input = uploadButton.nextElementSibling as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/test\.pdf/)).toBeInTheDocument();
  });

  it('validates file size (max 10MB)', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/upload/i);

    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    const input = uploadButton.nextElementSibling as HTMLInputElement;

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(alertSpy).toHaveBeenCalledWith('Ukuran file maksimal 10MB');
    alertSpy.mockRestore();
  });

  it('removes selected file', () => {
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/upload/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    const input = uploadButton.nextElementSibling as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const removeButton = screen.getByText(/×/i);
    fireEvent.click(removeButton);

    expect(screen.queryByText(/test\.pdf/)).not.toBeInTheDocument();
  });

  it('sends message with file', async () => {
    render(<MessageInput {...defaultProps} />);
    const uploadButton = screen.getByLabelText(/upload/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    const input = uploadButton.nextElementSibling as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const sendButton = screen.getByRole('button');
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
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('clears input after sending', async () => {
    mockOnSendMessage.mockResolvedValue(undefined);
    render(<MessageInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Ketik pesan...');

    fireEvent.change(input, { target: { value: 'Test' } });
    const sendButton = screen.getByRole('button');
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
    const sendButton = screen.getByRole('button');
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
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      const drafts = localStorage.getItem(STORAGE_KEYS.MESSAGE_DRAFTS('test-msg-id'));
      expect(drafts).toBeDefined();
      const parsedDrafts = JSON.parse(drafts!);
      expect(parsedDrafts['test-msg-id']).toBe('');
    });
  });
});
