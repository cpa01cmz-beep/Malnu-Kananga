import React from 'react';
import { SendIcon } from './icons/SendIcon';
import { useTouchFeedback } from '../hooks/useTouchFeedback';

interface ChatInputProps {
  input: string;
  onInputChange: { (value: string): void };
  onSend: { (e?: React.FormEvent): void };
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, onInputChange, onSend, isLoading }) => {
  const { handleTouchFeedback } = useTouchFeedback();

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <form onSubmit={onSend} className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ketik pertanyaan Anda..."
          className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 text-base touch-optimized"
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="on"
          spellCheck="true"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          onTouchStart={handleTouchFeedback}
          className="p-3 bg-blue-600 text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-optimized min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={isLoading ? "Mengirim pesan..." : "Kirim pesan"}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SendIcon />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;