import React, { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import { XMarkIcon } from './icons/MaterialIcons';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { STORAGE_KEYS, FILE_SIZE_LIMITS, BYTES_PER_KB, UI_DIMENSIONS, TEXT_LIMITS } from '../constants';
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
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shortcutHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (replyTo && message) {
      const draftsJSON = localStorage.getItem(STORAGE_KEYS.MESSAGE_DRAFTS(replyTo.id));
      const drafts = draftsJSON ? JSON.parse(draftsJSON) : {};
      drafts[replyTo.id] = message;
      localStorage.setItem(STORAGE_KEYS.MESSAGE_DRAFTS(replyTo.id), JSON.stringify(drafts));
    }
  }, [message, replyTo]);

  useEffect(() => {
    return () => {
      if (shortcutHintTimeoutRef.current) {
        clearTimeout(shortcutHintTimeoutRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > FILE_SIZE_LIMITS.MATERIAL_DEFAULT) {
        logger.warn('Ukuran file maksimal 50MB');
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

  const handleClear = () => {
    setMessage('');
    textareaRef.current?.focus();
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
    if (e.key === 'Escape' && message.length > 0) {
      e.preventDefault();
      handleClear();
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
            aria-label="Batalkan balasan"
            title="Batalkan balasan"
            className="text-gray-400 transition-colors duration-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
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
          <span className="text-gray-500">({(file.size / BYTES_PER_KB).toFixed(1)} KB)</span>
          <button
            type="button"
            onClick={handleRemoveFile}
            aria-label={`Hapus file ${file.name}`}
            title="Hapus file"
            className="text-blue-600 transition-colors duration-200 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
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
          aria-label="Lampirkan file"
          title="Lampirkan file (gambar, PDF, dokumen)"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </Button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            aria-disabled={disabled || isSending}
            rows={1}
            maxLength={TEXT_LIMITS.MESSAGE_MAX_LENGTH}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-700"
            style={{ minHeight: UI_DIMENSIONS.TEXTAREA.MIN_HEIGHT, maxHeight: UI_DIMENSIONS.TEXTAREA.MAX_HEIGHT }}
          />

          {message.length > 0 && !disabled && !isSending && (
            <>
              <button
                type="button"
                onClick={handleClear}
                onMouseEnter={() => {
                  setShowClearTooltip(true);
                  shortcutHintTimeoutRef.current = setTimeout(() => {
                    setShowShortcutHint(true);
                  }, 400);
                }}
                onMouseLeave={() => {
                  setShowClearTooltip(false);
                  setShowShortcutHint(false);
                  if (shortcutHintTimeoutRef.current) {
                    clearTimeout(shortcutHintTimeoutRef.current);
                    shortcutHintTimeoutRef.current = null;
                  }
                }}
                onFocus={() => {
                  setShowClearTooltip(true);
                  shortcutHintTimeoutRef.current = setTimeout(() => {
                    setShowShortcutHint(true);
                  }, 400);
                }}
                onBlur={() => {
                  setShowClearTooltip(false);
                  setShowShortcutHint(false);
                  if (shortcutHintTimeoutRef.current) {
                    clearTimeout(shortcutHintTimeoutRef.current);
                    shortcutHintTimeoutRef.current = null;
                  }
                }}
                className={`absolute right-2 top-2 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 active:scale-95 transition-all duration-200 ${prefersReducedMotion ? '' : 'hover:scale-110'}`}
                aria-label="Bersihkan pesan (Tekan Escape)"
                aria-describedby={showClearTooltip ? 'clear-tooltip-message' : undefined}
              >
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </button>

              {showClearTooltip && (
                <div
                  id="clear-tooltip-message"
                  role="tooltip"
                  className={`absolute right-2 top-10 z-20 px-2.5 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap ${prefersReducedMotion ? '' : 'animate-in fade-in slide-in-from-top-1 duration-150'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>Bersihkan</span>
                    <kbd className="px-1.5 py-0.5 bg-neutral-600 dark:bg-neutral-600 rounded text-[10px] font-mono border border-neutral-500">Esc</kbd>
                  </span>
                  <span className="absolute -top-1 right-3 w-2 h-2 bg-neutral-800 dark:bg-neutral-700 rotate-45" aria-hidden="true" />
                </div>
              )}

              {showShortcutHint && (
                <div
                  role="tooltip"
                  className={`absolute right-2 top-[4.5rem] z-20 px-2 py-1 bg-neutral-700 dark:bg-neutral-600 text-white text-[10px] rounded shadow-lg whitespace-nowrap ${prefersReducedMotion ? '' : 'animate-in fade-in slide-in-from-top-1 duration-150'}`}
                >
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-neutral-500 dark:bg-neutral-500 rounded text-[9px] font-mono border border-neutral-400">Esc</kbd>
                    <span>shortcut</span>
                  </span>
                  <span className="absolute -top-1 right-3 w-1.5 h-1.5 bg-neutral-700 dark:bg-neutral-600 rotate-45" aria-hidden="true" />
                </div>
              )}
            </>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || isSending || (!message.trim() && !file)}
          aria-label={isSending ? 'Mengirim pesan...' : 'Kirim pesan'}
          aria-busy={isSending}
          shortcut="Enter"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSending ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="sr-only">Mengirim pesan...</span>
            </>
          ) : (
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
