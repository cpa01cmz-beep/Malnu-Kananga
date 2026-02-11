import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChatWindow from '../ChatWindow';

vi.mock('../hooks/useWebSocket');
vi.mock('../../services/apiService');

describe('ChatWindow Component', () => {
  const mockOnClose = vi.fn();
  const mockOnShowToast = vi.fn();

  const defaultProps = {
    onClose: mockOnClose,
    onShowToast: mockOnShowToast,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => render(<ChatWindow {...defaultProps} />)).not.toThrow();
  });

  it('should display chat interface', () => {
    render(<ChatWindow {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  it('should show send button', () => {
    render(<ChatWindow {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should handle message input', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(messageInput, { target: { value: 'Hello world' } });
    
    expect(messageInput).toHaveValue('Hello world');
  });

  it('should send message on button click', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    expect(messageInput).toHaveValue('');
  });

  it('should send message on Enter key', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.keyDown(messageInput, { key: 'Enter' });
    
    expect(messageInput).toHaveValue('');
  });

  it('should not send message on Shift+Enter', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    
    fireEvent.change(messageInput, { target: { value: 'Test message\nwith new line' } });
    fireEvent.keyDown(messageInput, { key: 'Enter', shiftKey: true });
    
    expect(messageInput).toHaveValue('Test message\nwith new line');
  });

  it('should handle close button', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display typing indicator when user is typing', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(messageInput, { target: { value: 'typing' } });
    
    expect(screen.getByText(/typing/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    expect(messageInput).toHaveAttribute('aria-label', 'message input');
  });

  it('should handle emoji picker', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const emojiButton = screen.getByRole('button', { name: /emoji/i });
    fireEvent.click(emojiButton);
    
    expect(screen.getByText(/smile/i)).toBeInTheDocument();
  });

  it('should handle file upload', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const fileButton = screen.getByRole('button', { name: /attach file/i });
    fireEvent.click(fileButton);
    
    expect(screen.getByText(/upload file/i)).toBeInTheDocument();
  });
});