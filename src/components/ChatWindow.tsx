
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, FeaturedProgram, LatestNews } from '../types';
import { Sender } from '../types';
import { getAIResponseStream, initialGreeting } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { BrainIcon } from './icons/BrainIcon';
import MarkdownRenderer from './MarkdownRenderer';
import AutoResizeTextarea from './AutoResizeTextarea';
import TypingIndicator from './TypingIndicator';
import FlashCardDeck from './FlashCardDeck';
import AIQuizGenerator from './AIQuizGenerator';

type ChatMode = 'chat' | 'flashcards' | 'quiz';

interface ChatWindowProps {
  isOpen: boolean;
  closeChat: () => void;
  siteContext: {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, closeChat, siteContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<{role: 'user' | 'model', parts: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('chat');
  const [learningTopic, setLearningTopic] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartFlashCards = () => {
    if (learningTopic) {
      setChatMode('flashcards');
    }
  };

  const handleStartQuiz = () => {
    if (learningTopic) {
      setChatMode('quiz');
    }
  };

  const handleBackToChat = () => {
    setChatMode('chat');
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
  }, [messages, input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    const userMessage: ChatMessage = { id: Date.now().toString(), text: userMessageText, sender: Sender.User };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: Sender.AI }]);

    let fullResponse = "";
    try {
      // Pass isThinkingMode to the service
      const stream = getAIResponseStream(userMessageText, history, siteContext, isThinkingMode);
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
      fullResponse = errorMessage;
    } finally {
      setIsLoading(false);
      setHistory(prev => [...prev,
        { role: 'user', parts: userMessageText },
        { role: 'model', parts: fullResponse }
      ]);

      // Auto-detect learning topic keywords and set learningTopic
      const learningKeywords = ['belajar', 'materi', 'topik', 'konsep', 'pelajaran', 'soal', 'latihan'];
      const hasLearningKeyword = learningKeywords.some(keyword =>
        userMessageText.toLowerCase().includes(keyword)
      );
      if (hasLearningKeyword) {
        const words = userMessageText.split(' ');
        const topic = words.slice(1).join(' ').replace(/[?!.]/g, '');
        if (topic.length > 2) {
          setLearningTopic(topic);
        }
      }
    }
  }, [input, isLoading, history, siteContext, isThinkingMode]);

  if (chatMode === 'flashcards') {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-purple-600 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={handleBackToChat} className="p-1 rounded-full hover:bg-white/20 mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-3 h-3 bg-white rounded-full mr-1 animate-pulse"></div>
            <h2 className="font-bold text-lg">Flash Cards</h2>
          </div>
          <button onClick={closeChat} className="p-1 rounded-full hover:bg-white/20">
            <CloseIcon />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 custom-scrollbar p-4">
          <FlashCardDeck
            topic={learningTopic}
            subject="Umum"
            onClose={handleBackToChat}
          />
        </div>
      </div>
    );
  }

  if (chatMode === 'quiz') {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-blue-600 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={handleBackToChat} className="p-1 rounded-full hover:bg-white/20 mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-3 h-3 bg-white rounded-full mr-1 animate-pulse"></div>
            <h2 className="font-bold text-lg">Kuis AI</h2>
          </div>
          <button onClick={closeChat} className="p-1 rounded-full hover:bg-white/20">
            <CloseIcon />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 custom-scrollbar p-4">
          <AIQuizGenerator
            topic={learningTopic}
            onClose={handleBackToChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-green-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full mr-1 animate-pulse"></div>
            <h2 className="font-bold text-lg">Asisten AI</h2>
        </div>
        <div className="flex items-center gap-2">
            {/* Learning Mode Buttons */}
            {learningTopic && (
              <>
                <button
                  onClick={handleStartFlashCards}
                  className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-all flex items-center gap-1"
                  title="Flash Cards"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-xs font-bold px-1">Cards</span>
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center gap-1"
                  title="Kuis"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xs font-bold px-1">Quiz</span>
                </button>
              </>
            )}
            {/* Thinking Mode Toggle */}
            <button
                onClick={() => setIsThinkingMode(!isThinkingMode)}
                className={`p-2 rounded-full transition-all flex items-center gap-1 ${isThinkingMode ? 'bg-white text-green-700 shadow-md' : 'bg-green-700 text-green-200 hover:bg-green-800'}`}
                title={isThinkingMode ? "Mode Berpikir Dalam: Aktif" : "Aktifkan Mode Berpikir Dalam"}
            >
                <BrainIcon className="w-5 h-5" />
                {isThinkingMode && <span className="text-xs font-bold px-1">Thinking</span>}
            </button>

            <button onClick={closeChat} className="p-1 rounded-full hover:bg-white/20" aria-label="Tutup obrolan">
                <CloseIcon />
            </button>
        </div>
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
                        {isThinkingMode && <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-1">Sedang berpikir mendalam...</span>}
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
            placeholder={isThinkingMode ? "Ketik pertanyaan kompleks..." : "Ketik pertanyaan Anda..."}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
