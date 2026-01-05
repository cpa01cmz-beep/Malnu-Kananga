
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, FeaturedProgram, LatestNews } from '../types';
import { Sender } from '../types';
import { getAIResponseStream, initialGreeting } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { BrainIcon } from './icons/BrainIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import MarkdownRenderer from './MarkdownRenderer';
import AutoResizeTextarea from './AutoResizeTextarea';
import TypingIndicator from './TypingIndicator';
import VoiceInputButton from './VoiceInputButton';
import VoiceSettings from './VoiceSettings';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

import { ToastType } from './Toast';

interface ChatWindowProps {
  isOpen: boolean;
  closeChat: () => void;
  siteContext: {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
  };
  onShowToast?: (msg: string, type: ToastType) => void;
}

const MAX_HISTORY_SIZE = 20;
const MAX_MESSAGES_SIZE = 100;

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, closeChat, siteContext, onShowToast }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<{role: 'user' | 'model', parts: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [autoReadAI, setAutoReadAI] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{role: 'user' | 'model', parts: string}[]>([]);
  const lastAIResponseRef = useRef<string>('');

  const synthesis = useVoiceSynthesis();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
            { id: 'initial', text: initialGreeting, sender: Sender.AI }
        ]);
    }
    return () => {
        setHistory([]);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    if (isOpen) {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.VOICE_STORAGE_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setAutoReadAI(parsedSettings.autoReadAI || false);
        }
      } catch (error) {
        logger.error('Failed to load voice settings:', error);
      }
    }
  }, [isOpen]);

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
      const currentHistory = historyRef.current;
      const stream = getAIResponseStream(userMessageText, currentHistory, siteContext, isThinkingMode);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
      
      lastAIResponseRef.current = fullResponse;
      
      if (autoReadAI && synthesis.isSupported && fullResponse) {
        synthesis.speak(fullResponse);
      }
    } catch (error) {
      logger.error("Error streaming response:", error);
      const errorMessage = "Maaf, terjadi kesalahan. Silakan coba lagi.";
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
        )
      );
      fullResponse = errorMessage;
    } finally {
      setIsLoading(false);
      setHistory(prev => {
        const newHistory = [...prev, 
          { role: 'user', parts: userMessageText },
          { role: 'model', parts: fullResponse }
        ];
        // Limit history size to prevent memory leaks
        const limitedHistory = newHistory.length > MAX_HISTORY_SIZE 
          ? newHistory.slice(-MAX_HISTORY_SIZE)
          : newHistory;
        historyRef.current = limitedHistory;
        return limitedHistory;
      });
      
      // Limit messages size to prevent memory leaks
      setMessages(prev => {
        if (prev.length > MAX_MESSAGES_SIZE) {
          return prev.slice(-MAX_MESSAGES_SIZE);
        }
        return prev;
      });
    }
  }, [input, isLoading, siteContext, isThinkingMode, autoReadAI, synthesis]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-green-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full mr-1 animate-pulse"></div>
            <h2 className="font-bold text-lg">Asisten AI</h2>
        </div>
        <div className="flex items-center gap-2">
            {/* Voice Settings */}
            {synthesis.isSupported && (
              <button
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-2 rounded-full transition-all flex items-center gap-1 ${showVoiceSettings ? 'bg-white text-green-700 shadow-md' : 'bg-green-700 text-green-200 hover:bg-green-800'}`}
                title="Pengaturan Suara"
                aria-label="Buka pengaturan suara"
              >
                <SpeakerWaveIcon className="w-5 h-5" />
              </button>
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
        <div className="flex items-end gap-2">
          <AutoResizeTextarea 
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={isLoading}
              placeholder={isThinkingMode ? "Ketik pertanyaan kompleks..." : "Ketik pertanyaan Anda..."}
          />
          <VoiceInputButton
            onTranscript={(transcript) => {
              setInput(transcript);
            }}
            disabled={isLoading}
            onError={(error) => {
              logger.error('Voice input error:', error);
              // Show a brief toast message for voice errors
              if (error && !error.includes('tidak mendukung')) {
                // You could integrate with a toast notification system here
                console.log('Voice Error:', error);
              }
            }}
          />
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings isOpen={showVoiceSettings} onClose={() => setShowVoiceSettings(false)} onShowToast={onShowToast} />
    </div>
  );
};

export default ChatWindow;
