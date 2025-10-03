
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { Sender } from '../types';
import { getAIResponseStream, initialGreeting } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { CloseIcon } from './icons/CloseIcon'; // Import CloseIcon

interface ChatWindowProps {
  isOpen: boolean;
  closeChat: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, closeChat }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State to store the conversation history for the LLM
  const [history, setHistory] = useState<{role: 'user' | 'model', parts: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
            { id: 'initial', text: initialGreeting, sender: Sender.AI }
        ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    const userMessage: ChatMessage = { id: Date.now().toString(), text: userMessageText, sender: Sender.User };
    
    // Add user message to the UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add a placeholder for the AI response to the UI
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: Sender.AI }]);
    
    let fullResponse = "";
    try {
      // Send the current message and the previous history to the AI
      const stream = getAIResponseStream(userMessageText, history);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      const errorMessage = "Maaf, terjadi kesalahan. Silakan coba lagi.";
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
        )
      );
      fullResponse = errorMessage; // Ensure the history records the error
    } finally {
      setIsLoading(false);
      // Once the response is complete, update the history with both the user's message and the AI's full response.
      setHistory(prev => [...prev, 
        { role: 'user', parts: userMessageText },
        { role: 'model', parts: fullResponse }
      ]);
    }
  }, [input, isLoading, history]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-green-600 text-white">
        <div className="flex items-center">
            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
            <h2 className="font-bold text-lg">Asisten AI</h2>
        </div>
        <button onClick={closeChat} className="p-1 rounded-full hover:bg-white/20" aria-label="Tutup obrolan">
            <CloseIcon />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end max-w-xs md:max-w-md gap-2 ${
                message.sender === Sender.User ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`rounded-2xl p-3 text-sm md:text-base ${
                  message.sender === Sender.User
                    ? 'bg-green-500 text-white rounded-br-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
                }`}
              >
                {message.text}
                 {isLoading && message.sender === Sender.AI && !message.text && (
                    <div className="flex items-center justify-center space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </div>
                 )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-gray-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-green-600 text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Kirim pesan"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;