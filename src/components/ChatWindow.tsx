
import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ConnectionStatus from './ConnectionStatus';
import { useChatLogic } from '../hooks/useChatLogic';
import { useTouchGestures } from '../hooks/useTouchGestures';

interface ChatWindowProps {
  isOpen: boolean;
  closeChat: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, closeChat }) => {
  const { messages, input, setInput, isLoading, handleSend } = useChatLogic(isOpen);

<<<<<<< HEAD
  const { ref: elementRef } = useTouchGestures({
=======
  const gestureResult = useTouchGestures({
>>>>>>> origin/main
    onSwipeDown: closeChat,
    onSwipeRight: closeChat,
  });
  const elementRef = gestureResult.elementRef as React.RefObject<HTMLDivElement>;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={elementRef}
      className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden touch-optimized"
    >
      <ChatHeader onClose={closeChat} />
      
      {/* Connection Status */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <ConnectionStatus />
      </div>
      
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
      />

      {/* Mobile swipe indicator */}
      <div className="md:hidden px-4 py-2 text-center border-t border-gray-100 dark:border-gray-700">
        <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span>Gesek ke bawah untuk menutup</span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;