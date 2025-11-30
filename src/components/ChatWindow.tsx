
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, FeaturedProgram, LatestNews } from '../types';
import { Sender } from '../types';
import { getAIResponseStream, initialGreeting } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import MarkdownRenderer from './MarkdownRenderer';
import AutoResizeTextarea from './AutoResizeTextarea';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  isOpen: boolean;
  closeChat: () => void;
  // NEW: Receive current site data to make the AI aware of changes
  siteContext: {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, closeChat, siteContext }) => {
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
  }, [messages, input]); // Scroll when input grows too

  const handleSend = useCallback(async () => {
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
      // Send the current message, history, AND local site context to the AI
      const stream = getAIResponseStream(userMessageText, history, siteContext);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error streaming response:", error);
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
  }, [input, isLoading, history, siteContext]); // Added siteContext to dependencies

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-green-600 text-white flex-shrink-0">
        <div className="flex items-center">
            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
            <h2 className="font-bold text-lg">Asisten AI</h2>
        </div>
        <button onClick={closeChat} className="p-1 rounded-full hover:bg-white/20" aria-label="Tutup obrolan">
            <CloseIcon />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 custom-scrollbar">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end max-w-[85%] sm:max-w-[80%] gap-2 ${
                message.sender === Sender.User ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`rounded-2xl p-3 text-sm md:text-base ${
                  message.sender === Sender.User
                    ? 'bg-green-500 text-white rounded-br-lg whitespace-pre-wrap'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
                }`}
              >
                {message.sender === Sender.AI ? (
                    <MarkdownRenderer content={message.text} />
                ) : (
                    message.text
                )}

                 {isLoading && message.sender === Sender.AI && !message.text && (
                    <div className="mt-1">
                        <TypingIndicator />
                    </div>
                 )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <AutoResizeTextarea 
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={isLoading}
            placeholder="Ketik pertanyaan Anda..."
        />
      </div>
    </div>
  );
};

export default ChatWindow;
