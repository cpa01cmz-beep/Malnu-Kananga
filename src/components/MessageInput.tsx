import React, { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import { STORAGE_KEYS } from '../constants';
import type { User } from '../types';
import { logger } from '../utils/logger';

interface MessageInputProps {
  currentUser?: User;
  onSendMessage: (content: string, file?: File) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  replyTo?: { id: string; content: string; senderName: string };
  onCancelReply?: () => void;
}

export function MessageInput({ onSendMessage, disabled, placeholder = 'Ketik pesan...', replyTo, onCancelReply }: MessageInputProps) {
  const [message, setMessage] = useState<string>(() => {
    if (replyTo) {
      const draftsJSON = localStorage.getItem(STORAGE_KEYS.MESSAGE_DRAFTS(replyTo.id));
      if (draftsJSON) {
        const drafts = JSON.parse(draftsJSON);
        return drafts[replyTo.id] || '';
      }
    }
    return '';
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyTo && message) {
      const draftsJSON = localStorage.getItem(STORAGE_KEYS.MESSAGE_DRAFTS(replyTo.id));
      const drafts = draftsJSON ? JSON.parse(draftsJSON) : {};
      drafts[replyTo.id] = message;
      localStorage.setItem(STORAGE_KEYS.MESSAGE_DRAFTS(replyTo.id), JSON.stringify(drafts));
    }
  }, [message, replyTo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        logger.warn('Ukuran file maksimal 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !file) || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim(), file || undefined);
      setMessage('');
      setFile(null);
      if (replyTo?.id) {
        localStorage.setItem(STORAGE_KEYS.MESSAGE_DRAFTS(replyTo.id), JSON.stringify({}));
        onCancelReply?.();
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      logger.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Membalas:</span>
            <span className="font-medium">{replyTo.senderName}</span>
            <span className="text-gray-500">-</span>
            <span className="text-gray-600">{replyTo.content}</span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-sm">
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="truncate text-blue-800">{file.name}</span>
          <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </Button>

        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || isSending || (!message.trim() && !file)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSending ? (
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
