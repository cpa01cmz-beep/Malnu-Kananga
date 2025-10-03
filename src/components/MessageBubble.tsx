import React from 'react';
import { ChatMessage, Sender } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex items-end max-w-xs md:max-w-md gap-2 ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      <div
        className={`rounded-2xl p-3 text-sm md:text-base ${
          isUser
            ? 'bg-green-500 text-white rounded-br-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
        }`}
      >
        {message.text}
        {isLoading && !message.text && (
          <div className="flex items-center justify-center space-x-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;